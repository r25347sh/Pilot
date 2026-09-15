export default function Dock({ onHome, isAppOpen }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-2xl border-t border-white/10 flex items-center justify-center gap-10 z-50 pb-safe">
      {/* ホームボタン */}
      <button
        onClick={onHome}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isAppOpen
            ? 'bg-white/20 text-white scale-110'
            : 'bg-white/10 text-white/70'
        }`}
        title="ホーム"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </button>

      {/* タスク切り替え風（簡易） */}
      <button
        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/70"
        title="タスク"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>
    </div>
  )
}
