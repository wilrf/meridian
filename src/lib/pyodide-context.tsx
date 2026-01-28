'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from 'react'

// =============================================================================
// Types
// =============================================================================

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
  /** Manually trigger Pyodide initialization */
  initialize: () => void
  runCode: (code: string) => Promise<RunResult>
  validateCode: (userCode: string, validateCode: string) => Promise<ValidationResult>
  checkExpected: (userCode: string, expected: string) => Promise<ValidationResult>
  loadPackages: (packages: string[]) => Promise<void>
  restartWorker: () => void
}

// =============================================================================
// Constants
// =============================================================================

const TIMEOUT_GRACE_MS = 1000
const EXECUTION_TIMEOUT_MS = 5000

// =============================================================================
// Context
// =============================================================================

const PyodideContext = createContext<PyodideContextValue | null>(null)

export function usePyodide() {
  const context = useContext(PyodideContext)
  if (!context) {
    throw new Error('usePyodide must be used within a PyodideProvider')
  }
  return context
}

// =============================================================================
// Provider
// =============================================================================

interface PyodideProviderProps {
  children: ReactNode
  /** If true, Pyodide loads immediately. If false, waits for initialize() call. */
  eager?: boolean
}

export function PyodideProvider({ children, eager = false }: PyodideProviderProps) {
  const [state, setState] = useState<PyodideState>({
    status: 'idle',
    error: null,
    loadingProgress: '',
  })

  // Refs for stable access across closures
  const statusRef = useRef<PyodideState['status']>('idle')
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>>(
    new Map()
  )
  const messageIdRef = useRef(0)
  const timeoutGraceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializationStartedRef = useRef(false)

  // Keep status ref in sync
  useEffect(() => {
    statusRef.current = state.status
  }, [state.status])

  // =============================================================================
  // Worker Management
  // =============================================================================

  const clearPendingPromises = useCallback((errorMessage: string) => {
    pendingRef.current.forEach(({ reject }) => {
      reject(new Error(errorMessage))
    })
    pendingRef.current.clear()
  }, [])

  const terminateWorker = useCallback(() => {
    if (timeoutGraceRef.current) {
      clearTimeout(timeoutGraceRef.current)
      timeoutGraceRef.current = null
    }
    clearPendingPromises('Worker terminated')
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [clearPendingPromises])

  // Send message helper (stored in ref for stable reference)
  const sendMessageRef = useRef<(<T>(type: string, payload: Record<string, unknown>) => Promise<T>) | null>(null)

  /**
   * Initialize the Pyodide worker
   * This is the main entry point - called either eagerly or lazily
   */
  const initializeWorker = useCallback(() => {
    if (typeof window === 'undefined') return
    if (initializationStartedRef.current) return // Prevent double initialization
    
    initializationStartedRef.current = true
    
    // Clean up existing worker
    terminateWorker()

    setState(s => ({ ...s, status: 'loading', loadingProgress: 'Starting Python runtime...' }))

    const worker = new Worker('/workers/pyodide.worker.js')
    workerRef.current = worker

    // Set up message handler
    sendMessageRef.current = <T,>(type: string, payload: Record<string, unknown>): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'))
          return
        }
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

    worker.onmessage = (event) => {
      const { id, type, success, result, error } = event.data

      // Handle ready signal - initialize Pyodide
      if (type === 'ready') {
        setState(s => ({ ...s, loadingProgress: 'Loading Python (~10MB)...' }))
        
        sendMessageRef.current?.('init', {})
          .then(() => {
            setState({
              status: 'ready',
              error: null,
              loadingProgress: '',
            })
          })
          .catch((err) => {
            setState({
              status: 'error',
              error: err.message || 'Failed to initialize',
              loadingProgress: '',
            })
          })
        return
      }

      // Handle timeout warning
      if (type === 'timeout_warning') {
        if (timeoutGraceRef.current) {
          clearTimeout(timeoutGraceRef.current)
        }
        timeoutGraceRef.current = setTimeout(() => {
          console.warn('Worker timeout, restarting...')
          initializationStartedRef.current = false
          terminateWorker()
          setState({ status: 'loading', error: null, loadingProgress: 'Restarting Python...' })
          initializeWorker()
        }, TIMEOUT_GRACE_MS)
        return
      }

      // Handle package loading notification
      if (type === 'loading_packages') {
        const packages = event.data.packages as string[]
        setState(s => ({ ...s, loadingProgress: `Loading ${packages.join(', ')}...` }))
        return
      }

      // Handle responses
      const pending = pendingRef.current.get(id)
      if (pending) {
        pendingRef.current.delete(id)
        if (timeoutGraceRef.current) {
          clearTimeout(timeoutGraceRef.current)
          timeoutGraceRef.current = null
        }
        // Clear loading progress when response arrives
        setState(s => ({ ...s, loadingProgress: '' }))
        if (success) {
          pending.resolve(result)
        } else {
          pending.reject(new Error(error))
        }
      }
    }

    worker.onerror = (error) => {
      clearPendingPromises(`Worker error: ${error.message || 'Unknown error'}`)
      setState({
        status: 'error',
        error: error.message || 'Worker error',
        loadingProgress: '',
      })
    }
  }, [terminateWorker, clearPendingPromises])

  // =============================================================================
  // Public API
  // =============================================================================

  /**
   * Manually trigger initialization (for lazy loading)
   */
  const initialize = useCallback(() => {
    if (state.status === 'idle') {
      initializeWorker()
    }
  }, [state.status, initializeWorker])

  /**
   * Run Python code
   */
  const runCode = useCallback(async (code: string): Promise<RunResult> => {
    // Auto-initialize if not started
    if (statusRef.current === 'idle') {
      initializeWorker()
      // Wait a bit for initialization to start
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (statusRef.current !== 'ready') {
      const message = statusRef.current === 'error'
        ? 'Python encountered an error. Try refreshing the page.'
        : statusRef.current === 'loading'
        ? 'Python is loading, please wait...'
        : 'Python is not ready yet.'
      return { success: false, stdout: '', stderr: message }
    }

    try {
      const sendMessage = sendMessageRef.current
      if (!sendMessage) {
        return { success: false, stdout: '', stderr: 'Python runtime not initialized' }
      }
      return await sendMessage<RunResult>('run', { code, timeout: EXECUTION_TIMEOUT_MS })
    } catch (error) {
      return {
        success: false,
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
      }
    }
  }, [initializeWorker])

  /**
   * Validate code with assertion
   */
  const validateCode = useCallback(async (userCode: string, validateCodeStr: string): Promise<ValidationResult> => {
    if (statusRef.current === 'idle') {
      initializeWorker()
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (statusRef.current !== 'ready') {
      return {
        passed: false,
        message: statusRef.current === 'error'
          ? 'Python encountered an error. Try refreshing the page.'
          : 'Python is not ready yet',
        stdout: '',
      }
    }

    try {
      const sendMessage = sendMessageRef.current
      if (!sendMessage) {
        return { passed: false, message: 'Python runtime not initialized', stdout: '' }
      }
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
  }, [initializeWorker])

  /**
   * Check expected output
   */
  const checkExpected = useCallback(async (userCode: string, expected: string): Promise<ValidationResult> => {
    const result = await runCode(userCode)

    if (!result.success) {
      return { passed: false, message: result.stderr, stdout: result.stdout }
    }

    const actualOutput = result.stdout.trim()
    const expectedOutput = expected.trim()

    if (actualOutput === expectedOutput) {
      return { passed: true, message: 'Correct!', stdout: result.stdout }
    } else {
      return {
        passed: false,
        message: `Expected output: "${expectedOutput}"\nActual output: "${actualOutput}"`,
        stdout: result.stdout,
      }
    }
  }, [runCode])

  /**
   * Load additional packages
   */
  const loadPackages = useCallback(async (packages: string[]): Promise<void> => {
    if (statusRef.current !== 'ready') {
      throw new Error('Python is not ready yet')
    }

    setState(s => ({ ...s, loadingProgress: `Loading ${packages.join(', ')}...` }))

    try {
      const sendMessage = sendMessageRef.current
      if (!sendMessage) {
        throw new Error('Python runtime not initialized')
      }
      await sendMessage('loadPackages', { packages })
    } finally {
      setState(s => ({ ...s, loadingProgress: '' }))
    }
  }, [])

  /**
   * Restart the worker
   */
  const restartWorker = useCallback(() => {
    initializationStartedRef.current = false
    terminateWorker()
    setState({ status: 'loading', error: null, loadingProgress: 'Restarting Python...' })
    initializeWorker()
  }, [terminateWorker, initializeWorker])

  // =============================================================================
  // Lifecycle
  // =============================================================================

  // Eager initialization if requested
  useEffect(() => {
    if (eager) {
      initializeWorker()
    }

    return () => {
      terminateWorker()
    }
  }, [eager, initializeWorker, terminateWorker])

  // =============================================================================
  // Render
  // =============================================================================

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      state,
      initialize,
      runCode,
      validateCode,
      checkExpected,
      loadPackages,
      restartWorker,
    }),
    [state, initialize, runCode, validateCode, checkExpected, loadPackages, restartWorker]
  )

  return (
    <PyodideContext.Provider value={value}>
      {children}
    </PyodideContext.Provider>
  )
}
