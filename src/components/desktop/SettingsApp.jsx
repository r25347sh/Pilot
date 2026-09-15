const WALLPAPERS = [
  {
    id: 'default',
    name: 'ミッドナイト',
    value:
      'radial-gradient(ellipse at 30% 20%, #1a3a5c 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #0d2840 0%, transparent 45%), linear-gradient(160deg, #0a1628 0%, #0c1a2e 40%, #081420 100%)',
  },
  {
    id: 'bloom',
    name: 'ブルーム',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  },
  {
    id: 'ocean',
    name: 'オーシャン',
    value: 'linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  },
  {
    id: 'sunset',
    name: 'サンセット',
    value: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
  },
  {
    id: 'forest',
    name: 'フォレスト',
    value: 'linear-gradient(160deg, #134e5e 0%, #71b280 100%)',
  },
  {
    id: 'minimal',
    name: 'ミニマル',
    value: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)',
  },
  {
    id: 'light-sky',
    name: 'ライトスカイ',
    value: 'linear-gradient(160deg, #a8edea 0%, #fed6e3 100%)',
  },
  {
    id: 'windows-blue',
    name: 'Windows Blue',
    value: 'linear-gradient(135deg, #0078d4 0%, #00bcf2 50%, #5c2d91 100%)',
  },
]

const THEMES = [
  { id: 'dark', name: 'ダーク', desc: '暗いテーマ' },
  { id: 'light', name: 'ライト', desc: '明るいテーマ' },
  { id: 'system', name: 'システム', desc: 'OSの設定に合わせる' },
]

export default function SettingsApp({ theme, wallpaper, onThemeChange, onWallpaperChange }) {
  return (
    <div className="h-full overflow-y-auto bg-[var(--settings-bg)] text-[var(--settings-text)] p-6">
      <h1 className="text-2xl font-semibold mb-6">設定</h1>

      {/* テーマ */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider opacity-60 mb-3">テーマ</h2>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                theme === t.id
                  ? 'border-[#0078d4] bg-[#0078d4]/10'
                  : 'border-[var(--settings-border)] hover:border-[#0078d4]/50'
              }`}
            >
              <div className="font-medium text-sm">{t.name}</div>
              <div className="text-xs opacity-50 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 背景画像 */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider opacity-60 mb-3">背景</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              onClick={() => onWallpaperChange(w.value)}
              className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                wallpaper === w.value
                  ? 'border-[#0078d4] ring-2 ring-[#0078d4]/30'
                  : 'border-transparent hover:border-white/30'
              }`}
              title={w.name}
            >
              <div className="absolute inset-0" style={{ background: w.value }} />
              <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium text-white drop-shadow-md bg-black/40 px-1.5 py-0.5 rounded">
                {w.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs opacity-40">設定はブラウザに自動保存されます</p>
    </div>
  )
}

export { WALLPAPERS }
