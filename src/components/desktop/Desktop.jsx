import { useState, useCallback } from 'react'
import Taskbar from './Taskbar'
import Window from './Window'
import ContextMenu from './ContextMenu'

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
  settingsProps,
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [ctxMenu, setCtxMenu] = useState(null) // { x, y, items }

  const handleIconDoubleClick = (id) => {
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
        { label: '設定を開く', icon: '⚙️', onClick: () => openApp('settings') },
        { label: '検索', icon: '🔍', onClick: () => setSearchOpen(true) },
      ],
    })
  }

  const handleIconContext = (e, app) => {
    e.preventDefault()
    e.stopPropagation()
    const isOpen = openApps[app.id]?.isOpen
    setCtxMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: '開く', icon: '▶️', onClick: () => openApp(app.id) },
        { separator: true },
        {
          label: isOpen ? '閉じる' : '閉じる',
          icon: '✕',
          disabled: !isOpen,
          onClick: () => closeApp(app.id),
        },
        {
          label: '最小化',
          icon: '─',
          disabled: !isOpen || openApps[app.id]?.isMinimized,
          onClick: () => minimizeApp(app.id),
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
      onContextMenu={handleDesktopContext}
    >
      {/* 壁紙 */}
      <div className="absolute inset-0" style={{ background: wallpaper }} />

      {/* デスクトップアイコン */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
        {apps.map((app) => (
          <button
            key={app.id}
            onDoubleClick={() => handleIconDoubleClick(app.id)}
            onContextMenu={(e) => handleIconContext(e, app)}
            className="flex flex-col items-center gap-1 w-[76px] p-2 rounded hover:bg-white/10 transition-colors group"
          >
            <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl shadow group-hover:scale-105 transition-transform">
              {app.icon}
            </div>
            <span className="text-white text-[11px] font-medium drop-shadow-md text-center leading-tight px-0.5">
              {app.title}
            </span>
          </button>
        ))}
      </div>

      {/* ウィンドウ */}
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
          />
        )
      })}

      {/* 検索パネル */}
      {searchOpen && (
        <>
          <div
            className="absolute inset-0 z-[9990]"
            onClick={() => { setSearchOpen(false); setSearchQuery('') }}
          />
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[520px] max-w-[90vw] bg-[#1e1e1e]/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10 z-[9991] overflow-hidden">
            <div className="p-4">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="アプリを検索..."
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm outline-none focus:border-[#0078d4]"
              />
            </div>
            <div className="px-3 pb-3 max-h-64 overflow-y-auto">
              {filteredApps.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-6">見つかりませんでした</p>
              ) : (
                filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      openApp(app.id)
                      setSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-left"
                  >
                    <span className="text-2xl">{app.icon}</span>
                    <div>
                      <div className="text-white text-sm font-medium">{app.title}</div>
                      <div className="text-white/40 text-xs">アプリケーション</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 右クリックメニュー */}
      {ctxMenu && (
        <ContextMenu x={ctxMenu.x} y={ctxMenu.y} items={ctxMenu.items} onClose={closeCtx} />
      )}

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
        onSearchClick={() => setSearchOpen((v) => !v)}
        searchOpen={searchOpen}
      />
    </div>
  )
}
