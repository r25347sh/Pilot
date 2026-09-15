import { useState, useCallback, useRef } from 'react'
import Taskbar from './Taskbar'
import Window from './Window'
import ContextMenu from './ContextMenu'

const ICON_H = 88
const GRID = 8

function defaultPos(index) {
  return { x: 16, y: 16 + index * (ICON_H + 4) }
}

export default function Desktop({
  apps,
  openApps,
  openApp,
  focusApp,
  closeApp,
  updateWindow,
  minimizeApp,
  toggleMaximize,
  toggleFullscreen,
  wallpaper,
  resolvedTheme,
  settingsProps,
  storeProps,
  taskManagerProps,
  iconPositions,
  updateIconPosition,
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [ctxMenu, setCtxMenu] = useState(null)
  const dragRef = useRef(null)

  const getPos = (app, index) => iconPositions[app.id] || defaultPos(index)

  const handleIconPointerDown = (e, app, index) => {
    if (e.button !== 0) return
    e.preventDefault()
    const pos = getPos(app, index)
    dragRef.current = {
      id: app.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    }

    const onMoveTracked = (ev) => {
      const d = dragRef.current
      if (!d || d.id !== app.id) return
      const dx = ev.clientX - d.startX
      const dy = ev.clientY - d.startY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
      if (!d.moved) return
      d._lastDx = dx
      d._lastDy = dy
      const x = Math.max(0, d.origX + dx)
      const y = Math.max(0, Math.min(window.innerHeight - 60 - ICON_H, d.origY + dy))
      updateIconPosition(app.id, { x, y })
    }

    const onUpSnap = () => {
      const d = dragRef.current
      if (d?.moved) {
        const snap = (v) => Math.round(v / GRID) * GRID
        const x = snap(Math.max(0, d.origX + (d._lastDx || 0)))
        const y = snap(Math.max(0, Math.min(window.innerHeight - 60 - ICON_H, d.origY + (d._lastDy || 0))))
        updateIconPosition(app.id, { x, y })
      }
      dragRef.current = null
      window.removeEventListener('pointermove', onMoveTracked)
      window.removeEventListener('pointerup', onUpSnap)
    }

    window.addEventListener('pointermove', onMoveTracked)
    window.addEventListener('pointerup', onUpSnap)
  }

  const handleIconDoubleClick = (id) => {
    if (dragRef.current?.moved) return
    if (openApps[id]?.isOpen) focusApp(id)
    else openApp(id)
  }

  const closeCtx = useCallback(() => setCtxMenu(null), [])

  const handleDesktopContext = (e) => {
    e.preventDefault()
    setCtxMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: '表示を更新', icon: '🔄', onClick: () => window.location.reload() },
        { separator: true },
        { label: '設定', icon: '⚙️', onClick: () => openApp('settings') },
        { label: 'ストア', icon: '🛒', onClick: () => openApp('store') },
        { label: 'PilotTerm', icon: '⬛', onClick: () => openApp('terminal') },
        { separator: true },
        { label: '検索', icon: '🔍', onClick: () => setSearchOpen(true) },
      ],
    })
  }

  const handleIconContext = (e, app) => {
    e.preventDefault()
    e.stopPropagation()
    const s = openApps[app.id]
    const isOpen = s?.isOpen
    const isMin = s?.isMinimized
    setCtxMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: isOpen && isMin ? '元に戻す' : '開く',
          icon: '▶️',
          onClick: () => openApp(app.id),
        },
        { separator: true },
        {
          label: '最小化（稼働継続）',
          icon: '─',
          disabled: !isOpen || isMin,
          onClick: () => minimizeApp(app.id),
        },
        {
          label: '最大化',
          icon: '□',
          disabled: !isOpen || isMin,
          onClick: () => {
            focusApp(app.id)
            toggleMaximize(app.id)
          },
        },
        { separator: true },
        {
          label: '閉じる（終了）',
          icon: '✕',
          disabled: !isOpen,
          onClick: () => closeApp(app.id),
        },
      ],
    })
  }

  const handleTaskbarAppContext = (e, app) => {
    e.preventDefault()
    e.stopPropagation()
    const s = openApps[app.id]
    const isOpen = s?.isOpen
    setCtxMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: `${app.title} を開く`, icon: app.icon, onClick: () => openApp(app.id) },
        {
          label: isOpen && s.isMinimized ? 'ウィンドウを表示' : '最小化',
          icon: '─',
          disabled: !isOpen,
          onClick: () => {
            if (s?.isMinimized) focusApp(app.id)
            else minimizeApp(app.id)
          },
        },
        { separator: true },
        {
          label: 'ウィンドウを閉じる',
          icon: '✕',
          disabled: !isOpen,
          onClick: () => closeApp(app.id),
        },
      ],
    })
  }

  const filteredApps = apps.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      data-theme={resolvedTheme}
      onContextMenu={handleDesktopContext}
    >
      <div className="absolute inset-0" style={{ background: wallpaper }} />

      {apps.map((app, index) => {
        const pos = getPos(app, index)
        return (
          <button
            key={app.id}
            onPointerDown={(e) => handleIconPointerDown(e, app, index)}
            onDoubleClick={() => handleIconDoubleClick(app.id)}
            onContextMenu={(e) => handleIconContext(e, app)}
            className="absolute flex flex-col items-center gap-1 w-[76px] p-2 rounded hover:bg-white/15 transition-colors group z-10 select-none touch-none"
            style={{ left: pos.x, top: pos.y }}
          >
            <div className="w-12 h-12 rounded-lg bg-black/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow group-hover:scale-105 transition-transform pointer-events-none">
              {app.icon}
            </div>
            <span className="text-white text-[11px] font-medium drop-shadow-md text-center leading-tight px-0.5 pointer-events-none">
              {app.title}
            </span>
          </button>
        )
      })}

      {apps.map((app) => {
        const state = openApps[app.id]
        if (!state?.isOpen) return null
        return (
          <Window
            key={app.id}
            app={app}
            state={state}
            onFocus={() => focusApp(app.id)}
            onClose={() => closeApp(app.id)}
            onUpdate={(props) => updateWindow(app.id, props)}
            onMinimize={() => minimizeApp(app.id)}
            onToggleMaximize={() => toggleMaximize(app.id)}
            onToggleFullscreen={() => toggleFullscreen(app.id)}
            settingsProps={settingsProps}
            storeProps={storeProps}
            taskManagerProps={taskManagerProps}
          />
        )
      })}

      {searchOpen && (
        <>
          <div className="absolute inset-0 z-[9990]" onClick={() => { setSearchOpen(false); setSearchQuery('') }} />
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[520px] max-w-[90vw] bg-[var(--panel-bg)] backdrop-blur-2xl rounded-xl shadow-2xl border border-[var(--panel-border)] z-[9991] overflow-hidden">
            <div className="p-4">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="アプリを検索..."
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--panel-border)] text-[var(--surface-text)] text-sm outline-none focus:border-[#0078d4]"
              />
            </div>
            <div className="px-3 pb-3 max-h-64 overflow-y-auto">
              {filteredApps.length === 0 ? (
                <p className="text-[var(--surface-text)] opacity-40 text-sm text-center py-6">見つかりませんでした</p>
              ) : (
                filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => { openApp(app.id); setSearchOpen(false); setSearchQuery('') }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-left"
                  >
                    <span className="text-2xl">{app.icon}</span>
                    <div>
                      <div className="text-[var(--surface-text)] text-sm font-medium">{app.title}</div>
                      <div className="text-[var(--surface-text)] opacity-40 text-xs">アプリケーション</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} items={ctxMenu.items} onClose={closeCtx} />}

      <Taskbar
        apps={apps}
        openApps={openApps}
        onAppClick={(id) => {
          const s = openApps[id]
          if (s?.isOpen) {
            if (s.isMinimized || !s.isFocused) focusApp(id)
            else minimizeApp(id)
          } else openApp(id)
        }}
        onAppContextMenu={handleTaskbarAppContext}
        onSearchClick={() => setSearchOpen((v) => !v)}
        searchOpen={searchOpen}
      />
    </div>
  )
}
