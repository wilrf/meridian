'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'

interface PyodideState {
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  loadingProgress: string
}

interface RunResult {
  success: boolean
  stdout: string
  stderr: string
}

interface ValidationResult {
  passed: boolean
  message: string
  stdout: string
}

interface PyodideContextValue {
  state: PyodideState
  runCode: (code: string) => Promise<RunResult>
  validateCode: (userCode: string, validateCode: string) => Promise<ValidationResult>
  checkExpected: (userCode: string, expected: string) => Promise<ValidationResult>
  loadPackages: (packages: string[]) => Promise<void>
  restartWorker: () => void
}

const PyodideContext = createContext<PyodideContextValue | null>(null)

// Grace period after timeout before terminating worker
const TIMEOUT_GRACE_MS = 1000
const EXECUTION_TIMEOUT_MS = 5000

export function usePyodide() {
  const context = useContext(PyodideContext)
  if (!context) {
    throw new Error('usePyodide must be used within a PyodideProvider')
  }
  return context
}

interface PyodideProviderProps {
  children: ReactNode
}

export function PyodideProvider({ children }: PyodideProviderProps) {
  const [state, setState] = useState<PyodideState>({
    status: 'idle',
    error: null,
    loadingProgress: '',
  })

  // Use ref for status to avoid stale closure issues
  const statusRef = useRef<PyodideState['status']>('idle')
  useEffect(() => {
    statusRef.current = state.status
  }, [state.status])

  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>>(
    new Map()
  )
  const messageIdRef = useRef(0)
  const timeoutGraceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Clear all pending promises (on error or termination)
   */
  const clearPendingPromises = useCallback((errorMessage: string) => {
    pendingRef.current.forEach(({ reject }) => {
      reject(new Error(errorMessage))
    })
    pendingRef.current.clear()
  }, [])

  /**
   * Terminate current worker and restart
   */
  const terminateAndRestart = useCallback(() => {
    // Clear any grace period timeout
    if (timeoutGraceRef.current) {
      clearTimeout(timeoutGraceRef.current)
      timeoutGraceRef.current = null
    }

    // Reject all pending promises
    clearPendingPromises('Worker terminated due to timeout')

    // Terminate current worker
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }

    // Restart will happen via initializeWorker
    setState({
      status: 'loading',
      error: null,
      loadingProgress: 'Restarting Python...',
    })
  }, [clearPendingPromises])

  // Send message to worker and wait for response (stable reference via ref)
  const sendMessageRef = useRef<(<T>(type: string, payload: Record<string, unknown>) => Promise<T>) | null>(null)

  sendMessageRef.current = <T,>(type: string, payload: Record<string, unknown>): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      // Check current status via ref (not stale closure)
      if (statusRef.current === 'error') {
        reject(new Error('Worker is in error state'))
        return
      }

      const id = ++messageIdRef.current
      pendingRef.current.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      })
      workerRef.current.postMessage({ id, type, payload })
    })
  }

  /**
   * Initialize the worker
   */
  const initializeWorker = useCallback(() => {
    if (typeof window === 'undefined') return

    // Clean up existing worker if any
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }

    setState((s) => ({ ...s, status: 'loading', loadingProgress: 'Starting Python...' }))

    const worker = new Worker('/workers/pyodide.worker.js')
    workerRef.current = worker

    worker.onmessage = (event) => {
      const { id, type, success, result, error } = event.data

      // Handle ready signal
      if (type === 'ready') {
        // Initialize Pyodide
        sendMessageRef.current?.('init', {}).then(() => {
          setState({
            status: 'ready',
            error: null,
            loadingProgress: '',
          })
        }).catch((err) => {
          setState({
            status: 'error',
            error: err.message || 'Failed to initialize',
            loadingProgress: '',
          })
        })
        return
      }

      // Handle timeout warning from worker
      if (type === 'timeout_warning') {
        // Give worker a grace period, then terminate if still stuck
        if (timeoutGraceRef.current) {
          clearTimeout(timeoutGraceRef.current)
        }
        timeoutGraceRef.current = setTimeout(() => {
          console.warn('Worker did not respond after timeout grace period, restarting...')
          terminateAndRestart()
          // Re-initialize after termination
          initializeWorker()
        }, TIMEOUT_GRACE_MS)
        return
      }

      // Handle responses to our messages
      const pending = pendingRef.current.get(id)
      if (pending) {
        pendingRef.current.delete(id)

        // Clear grace period if we got a response
        if (timeoutGraceRef.current) {
          clearTimeout(timeoutGraceRef.current)
          timeoutGraceRef.current = null
        }

        if (success) {
          pending.resolve(result)
        } else {
          pending.reject(new Error(error))
        }
      }
    }

    worker.onerror = (error) => {
      // Clear all pending promises to prevent memory leaks
      clearPendingPromises(`Worker error: ${error.message || 'Unknown error'}`)

      setState({
        status: 'error',
        error: error.message || 'Worker error',
        loadingProgress: '',
      })
    }
  }, [clearPendingPromises, terminateAndRestart])

  // Initialize worker on mount
  useEffect(() => {
    initializeWorker()

    return () => {
      // Clean up on unmount
      if (timeoutGraceRef.current) {
        clearTimeout(timeoutGraceRef.current)
      }

      // Reject all pending promises before termination
      clearPendingPromises('Worker terminated')

      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [initializeWorker, clearPendingPromises])

  // Stable sendMessage wrapper
  const sendMessage = useCallback(
    <T,>(type: string, payload: Record<string, unknown>): Promise<T> => {
      if (!sendMessageRef.current) {
        return Promise.reject(new Error('Not initialized'))
      }
      return sendMessageRef.current(type, payload)
    },
    []
  )

  // Run Python code
  const runCode = useCallback(
    async (code: string): Promise<RunResult> => {
      // Use ref to avoid stale closure
      const currentStatus = statusRef.current

      if (currentStatus !== 'ready') {
        const message = currentStatus === 'error'
          ? 'Python encountered an error. Try refreshing the page.'
          : 'Python is not ready yet. Please wait...'
        return {
          success: false,
          stdout: '',
          stderr: message,
        }
      }

      try {
        return await sendMessage<RunResult>('run', { code, timeout: EXECUTION_TIMEOUT_MS })
      } catch (error) {
        return {
          success: false,
          stdout: '',
          stderr: error instanceof Error ? error.message : String(error),
        }
      }
    },
    [sendMessage]
  )

  // Validate code with assertion
  const validateCode = useCallback(
    async (userCode: string, validateCodeStr: string): Promise<ValidationResult> => {
      const currentStatus = statusRef.current

      if (currentStatus !== 'ready') {
        return {
          passed: false,
          message: currentStatus === 'error'
            ? 'Python encountered an error. Try refreshing the page.'
            : 'Python is not ready yet',
          stdout: '',
        }
      }

      try {
        return await sendMessage<ValidationResult>('validate', {
          userCode,
          validateCode: validateCodeStr,
          timeout: EXECUTION_TIMEOUT_MS,
        })
      } catch (error) {
        return {
          passed: false,
          message: error instanceof Error ? error.message : String(error),
          stdout: '',
        }
      }
    },
    [sendMessage]
  )

  // Check expected output
  const checkExpected = useCallback(
    async (userCode: string, expected: string): Promise<ValidationResult> => {
      const result = await runCode(userCode)

      if (!result.success) {
        return {
          passed: false,
          message: result.stderr,
          stdout: result.stdout,
        }
      }

      const actualOutput = result.stdout.trim()
      const expectedOutput = expected.trim()

      if (actualOutput === expectedOutput) {
        return {
          passed: true,
          message: 'Correct!',
          stdout: result.stdout,
        }
      } else {
        return {
          passed: false,
          message: `Expected output: "${expectedOutput}"\nActual output: "${actualOutput}"`,
          stdout: result.stdout,
        }
      }
    },
    [runCode]
  )

  // Load packages
  const loadPackages = useCallback(
    async (packages: string[]): Promise<void> => {
      const currentStatus = statusRef.current

      if (currentStatus !== 'ready') {
        throw new Error('Python is not ready yet')
      }

      setState((s) => ({
        ...s,
        loadingProgress: `Loading ${packages.join(', ')}...`,
      }))

      try {
        await sendMessage('loadPackages', { packages })
      } finally {
        setState((s) => ({ ...s, loadingProgress: '' }))
      }
    },
    [sendMessage]
  )

  // Manual restart
  const restartWorker = useCallback(() => {
    terminateAndRestart()
    initializeWorker()
  }, [terminateAndRestart, initializeWorker])

  const value: PyodideContextValue = {
    state,
    runCode,
    validateCode,
    checkExpected,
    loadPackages,
    restartWorker,
  }

  return (
    <PyodideContext.Provider value={value}>{children}</PyodideContext.Provider>
  )
}
