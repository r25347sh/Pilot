/**
 * ストア風アプリ（空シェル）
 * 後から試験的拡張機能・アプリをここに追加予定
 */
export default function StoreApp() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--surface-bg)] text-[var(--surface-text)] flex flex-col">
      <header className="px-6 py-5 border-b border-[var(--surface-border)]">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span>🛒</span> ストア
        </h1>
        <p className="text-sm opacity-50 mt-1">試験的な拡張機能・アプリを入手できます</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-5xl mb-4 opacity-40">📦</div>
        <p className="text-base font-medium opacity-70">まだアイテムがありません</p>
        <p className="text-sm opacity-40 mt-2 max-w-sm">
          今後、ここに試験的機能や拡張アプリが並びます。
        </p>
      </div>
    </div>
  )
}
