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

// Map Python import names to Pyodide package names
// (most are the same, but some differ)
const IMPORT_TO_PACKAGE = {
  'sklearn': 'scikit-learn',
  'cv2': 'opencv-python',
  'PIL': 'Pillow',
  'yaml': 'pyyaml',
  'bs4': 'beautifulsoup4',
  'dateutil': 'python-dateutil',
}

// Standard library modules that don't need to be installed
const STDLIB_MODULES = new Set([
  'abc', 'aifc', 'argparse', 'array', 'ast', 'asynchat', 'asyncio', 'asyncore',
  'atexit', 'audioop', 'base64', 'bdb', 'binascii', 'binhex', 'bisect',
  'builtins', 'bz2', 'calendar', 'cgi', 'cgitb', 'chunk', 'cmath', 'cmd',
  'code', 'codecs', 'codeop', 'collections', 'colorsys', 'compileall',
  'concurrent', 'configparser', 'contextlib', 'contextvars', 'copy', 'copyreg',
  'cProfile', 'crypt', 'csv', 'ctypes', 'curses', 'dataclasses', 'datetime',
  'dbm', 'decimal', 'difflib', 'dis', 'distutils', 'doctest', 'email',
  'encodings', 'enum', 'errno', 'faulthandler', 'fcntl', 'filecmp', 'fileinput',
  'fnmatch', 'fractions', 'ftplib', 'functools', 'gc', 'getopt', 'getpass',
  'gettext', 'glob', 'graphlib', 'grp', 'gzip', 'hashlib', 'heapq', 'hmac',
  'html', 'http', 'imaplib', 'imghdr', 'imp', 'importlib', 'inspect', 'io',
  'ipaddress', 'itertools', 'json', 'keyword', 'lib2to3', 'linecache', 'locale',
  'logging', 'lzma', 'mailbox', 'mailcap', 'marshal', 'math', 'mimetypes',
  'mmap', 'modulefinder', 'multiprocessing', 'netrc', 'nis', 'nntplib',
  'numbers', 'operator', 'optparse', 'os', 'ossaudiodev', 'pathlib', 'pdb',
  'pickle', 'pickletools', 'pipes', 'pkgutil', 'platform', 'plistlib', 'poplib',
  'posix', 'posixpath', 'pprint', 'profile', 'pstats', 'pty', 'pwd', 'py_compile',
  'pyclbr', 'pydoc', 'queue', 'quopri', 'random', 're', 'readline', 'reprlib',
  'resource', 'rlcompleter', 'runpy', 'sched', 'secrets', 'select', 'selectors',
  'shelve', 'shlex', 'shutil', 'signal', 'site', 'smtpd', 'smtplib', 'sndhdr',
  'socket', 'socketserver', 'spwd', 'sqlite3', 'ssl', 'stat', 'statistics',
  'string', 'stringprep', 'struct', 'subprocess', 'sunau', 'symtable', 'sys',
  'sysconfig', 'syslog', 'tabnanny', 'tarfile', 'telnetlib', 'tempfile',
  'termios', 'test', 'textwrap', 'threading', 'time', 'timeit', 'tkinter',
  'token', 'tokenize', 'trace', 'traceback', 'tracemalloc', 'tty', 'turtle',
  'turtledemo', 'types', 'typing', 'unicodedata', 'unittest', 'urllib', 'uu',
  'uuid', 'venv', 'warnings', 'wave', 'weakref', 'webbrowser', 'winreg',
  'winsound', 'wsgiref', 'xdrlib', 'xml', 'xmlrpc', 'zipapp', 'zipfile',
  'zipimport', 'zlib', '_thread',
  // Also include some common submodules
  'collections.abc', 'os.path', 'urllib.request', 'urllib.parse',
])

/**
 * Extract import names from Python code
 * Handles: import X, import X as Y, from X import Y, from X.Y import Z
 */
function extractImports(code) {
  const imports = new Set()

  // Match "import X" and "import X as Y" (handles multiple: import X, Y, Z)
  const importRegex = /^\s*import\s+([^#\n]+)/gm
  let match
  while ((match = importRegex.exec(code)) !== null) {
    const importPart = match[1]
    // Split by comma for multiple imports
    const modules = importPart.split(',')
    for (const mod of modules) {
      // Get the module name (before "as" if present)
      const moduleName = mod.trim().split(/\s+as\s+/)[0].trim()
      // Get the top-level package (before any dots)
      const topLevel = moduleName.split('.')[0]
      if (topLevel) imports.add(topLevel)
    }
  }

  // Match "from X import Y" and "from X.Y import Z"
  const fromRegex = /^\s*from\s+([^\s.]+)/gm
  while ((match = fromRegex.exec(code)) !== null) {
    const moduleName = match[1].trim()
    if (moduleName) imports.add(moduleName)
  }

  return Array.from(imports)
}

/**
 * Get Pyodide package names for the given imports
 * Filters out stdlib and maps import names to package names
 */
function getPackagesForImports(imports) {
  const packages = []

  for (const imp of imports) {
    // Skip standard library modules
    if (STDLIB_MODULES.has(imp)) continue

    // Map import name to package name (or use import name if no mapping)
    const packageName = IMPORT_TO_PACKAGE[imp] || imp
    packages.push(packageName)
  }

  return packages
}

/**
 * Auto-detect and load packages from code imports
 */
async function autoLoadImports(code) {
  const imports = extractImports(code)
  const packages = getPackagesForImports(imports)

  if (packages.length > 0) {
    // Filter to only packages not already loaded
    const toLoad = packages.filter(pkg => !loadedPackages.has(pkg))
    if (toLoad.length > 0) {
      // Notify that we're loading packages
      self.postMessage({
        type: 'loading_packages',
        packages: toLoad,
      })

      try {
        await pyodide.loadPackage(toLoad)
        toLoad.forEach(pkg => loadedPackages.add(pkg))
      } catch (error) {
        // Some packages might not exist in Pyodide - that's okay,
        // the import will fail naturally with a clear error
        console.warn('Failed to load some packages:', error.message)
      }
    }
  }
}

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

  // Import Pyodide from CDN with error handling
  try {
    importScripts(`${PYODIDE_CDN}pyodide.js`)
  } catch (error) {
    const message = `Failed to load Pyodide from CDN: ${error.message || error}`
    self.postMessage({
      type: 'init_error',
      error: message,
    })
    throw new Error(message)
  }

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

  // Auto-detect and load any imported packages
  await autoLoadImports(code)

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
