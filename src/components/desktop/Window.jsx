import { useRef, useState, useEffect, useCallback } from 'react'

export default function Window({ app, state, onFocus, onClose, onUpdate }) {
  const windowRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 })

  // ドラッグ開始
  const handleMouseDownTitle = (e) => {
    if (e.target.closest('button')) return
    onFocus()
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - state.x,
      y: e.clientY - state.y,
    }
  }

  // リサイズ開始
  const handleMouseDownResize = (e) => {
    e.stopPropagation()
    onFocus()
    setIsResizing(true)
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: state.width,
      h: state.height,
    }
  }

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      onUpdate({
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y),
      })
    }
    if (isResizing) {
      const dw = e.clientX - resizeStart.current.x
      const dh = e.clientY - resizeStart.current.y
      onUpdate({
        width: Math.max(320, resizeStart.current.w + dw),
        height: Math.max(200, resizeStart.current.h + dh),
      })
    }
  }, [isDragging, isResizing, onUpdate])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  // iframeのsrcはbase pathを考慮
  const iframeSrc = `${import.meta.env.BASE_URL}${app.src}`

  return (
    <div
      ref={windowRef}
      className="absolute flex flex-col bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden"
      style={{
        left: state.x,
        top: state.y,
        width: state.width,
        height: state.height,
        zIndex: state.zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* タイトルバー */}
      <div
        className="h-10 flex items-center px-3 gap-2 bg-slate-800/80 cursor-move select-none border-b border-white/10"
        onMouseDown={handleMouseDownTitle}
      >
        <div className="flex gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
            title="閉じる"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="flex-1 text-center text-sm text-white/90 font-medium truncate">
          {app.icon} {app.title}
        </span>
        <div className="w-12" /> {/* バランス用 */}
      </div>

      {/* コンテンツ iframe */}
      <div className="flex-1 relative bg-white">
        <iframe
          src={iframeSrc}
          title={app.title}
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* リサイズハンドル */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleMouseDownResize}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-white/40" />
      </div>
    </div>
  )
}
