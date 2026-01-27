// Pyodide Web Worker
// Runs Python code in a separate thread to avoid blocking the UI

// Version should match package.json dependency (pyodide@^0.29.2)
const PYODIDE_VERSION = '0.29.2'
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

// Limits
const MAX_CODE_LENGTH = 100000 // 100KB
const DEFAULT_TIMEOUT = 5000

let pyodide = null
let loadedPackages = new Set()
let currentExecutionId = null

/**
 * Validate code input before execution
 */
function validateCodeInput(code) {
  if (typeof code !== 'string') {
    throw new Error('Code must be a string')
  }
  if (code.length > MAX_CODE_LENGTH) {
    throw new Error(`Code too long (max ${MAX_CODE_LENGTH / 1000}KB)`)
  }
  if (code.includes('\0')) {
    throw new Error('Code contains invalid null characters')
  }
  return true
}

// Initialize Pyodide
async function initPyodide() {
  if (pyodide) return pyodide

  // Import Pyodide from CDN
  importScripts(`${PYODIDE_CDN}pyodide.js`)

  pyodide = await loadPyodide({
    indexURL: PYODIDE_CDN,
  })

  // Set up stdout/stderr capture
  pyodide.runPython(`
import sys
from io import StringIO

class CaptureOutput:
    def __init__(self):
        self.stdout = StringIO()
        self.stderr = StringIO()
        self._stdout = sys.stdout
        self._stderr = sys.stderr

    def __enter__(self):
        sys.stdout = self.stdout
        sys.stderr = self.stderr
        return self

    def __exit__(self, *args):
        sys.stdout = self._stdout
        sys.stderr = self._stderr

    def get_output(self):
        return self.stdout.getvalue(), self.stderr.getvalue()

_capture = CaptureOutput
`)

  return pyodide
}

// Load additional packages
async function loadPackages(packages) {
  if (!pyodide) {
    await initPyodide()
  }

  const toLoad = packages.filter((pkg) => !loadedPackages.has(pkg))
  if (toLoad.length > 0) {
    await pyodide.loadPackage(toLoad)
    toLoad.forEach((pkg) => loadedPackages.add(pkg))
  }
}

/**
 * Run Python code with timeout
 * Note: Promise.race only returns early - it cannot actually interrupt Pyodide execution.
 * If code exceeds timeout, we notify the main thread which may terminate the worker.
 */
async function runCode(code, timeout = DEFAULT_TIMEOUT, executionId = null) {
  validateCodeInput(code)

  if (!pyodide) {
    await initPyodide()
  }

  currentExecutionId = executionId

  // Wrap code in output capture
  const wrappedCode = `
with _capture() as _out:
    exec(${JSON.stringify(code)})
_stdout, _stderr = _out.get_output()
(_stdout, _stderr)
`

  let timeoutId = null
  let timedOut = false

  try {
    // Set up timeout that notifies main thread
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        timedOut = true
        // Notify main thread that we timed out - it may choose to terminate us
        self.postMessage({
          type: 'timeout_warning',
          executionId: currentExecutionId,
          message: 'Execution exceeded timeout, code may still be running',
        })
        reject(new Error('Execution timed out (5s limit). If your code has an infinite loop, please fix it and try again.'))
      }, timeout)
    })

    // Run code with timeout
    const result = await Promise.race([
      pyodide.runPythonAsync(wrappedCode),
      timeoutPromise,
    ])

    clearTimeout(timeoutId)

    // If we somehow finished after timeout started, still return result
    if (timedOut) {
      return {
        success: false,
        stdout: '',
        stderr: 'Execution completed after timeout warning',
      }
    }

    const [stdout, stderr] = result.toJs()

    return {
      success: true,
      stdout: stdout || '',
      stderr: stderr || '',
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    return {
      success: false,
      stdout: '',
      stderr: error.message || String(error),
    }
  } finally {
    currentExecutionId = null
  }
}

/**
 * Run validation code (for exercises)
 * Both user code and validation code have timeout protection
 */
async function runValidation(userCode, validateCode, timeout = DEFAULT_TIMEOUT) {
  validateCodeInput(userCode)
  validateCodeInput(validateCode)

  if (!pyodide) {
    await initPyodide()
  }

  // First run user code to set up variables (with timeout)
  const setupResult = await runCode(userCode, timeout)
  if (!setupResult.success) {
    return {
      passed: false,
      message: setupResult.stderr,
      stdout: setupResult.stdout,
    }
  }

  // Then run validation (with remaining time or minimum 2 seconds)
  const validationTimeout = Math.max(Math.floor(timeout / 2), 2000)

  let timeoutId = null

  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        self.postMessage({
          type: 'timeout_warning',
          message: 'Validation code timed out',
        })
        reject(new Error('Validation timed out'))
      }, validationTimeout)
    })

    // Validation code should be an assertion
    await Promise.race([
      pyodide.runPythonAsync(validateCode),
      timeoutPromise,
    ])

    clearTimeout(timeoutId)

    return {
      passed: true,
      message: 'All tests passed!',
      stdout: setupResult.stdout,
    }
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId)
    return {
      passed: false,
      message: error.message || 'Validation failed',
      stdout: setupResult.stdout,
    }
  }
}

// Handle messages from main thread
self.onmessage = async (event) => {
  const { id, type, payload } = event.data

  try {
    let result

    switch (type) {
      case 'init':
        await initPyodide()
        result = { ready: true }
        break

      case 'loadPackages':
        await loadPackages(payload.packages)
        result = { loaded: payload.packages }
        break

      case 'run':
        result = await runCode(payload.code, payload.timeout, id)
        break

      case 'validate':
        result = await runValidation(payload.userCode, payload.validateCode, payload.timeout)
        break

      case 'ping':
        // Health check
        result = { pong: true, timestamp: Date.now() }
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }

    self.postMessage({ id, success: true, result })
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message || String(error),
    })
  }
}

// Signal that worker is ready
self.postMessage({ type: 'ready' })
