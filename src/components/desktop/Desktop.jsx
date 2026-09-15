import Taskbar from './Taskbar'
import Window from './Window'

export default function Desktop({ apps, openApps, openApp, focusApp, closeApp, updateWindow }) {
  const handleIconDoubleClick = (id) => {
    if (openApps[id]?.isOpen) {
      focusApp(id)
    } else {
      openApp(id)
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900">
      {/* デスクトップ背景パターン */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      {/* デスクトップアイコン */}
      <div className="absolute top-6 left-6 flex flex-col gap-6 z-10">
        {apps.map((app) => (
          <button
            key={app.id}
            onDoubleClick={() => handleIconDoubleClick(app.id)}
            className="flex flex-col items-center gap-1 w-20 p-2 rounded-lg hover:bg-white/10 transition-colors group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg group-hover:scale-105 transition-transform">
              {app.icon}
            </div>
            <span className="text-white text-xs font-medium drop-shadow-md text-center leading-tight">
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
          />
        )
      })}

      {/* タスクバー */}
      <Taskbar
        apps={apps}
        openApps={openApps}
        onAppClick={(id) => {
          if (openApps[id]?.isOpen) {
            focusApp(id)
          } else {
            openApp(id)
          }
        }}
      />
    </div>
  )
}
