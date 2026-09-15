export default function Taskbar({ apps, openApps, onAppClick }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/40 backdrop-blur-xl border-t border-white/10 flex items-center px-3 gap-2 z-[9999]">
      {/* スタート風ボタン */}
      <div className="w-9 h-9 rounded-lg bg-indigo-500/80 flex items-center justify-center text-white text-lg font-bold shadow">
        P
      </div>

      <div className="w-px h-6 bg-white/20 mx-1" />

      {/* 開いているアプリのタスクボタン */}
      {apps.map((app) => {
        const isOpen = openApps[app.id]?.isOpen
        const isFocused = openApps[app.id]?.isFocused
        if (!isOpen) return null
        return (
          <button
            key={app.id}
            onClick={() => onAppClick(app.id)}
            className={`flex items-center gap-2 px-3 h-9 rounded-lg transition-all ${
              isFocused
                ? 'bg-white/25 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <span className="text-base">{app.icon}</span>
            <span className="text-sm font-medium hidden sm:inline">{app.title}</span>
          </button>
        )
      })}

      {/* 右側時計など */}
      <div className="ml-auto text-white/70 text-xs font-medium tabular-nums">
        {new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}
