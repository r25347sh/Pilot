import { STORE_CATALOG } from '../../apps/registry'

export default function StoreApp({ installedIds = [], onInstall, onUninstall }) {
  return (
    <div className="h-full overflow-y-auto bg-[var(--surface-bg)] text-[var(--surface-text)] flex flex-col">
      <header className="px-6 py-5 border-b border-[var(--surface-border)]">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span>🛒</span> ストア
        </h1>
        <p className="text-sm opacity-50 mt-1">試験的な拡張機能・アプリを入手できます</p>
      </header>

      <div className="p-4 space-y-3">
        {STORE_CATALOG.map((item) => {
          const installed = installedIds.includes(item.id)
          return (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--input-bg)]"
            >
              <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-black/10">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{item.title}</h2>
                  {item.experimental && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300">
                      試験的
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-60 mt-0.5">{item.description}</p>
              </div>
              {installed ? (
                <button
                  type="button"
                  onClick={() => onUninstall?.(item.id)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-sm bg-red-500/15 text-red-500 hover:bg-red-500/25"
                >
                  削除
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onInstall?.(item)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-sm bg-[#0078d4] text-white hover:bg-[#106ebe]"
                >
                  入手
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
