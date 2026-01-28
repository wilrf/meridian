'use client'

import { useState, useCallback, memo } from 'react'
import LightEditor from './LightEditor'

export interface ProjectFile {
  id: string
  name: string
  content: string
}

interface ProjectEditorProps {
  /** Array of open files */
  files: ProjectFile[]
  /** ID of the currently active file */
  activeFileId: string
  /** Callback when file content changes */
  onChange: (fileId: string, content: string) => void
  /** Callback when switching active file */
  onActiveFileChange: (fileId: string) => void
  /** Callback when adding a new file */
  onAddFile: (name: string) => void
  /** Callback when closing a file */
  onCloseFile: (fileId: string) => void
  /** Callback when running code */
  onRun: () => void
  /** Whether the run button is disabled */
  isRunning?: boolean
  /** Whether Pyodide is ready */
  isPyodideReady?: boolean
}

/**
 * ProjectEditor Component
 *
 * Tabbed code editor for project workspace.
 * Features:
 * - Multiple file tabs
 * - Add new files
 * - Close files (with confirmation if unsaved)
 * - Wraps LightEditor for actual editing
 */
function ProjectEditorComponent({
  files,
  activeFileId,
  onChange,
  onActiveFileChange,
  onAddFile,
  onCloseFile,
  onRun,
  isRunning = false,
  isPyodideReady = false,
}: ProjectEditorProps) {
  const [isAddingFile, setIsAddingFile] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  const activeFile = files.find(f => f.id === activeFileId)

  // Handle adding a new file
  const handleAddClick = useCallback(() => {
    setIsAddingFile(true)
    setNewFileName('')
  }, [])

  const handleAddSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const name = newFileName.trim()
    if (name) {
      // Ensure .py extension
      const fileName = name.endsWith('.py') ? name : `${name}.py`
      onAddFile(fileName)
    }
    setIsAddingFile(false)
    setNewFileName('')
  }, [newFileName, onAddFile])

  const handleAddCancel = useCallback(() => {
    setIsAddingFile(false)
    setNewFileName('')
  }, [])

  // Handle closing a file
  const handleCloseFile = useCallback((e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    onCloseFile(fileId)
  }, [onCloseFile])

  // Handle code change in active file
  const handleCodeChange = useCallback((content: string) => {
    if (activeFile) {
      onChange(activeFile.id, content)
    }
  }, [activeFile, onChange])

  return (
    <div className="project-panel project-editor-panel">
      {/* File tabs */}
      <div className="project-file-tabs">
        {files.map((file) => (
          <button
            key={file.id}
            onClick={() => onActiveFileChange(file.id)}
            className={`project-file-tab ${file.id === activeFileId ? 'active' : ''}`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>{file.name}</span>
            {files.length > 1 && (
              <span
                onClick={(e) => handleCloseFile(e, file.id)}
                className="project-file-tab-close"
                title={`Close ${file.name}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            )}
          </button>
        ))}

        {/* Add file button or input */}
        {isAddingFile ? (
          <form onSubmit={handleAddSubmit} className="flex items-center">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.py"
              className="h-7 px-2 text-xs bg-[var(--editor-bg)] border border-[var(--editor-gutter-border)] rounded text-[var(--editor-text)] focus:outline-none focus:border-[var(--accent-base)]"
              autoFocus
              onBlur={handleAddCancel}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleAddCancel()
              }}
            />
          </form>
        ) : (
          <button
            onClick={handleAddClick}
            className="project-file-tab-add"
            title="Add new file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Editor area */}
      <div className="flex-1 relative overflow-hidden">
        {activeFile && (
          <LightEditor
            value={activeFile.content}
            onChange={handleCodeChange}
            onRun={onRun}
            height="100%"
            ariaLabel={`Code editor for ${activeFile.name}`}
          />
        )}

        {/* Run button */}
        <button
          onClick={onRun}
          disabled={isRunning || !isPyodideReady}
          className="project-run-btn"
        >
          {isRunning ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running...
            </>
          ) : isPyodideReady ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Run
            </>
          ) : (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading Python...
            </>
          )}
        </button>
      </div>
    </div>
  )
}

const ProjectEditor = memo(ProjectEditorComponent)
export default ProjectEditor
