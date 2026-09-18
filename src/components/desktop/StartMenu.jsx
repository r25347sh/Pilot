import { useEffect, useRef } from 'react'

/**
 * Windows 11 風スタートメニュー
 * - 検索ボックス
 * - ピン留めアプリグリッド
 * - おすすめ / 最近
 * - 電源・ユーザー領域
 */
export default function StartMenu({
  apps,
  openApps,
  onOpenApp,
  onClose,
  resolvedTheme,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    window.addEventListener('keydown', onKey)
    // delay to avoid immediate close from the button click
    const t = setTimeout(() => window.addEventListener('mousedown', onClickOutside), 0)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
      window.removeEventListener('mousedown', onClickOutside)
    }
  }, [onClose])

  const pinned = apps.filter((a) => !a.experimental || openApps[a.id])
  const allApps = apps

  return (
    <div
      ref={ref}
      className="absolute bottom-14 left-1/2 -translate-x-1/2 z-[10000] w-[min(640px,92vw)] max-h-[min(720px,80vh)] flex flex-col overflow-hidden rounded-2xl shadow-2xl border"
      style={{
        background: 'var(--start-bg)',
        borderColor: 'var(--start-border)',
        color: 'var(--surface-text)',
        backdropFilter: 'blur(40px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
      }}
      role="dialog"
      aria-label="スタート"
    >
      {/* 検索 */}
      <div className="p-4 pb-2">
        <div
          className="flex items-center gap-3 px-4 h-11 rounded-full border text-sm"
          style={{
            background: 'var(--input-bg)',
            borderColor: 'var(--panel-border)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 shrink-0">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="search"
            placeholder="アプリ、設定、ドキュメントを検索"
            className="flex-1 bg-transparent outline-none placeholder:opacity-50"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                const q = e.target.value.trim().toLowerCase()
                const hit = apps.find(
                  (a) =>
                    a.title.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
                )
                if (hit) {
                  onOpenApp(hit.id)
                  onClose()
                }
              }
            }}
          />
        </div>
      </div>

      {/* ピン留め */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-between">
        <span className="text-xs font-semibold opacity-70 tracking-wide">ピン留め済み</span>
      </div>
      <div className="px-3 pb-3 grid grid-cols-6 gap-1 overflow-y-auto" style={{ maxHeight: 220 }}>
        {pinned.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => {
              onOpenApp(app.id)
              onClose()
            }}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-colors hover:bg-[var(--hover-bg)] active:scale-95"
            title={app.title}
          >
            <span className="text-2xl leading-none drop-shadow-sm">{app.icon}</span>
            <span className="text-[11px] leading-tight text-center truncate w-full opacity-90">
              {app.title}
            </span>
          </button>
        ))}
      </div>

      {/* すべてのアプリ */}
      <div className="px-4 pt-1 pb-1 flex items-center justify-between border-t" style={{ borderColor: 'var(--panel-border)' }}>
        <span className="text-xs font-semibold opacity-70 tracking-wide">すべてのアプリ</span>
      </div>
      <div className="px-2 pb-3 overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 200 }}>
        {allApps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => {
              onOpenApp(app.id)
              onClose()
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-[var(--hover-bg)]"
          >
            <span className="text-xl w-8 text-center">{app.icon}</span>
            <span className="text-sm truncate flex-1">{app.title}</span>
            {openApps[app.id]?.isOpen && (
              <span className="text-[10px] opacity-50">実行中</span>
            )}
          </button>
        ))}
      </div>

      {/* フッター */}
      <div
        className="flex items-center justify-between px-4 h-14 border-t shrink-0"
        style={{ borderColor: 'var(--panel-border)', background: 'var(--start-footer-bg)' }}
      >
        <div className="flex items-center gap-2 text-sm opacity-80">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-base"
            style={{ background: 'var(--hover-bg)' }}
          >
            👤
          </div>
          <span>Pilot User</span>
        </div>
        <button
          type="button"
          onClick={() => {
            onOpenApp('settings')
            onClose()
          }}
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--hover-bg)] transition-colors"
          title="電源・設定"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-80">
            <path d="M16.56 5.44 15.11 4A9.97 9.97 0 0 0 12 3c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9c0-2.12-.74-4.07-1.97-5.61l-1.46 1.46C18.53 9.05 19 10.47 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-3.53 2.61-6.43 6-6.92V10h2V3.58c0-.36-.19-.69-.5-.86z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
