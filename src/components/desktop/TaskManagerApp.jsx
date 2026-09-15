/**
 * タスクマネージャー（試験的）
 * 開いているアプリの一覧・フォーカス・最小化・終了
 */
export default function TaskManagerApp({
  apps = [],
  openApps = {},
  focusApp,
  minimizeApp,
  closeApp,
}) {
  const rows = apps
    .map((app) => {
      const s = openApps[app.id]
      if (!s?.isOpen) return null
      return { app, state: s }
    })
    .filter(Boolean)

  return (
    <div className="h-full flex flex-col bg-[var(--surface-bg)] text-[var(--surface-text)]">
      <header className="px-4 py-3 border-b border-[var(--surface-border)] flex items-center gap-2">
        <span className="text-lg">📊</span>
        <div>
          <h1 className="text-base font-semibold">タスクマネージャー</h1>
          <p className="text-xs opacity-50">実行中のアプリケーション</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {rows.length === 0 ? (
          <p className="text-sm opacity-50 text-center py-10">実行中のアプリはありません</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs opacity-50 border-b border-[var(--surface-border)]">
                <th className="py-2 px-2 font-medium">名前</th>
                <th className="py-2 px-2 font-medium">状態</th>
                <th className="py-2 px-2 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ app, state }) => {
                const status = state.isMinimized
                  ? '最小化'
                  : state.isFocused
                  ? 'フォーカス'
                  : 'バックグラウンド'
                return (
                  <tr key={app.id} className="border-b border-[var(--surface-border)]/50 hover:bg-[var(--hover-bg)]">
                    <td className="py-2.5 px-2">
                      <span className="mr-1.5">{app.icon}</span>
                      {app.title}
                    </td>
                    <td className="py-2.5 px-2 opacity-70">{status}</td>
                    <td className="py-2.5 px-2 text-right space-x-1">
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded text-xs bg-[var(--input-bg)] hover:bg-[var(--hover-bg)]"
                        onClick={() => focusApp?.(app.id)}
                      >
                        表示
                      </button>
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded text-xs bg-[var(--input-bg)] hover:bg-[var(--hover-bg)]"
                        disabled={state.isMinimized}
                        onClick={() => minimizeApp?.(app.id)}
                      >
                        最小化
                      </button>
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded text-xs bg-red-500/80 text-white hover:bg-red-500"
                        onClick={() => closeApp?.(app.id)}
                      >
                        終了
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <footer className="px-4 py-2 border-t border-[var(--surface-border)] text-xs opacity-40">
        実行中: {rows.length} / 登録アプリ: {apps.length}
      </footer>
    </div>
  )
}
