import { useState, useEffect } from 'react'

export default function Taskbar({ apps, openApps, onAppClick, onSearchClick, searchOpen }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#1c1c1c]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-center gap-1 z-[9999] px-2">
      {/* 中央寄せグループ（Windows 11風） */}
      <div className="flex items-center gap-1">
        {/* スタートボタン */}
        <button
          onClick={onSearchClick}
          className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
            searchOpen ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
          title="スタート"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
          </svg>
        </button>

        {/* 検索ボタン */}
        <button
          onClick={onSearchClick}
          className={`h-10 px-3 rounded-md flex items-center gap-2 transition-colors ${
            searchOpen ? 'bg-white/15' : 'hover:bg-white/10'
          }`}
          title="検索"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <span className="text-white/60 text-xs hidden md:inline">検索</span>
        </button>

        <div className="w-px h-5 bg-white/15 mx-1" />

        {/* ピン留め / 起動中アプリ */}
        {apps.map((app) => {
          const s = openApps[app.id]
          const isOpen = s?.isOpen
          const isFocused = s?.isFocused && !s?.isMinimized
          const isMinimized = s?.isMinimized

          return (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              className={`relative w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                isFocused
                  ? 'bg-white/20'
                  : isOpen
                  ? 'bg-white/10 hover:bg-white/15'
                  : 'hover:bg-white/10'
              }`}
              title={app.title}
            >
              <span className="text-xl leading-none">{app.icon}</span>
              {/* 起動インジケータ */}
              {isOpen && (
                <span
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all ${
                    isFocused ? 'w-4 bg-white' : isMinimized ? 'w-2 bg-white/50' : 'w-3 bg-white/70'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* 右端システムトレイ */}
      <div className="absolute right-3 flex items-center gap-3 text-white/80 text-xs tabular-nums">
        <span>
          {time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="hidden sm:inline">
          {time.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
        </span>
      </div>
    </div>
  )
}
