import { useState, useEffect } from 'react'

function useBattery() {
  const [battery, setBattery] = useState({ level: null, charging: false })
  useEffect(() => {
    let batt = null
    const update = () => {
      if (!batt) return
      setBattery({ level: Math.round(batt.level * 100), charging: batt.charging })
    }
    if (navigator.getBattery) {
      navigator.getBattery().then((b) => {
        batt = b
        update()
        b.addEventListener('levelchange', update)
        b.addEventListener('chargingchange', update)
      }).catch(() => {})
    }
    return () => {
      if (batt) {
        batt.removeEventListener('levelchange', update)
        batt.removeEventListener('chargingchange', update)
      }
    }
  }, [])
  return battery
}

function useNetwork() {
  const [online, setOnline] = useState(navigator.onLine)
  const [type, setType] = useState(null)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (conn) {
      const update = () => setType(conn.effectiveType || conn.type || null)
      update()
      conn.addEventListener?.('change', update)
      return () => {
        window.removeEventListener('online', on)
        window.removeEventListener('offline', off)
        conn.removeEventListener?.('change', update)
      }
    }
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return { online, type }
}

function BatteryIcon({ level, charging }) {
  if (level == null) return null
  const w = Math.max(2, Math.round((level / 100) * 14))
  const color = level <= 15 ? '#f87171' : level <= 30 ? '#fbbf24' : '#4ade80'
  return (
    <span className="flex items-center gap-1" title={`バッテリー ${level}%${charging ? ' (充電中)' : ''}`}>
      <svg width="20" height="12" viewBox="0 0 20 12" className="shrink-0">
        <rect x="0.5" y="1.5" width="16" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <rect x="17" y="3.5" width="2" height="5" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="2" y="3" width={w} height="6" rx="0.5" fill={color} />
        {charging && (
          <path d="M9 2 L7 6.5 H10 L8 10" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <span className="tabular-nums">{level}%</span>
    </span>
  )
}

export default function Taskbar({ apps, openApps, onAppClick, onSearchClick, searchOpen }) {
  const [time, setTime] = useState(new Date())
  const battery = useBattery()
  const network = useNetwork()
  const lang = navigator.language || 'ja'

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-12 backdrop-blur-xl flex items-center justify-center gap-1 z-[9999] px-2 border-t"
      style={{
        background: 'var(--tb-bg)',
        color: 'var(--tb-text)',
        borderColor: 'var(--tb-border)',
      }}
    >
      <div className="flex items-center gap-1">
        <button
          onClick={onSearchClick}
          className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
            searchOpen ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'
          }`}
          style={{ background: searchOpen ? 'var(--hover-bg)' : undefined }}
          title="スタート"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
          </svg>
        </button>

        <button
          onClick={onSearchClick}
          className="h-10 px-3 rounded-md flex items-center gap-2 transition-colors hover:bg-[var(--hover-bg)]"
          style={{ background: searchOpen ? 'var(--hover-bg)' : undefined }}
          title="検索"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <span className="text-xs opacity-60 hidden md:inline">検索</span>
        </button>

        <div className="w-px h-5 mx-1 opacity-20" style={{ background: 'currentColor' }} />

        {apps.map((app) => {
          const s = openApps[app.id]
          const isOpen = s?.isOpen
          const isFocused = s?.isFocused && !s?.isMinimized
          const isMinimized = s?.isMinimized

          return (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              className="relative w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--hover-bg)]"
              style={{ background: isFocused ? 'var(--hover-bg)' : isOpen ? 'var(--input-bg)' : undefined }}
              title={app.title}
            >
              <span className="text-xl leading-none">{app.icon}</span>
              {isOpen && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all"
                  style={{
                    width: isFocused ? 16 : isMinimized ? 8 : 12,
                    background: 'currentColor',
                    opacity: isFocused ? 1 : 0.5,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="absolute right-2 flex items-center gap-2.5 text-xs" style={{ color: 'var(--tb-text)' }}>
        <span className="hidden sm:inline uppercase opacity-70" title="言語">
          {lang.split('-')[0]}
        </span>

        <span
          className="flex items-center gap-1"
          title={network.online ? `オンライン${network.type ? ` (${network.type})` : ''}` : 'オフライン'}
        >
          {network.online ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
              <path d="M12 3C7.5 3 3.7 4.6 1 7.2L3 9.2C5.1 7.2 8.3 6 12 6s6.9 1.2 9 3.2l2-2C20.3 4.6 16.5 3 12 3zm0 6c-2.9 0-5.5 1-7.5 2.7l2 2C7.9 12.4 9.8 12 12 12s4.1.4 5.5 1.7l2-2C17.5 10 14.9 9 12 9zm0 6c-1.3 0-2.5.4-3.5 1.1L12 20l3.5-3.9c-1-.7-2.2-1.1-3.5-1.1z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
              <path d="M12 3C7.5 3 3.7 4.6 1 7.2L3 9.2C5.1 7.2 8.3 6 12 6c.6 0 1.2 0 1.8.1L16 4C14.7 3.4 13.4 3 12 3zM2.3 2L1 3.3 4.7 7C2.9 8.2 1.5 9.7 1 10.5l2 2c.8-1 2.2-2.3 3.9-3.2L21 21.7 22.3 20.4 2.3 2z" />
            </svg>
          )}
          {network.type && <span className="hidden lg:inline opacity-60">{network.type}</span>}
        </span>

        <BatteryIcon level={battery.level} charging={battery.charging} />

        <div className="text-right leading-tight tabular-nums pl-1 ml-0.5 border-l" style={{ borderColor: 'var(--tb-border)' }}>
          <div>{time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="opacity-60 text-[10px] hidden sm:block">
            {time.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
          </div>
        </div>
      </div>
    </div>
  )
}
