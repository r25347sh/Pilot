import { useState } from 'react'
import Taskbar from './Taskbar'
import Window from './Window'

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
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleIconDoubleClick = (id) => {
    if (openApps[id]?.isOpen) {
      focusApp(id)
    } else {
      openApp(id)
    }
  }

  const filteredApps = apps.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0c1a2e]">
      {/* Windows 11風壁紙グラデーション */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, #1a3a5c 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #0d2840 0%, transparent 45%), linear-gradient(160deg, #0a1628 0%, #0c1a2e 40%, #081420 100%)',
        }}
      />

      {/* デスクトップアイコン */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
        {apps.map((app) => (
          <button
            key={app.id}
            onDoubleClick={() => handleIconDoubleClick(app.id)}
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

      {/* 開いているウィンドウ */}
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
          />
        )
      })}

      {/* 検索 / スタート風パネル */}
      {searchOpen && (
        <>
          <div
            className="absolute inset-0 z-[9990]"
            onClick={() => {
              setSearchOpen(false)
              setSearchQuery('')
            }}
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

      {/* タスクバー */}
      <Taskbar
        apps={apps}
        openApps={openApps}
        onAppClick={(id) => {
          const s = openApps[id]
          if (s?.isOpen) {
            if (s.isMinimized || !s.isFocused) {
              focusApp(id)
            } else {
              minimizeApp(id)
            }
          } else {
            openApp(id)
          }
        }}
        onSearchClick={() => setSearchOpen((v) => !v)}
        searchOpen={searchOpen}
      />
    </div>
  )
}
