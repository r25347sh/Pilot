import { useRef, useState, useEffect, useCallback } from 'react'
import SettingsApp from './SettingsApp'
import StoreApp from './StoreApp'
import TerminalApp from './TerminalApp'
import TaskManagerApp from './TaskManagerApp'
import NotepadApp from './NotepadApp'
import CalculatorApp from './CalculatorApp'
import DrawPadApp from './DrawPadApp'
import SynthApp from './SynthApp'
import MatrixApp from './MatrixApp'
import NetLabApp from './NetLabApp'
import RegexLabApp from './RegexLabApp'
import ContextMenu from './ContextMenu'

function AppContent({ app, settingsProps, storeProps, taskManagerProps, reloadNonce }) {
  if (app.internal === 'settings') return <SettingsApp key={reloadNonce} {...settingsProps} />
  if (app.internal === 'store') return <StoreApp key={reloadNonce} {...storeProps} />
  if (app.internal === 'terminal') return <TerminalApp key={reloadNonce} />
  if (app.internal === 'taskmanager') return <TaskManagerApp key={reloadNonce} {...taskManagerProps} />
  if (app.internal === 'notepad') return <NotepadApp key={reloadNonce} />
  if (app.internal === 'calculator') return <CalculatorApp key={reloadNonce} />
  if (app.internal === 'drawpad') return <DrawPadApp key={reloadNonce} />
  if (app.internal === 'synth') return <SynthApp key={reloadNonce} />
  if (app.internal === 'matrix') return <MatrixApp key={reloadNonce} />
  if (app.internal === 'netlab') return <NetLabApp key={reloadNonce} />
  if (app.internal === 'regexlab') return <RegexLabApp key={reloadNonce} />
  if (app.internal) return <div className="p-4 text-sm opacity-60">Unknown app: {app.internal}</div>
  return null
}

export default function Window({
  app,
  state,
  onFocus,
  onClose,
  onUpdate,
  onMinimize,
  onToggleMaximize,
  onToggleFullscreen,
  settingsProps,
  storeProps,
  taskManagerProps,
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [resizeDir, setResizeDir] = useState(null)
  const [ctx, setCtx] = useState(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, left: 0, top: 0 })
  const iframeSrcRef = useRef(null)
  if (iframeSrcRef.current == null && !app.internal) {
    iframeSrcRef.current = app.external ? app.src : `${import.meta.env.BASE_URL}${app.src}`
  }

  const isMaxOrFull = state.isMaximized || state.isFullscreen
  const isMinimized = !!state.isMinimized
  const reloadNonce = state.reloadNonce || 0

  const handleMouseDownTitle = (e) => {
    if (e.target.closest('button')) return
    if (isMaxOrFull || isMinimized) return
    onFocus()
    setIsDragging(true)
    dragOffset.current = { x: e.clientX - state.x, y: e.clientY - state.y }
  }

  const handleDoubleClickTitle = (e) => {
    if (e.target.closest('button')) return
    if (isMinimized) return
    onToggleMaximize()
  }

  const handleTitleContext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCtx({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: '再読み込み (Ctrl+R)', icon: '🔄', onClick: () => onUpdate({ reloadNonce: reloadNonce + 1 }) },
        { label: '最小化', icon: '─', onClick: onMinimize },
        {
          label: state.isMaximized ? '元のサイズに戻す' : '最大化',
          icon: '□',
          onClick: onToggleMaximize,
        },
        { label: '全画面切替', icon: '⛶', onClick: onToggleFullscreen },
        { separator: true },
        { label: '閉じる (Ctrl+W)', icon: '✕', onClick: onClose },
      ],
    })
  }

  const startResize = (dir) => (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (isMaxOrFull || isMinimized) return
    onFocus()
    setResizeDir(dir)
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: state.width,
      h: state.height,
      left: state.x,
      top: state.y,
    }
  }

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        onUpdate({
          x: Math.max(0, e.clientX - dragOffset.current.x),
          y: Math.max(0, e.clientY - dragOffset.current.y),
        })
        return
      }
      if (!resizeDir) return
      const dx = e.clientX - resizeStart.current.x
      const dy = e.clientY - resizeStart.current.y
      const { w, h, left, top } = resizeStart.current
      let newW = w
      let newH = h
      let newX = left
      let newY = top
      if (resizeDir.includes('e')) newW = Math.max(320, w + dx)
      if (resizeDir.includes('s')) newH = Math.max(200, h + dy)
      if (resizeDir.includes('w')) {
        newW = Math.max(320, w - dx)
        newX = left + (w - newW)
      }
      if (resizeDir.includes('n')) {
        newH = Math.max(200, h - dy)
        newY = top + (h - newH)
      }
      onUpdate({ x: newX, y: newY, width: newW, height: newH })
    },
    [isDragging, resizeDir, onUpdate]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setResizeDir(null)
  }, [])

  useEffect(() => {
    if (isDragging || resizeDir) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, resizeDir, handleMouseMove, handleMouseUp])

  const titleBg = state.isFocused
    ? 'bg-[var(--title-active)]'
    : 'bg-[var(--title-inactive)]'

  const handleSize = 6

  return (
    <div
      className={`absolute flex flex-col overflow-hidden shadow-2xl ${
        isMaxOrFull ? '' : 'rounded-t-lg border border-black/20'
      }`}
      style={{
        left: state.x,
        top: state.y,
        width: state.width,
        height: state.height,
        zIndex: state.zIndex,
        visibility: isMinimized ? 'hidden' : 'visible',
        pointerEvents: isMinimized ? 'none' : 'auto',
        transform: isMinimized ? 'scale(0)' : undefined,
        transformOrigin: 'bottom left',
      }}
      aria-hidden={isMinimized}
      onMouseDown={isMinimized ? undefined : onFocus}
    >
      <div
        className={`h-8 flex items-center select-none ${titleBg} ${isMaxOrFull ? '' : 'cursor-move'}`}
        onMouseDown={handleMouseDownTitle}
        onDoubleClick={handleDoubleClickTitle}
        onContextMenu={handleTitleContext}
      >
        <span className="pl-3 text-[13px] text-white font-normal truncate flex-1 flex items-center gap-2">
          <span className="text-base leading-none">{app.icon}</span>
          {app.title}
        </span>
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

      <div className="flex-1 relative overflow-hidden bg-[var(--surface-bg)]">
        {app.internal ? (
          <AppContent
            app={app}
            settingsProps={settingsProps}
            storeProps={storeProps}
            taskManagerProps={taskManagerProps}
            reloadNonce={reloadNonce}
          />
        ) : (
          <iframe
            key={reloadNonce}
            src={iframeSrcRef.current}
            title={app.title}
            className="absolute inset-0 w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            allow="fullscreen"
          />
        )}
      </div>

      {!isMaxOrFull && !isMinimized && (
        <>
          <div className="absolute top-0 left-0 cursor-nw-resize z-10" style={{ width: handleSize, height: handleSize }} onMouseDown={startResize('nw')} />
          <div className="absolute top-0 right-0 cursor-ne-resize z-10" style={{ width: handleSize, height: handleSize }} onMouseDown={startResize('ne')} />
          <div className="absolute bottom-0 left-0 cursor-sw-resize z-10" style={{ width: handleSize, height: handleSize }} onMouseDown={startResize('sw')} />
          <div className="absolute bottom-0 right-0 cursor-se-resize z-10" style={{ width: handleSize, height: handleSize }} onMouseDown={startResize('se')} />
          <div className="absolute top-0 left-0 right-0 cursor-n-resize z-10" style={{ height: 4 }} onMouseDown={startResize('n')} />
          <div className="absolute bottom-0 left-0 right-0 cursor-s-resize z-10" style={{ height: 4 }} onMouseDown={startResize('s')} />
          <div className="absolute top-0 bottom-0 left-0 cursor-w-resize z-10" style={{ width: 4 }} onMouseDown={startResize('w')} />
          <div className="absolute top-0 bottom-0 right-0 cursor-e-resize z-10" style={{ width: 4 }} onMouseDown={startResize('e')} />
        </>
      )}

      {ctx && !isMinimized && (
        <ContextMenu x={ctx.x} y={ctx.y} items={ctx.items} onClose={() => setCtx(null)} />
      )}
    </div>
  )
}
