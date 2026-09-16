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
  {
    id: 'aurora',
    name: 'オーロラ',
    value:
      'radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.45) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.4) 0%, transparent 45%), radial-gradient(ellipse at 60% 80%, rgba(168,85,247,0.35) 0%, transparent 40%), linear-gradient(160deg, #020617 0%, #0f172a 100%)',
  },
  {
    id: 'ember',
    name: 'エンバー',
    value: 'linear-gradient(160deg, #1c1917 0%, #7c2d12 40%, #ea580c 70%, #fbbf24 100%)',
  },
  {
    id: 'sakura',
    name: 'サクラ',
    value: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 30%, #f9a8d4 60%, #e11d48 100%)',
  },
  {
    id: 'graphite',
    name: 'グラファイト',
    value: 'linear-gradient(145deg, #111827 0%, #374151 50%, #6b7280 100%)',
  },
  {
    id: 'cyber',
    name: 'サイバー',
    value:
      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.03) 2px, rgba(34,211,238,0.03) 4px), linear-gradient(135deg, #0c0a09 0%, #164e63 50%, #22d3ee 100%)',
  },
  {
    id: 'lavender',
    name: 'ラベンダー',
    value: 'linear-gradient(160deg, #1e1b4b 0%, #4c1d95 40%, #a78bfa 70%, #ede9fe 100%)',
  },
  {
    id: 'matcha',
    name: '抹茶',
    value: 'linear-gradient(160deg, #14532d 0%, #3f6212 40%, #a3e635 100%)',
  },
  {
    id: 'noir',
    name: 'ノワール',
    value: 'radial-gradient(circle at 50% 0%, #27272a 0%, #09090b 70%)',
  },
  {
    id: 'horizon',
    name: 'ホライゾン',
    value: 'linear-gradient(180deg, #0ea5e9 0%, #38bdf8 25%, #fef3c7 55%, #fb923c 80%, #9f1239 100%)',
  },
  {
    id: 'ink',
    name: 'インク',
    value: 'linear-gradient(135deg, #020617 0%, #1e3a8a 50%, #312e81 100%)',
  },
  {
    id: 'peach',
    name: 'ピーチ',
    value: 'linear-gradient(135deg, #fff7ed 0%, #fdba74 40%, #fb7185 100%)',
  },
  {
    id: 'neon-grid',
    name: 'ネオングリッド',
    value:
      'linear-gradient(rgba(236,72,153,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.15) 1px, transparent 1px), linear-gradient(160deg, #0f172a 0%, #581c87 100%)',
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

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider opacity-60 mb-3">
          背景（{WALLPAPERS.length}種類）
        </h2>
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
              <div className="absolute inset-0" style={{ background: w.value, backgroundSize: w.id === 'neon-grid' || w.id === 'cyber' ? '24px 24px, 24px 24px, auto' : undefined }} />
              <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium text-white drop-shadow-md bg-black/40 px-1.5 py-0.5 rounded">
                {w.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs opacity-40">設定はブラウザに自動保存されます（localforage）</p>
    </div>
  )
}

export { WALLPAPERS }
