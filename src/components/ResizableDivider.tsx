'use client'

import { useCallback, useRef, useState, useEffect } from 'react'

interface ResizableDividerProps {
  /** Callback when dragging - receives delta in pixels */
  onResize: (delta: number) => void
  /** Callback when double-clicked to reset */
  onReset?: () => void
  /** Additional CSS classes */
  className?: string
  /** Orientation of the divider */
  orientation?: 'vertical' | 'horizontal'
}

/**
 * ResizableDivider Component
 *
 * A draggable divider for resizing adjacent panels.
 * - Drag to resize
 * - Double-click to reset to default
 * - Visual feedback on hover/drag
 */
export default function ResizableDivider({
  onResize,
  onReset,
  className = '',
  orientation = 'vertical',
}: ResizableDividerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const startPosRef = useRef(0)
  const dividerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startPosRef.current = orientation === 'vertical' ? e.clientX : e.clientY
  }, [orientation])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const currentPos = orientation === 'vertical' ? e.clientX : e.clientY
    const delta = currentPos - startPosRef.current

    if (delta !== 0) {
      onResize(delta)
      startPosRef.current = currentPos
    }
  }, [isDragging, onResize, orientation])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDoubleClick = useCallback(() => {
    onReset?.()
  }, [onReset])

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, orientation])

  const isVertical = orientation === 'vertical'

  return (
    <div
      ref={dividerRef}
      className={`
        resizable-divider
        ${isVertical ? 'resizable-divider-vertical' : 'resizable-divider-horizontal'}
        ${isDragging ? 'dragging' : ''}
        ${isHovered ? 'hovered' : ''}
        ${className}
      `}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="separator"
      aria-orientation={orientation}
      aria-label="Resize panel"
      tabIndex={0}
    >
      {/* Visual indicator line */}
      <div className="resizable-divider-line" />
    </div>
  )
}
