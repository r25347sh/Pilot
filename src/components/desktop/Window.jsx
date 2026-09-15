import { useRef, useState, useEffect, useCallback } from 'react'

export default function Window({
  app,
  state,
  onFocus,
  onClose,
  onUpdate,
  onMinimize,
  onToggleMaximize,
  onToggleFullscreen,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 })

  const isMaxOrFull = state.isMaximized || state.isFullscreen

  const handleMouseDownTitle = (e) => {
    if (e.target.closest('button')) return
    if (isMaxOrFull) return // 最大化中はドラッグ不可
    onFocus()
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - state.x,
      y: e.clientY - state.y,
    }
  }

  const handleDoubleClickTitle = (e) => {
    if (e.target.closest('button')) return
    onToggleMaximize()
  }

  const handleMouseDownResize = (e) => {
    e.stopPropagation()
    if (isMaxOrFull) return
    onFocus()
    setIsResizing(true)
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: state.width,
      h: state.height,
    }
  }

  const handleMouseMove = useCallback(
    (e) => {
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
          width: Math.max(400, resizeStart.current.w + dw),
          height: Math.max(280, resizeStart.current.h + dh),
        })
      }
    },
    [isDragging, isResizing, onUpdate]
  )

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

  // 最小化中は描画しない（タスクバーのみ）
  if (state.isMinimized) return null

  const iframeSrc = app.external ? app.src : `${import.meta.env.BASE_URL}${app.src}`

  // Windows風タイトルバー色（フォーカス時）
  const titleBg = state.isFocused
    ? 'bg-[#0078d4]'
    : 'bg-[#2b2b2b]'

  return (
    <div
      className={`absolute flex flex-col overflow-hidden shadow-2xl ${
        isMaxOrFull ? '' : 'rounded-t-lg border border-black/30'
      } ${
        state.isFullscreen ? 'rounded-none' : ''
      }`}
      style={{
        left: state.x,
        top: state.y,
        width: state.width,
        height: state.height,
        zIndex: state.zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Windows風タイトルバー */}
      <div
        className={`h-8 flex items-center select-none ${titleBg} ${isMaxOrFull ? '' : 'cursor-move'}`}
        onMouseDown={handleMouseDownTitle}
        onDoubleClick={handleDoubleClickTitle}
      >
        <span className="pl-3 text-[13px] text-white font-normal truncate flex-1 flex items-center gap-2">
          <span className="text-base leading-none">{app.icon}</span>
          {app.title}
        </span>

        {/* ウィンドウ操作ボタン（Windows順: 最小化 → 最大化 → 閉じる） */}
        <div className="flex h-full">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMinimize()
            }}
            className="w-11 h-full flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors"
            title="最小化"
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <rect width="10" height="1" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleMaximize()
            }}
            className="w-11 h-full flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors"
            title={state.isMaximized || state.isFullscreen ? '元のサイズに戻す' : '最大化'}
          >
            {state.isMaximized || state.isFullscreen ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="0" width="8" height="8" />
                <rect x="0" y="2" width="8" height="8" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="0.5" y="0.5" width="9" height="9" />
              </svg>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="w-11 h-full flex items-center justify-center text-white/90 hover:bg-[#e81123] transition-colors"
            title="閉じる"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.3">
              <line x1="0" y1="0" x2="10" y2="10" />
              <line x1="10" y1="0" x2="0" y2="10" />
            </svg>
          </button>
        </div>
      </div>

      {/* コンテンツ iframe */}
      <div className="flex-1 relative bg-white">
        <iframe
          src={iframeSrc}
          title={app.title}
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
          allow="fullscreen"
        />
      </div>

      {/* リサイズハンドル（最大化・全画面時は非表示） */}
      {!isMaxOrFull && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-10"
          onMouseDown={handleMouseDownResize}
        >
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-r-2 border-b-2 border-gray-400/70" />
        </div>
      )}
    </div>
  )
}
