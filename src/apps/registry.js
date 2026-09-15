/**
 * ベースアプリケーション（常にインストール済み）
 */
export const BASE_APPS = [
  {
    id: 'reitansai',
    title: '麗探祭',
    icon: '🎪',
    src: 'https://r25347sh.github.io/reitansai/',
    external: true,
  },
  {
    id: 'asobiseminar',
    title: 'Asobi Lab.',
    icon: '🎨',
    src: 'https://r25347sh.github.io/asobiseminar/',
    external: true,
  },
  {
    id: 'reitansai-cms',
    title: '麗探祭 CMS',
    icon: '📝',
    src: 'https://r25347sh.github.io/reitansai/admin.html',
    external: true,
  },
  {
    id: 'asobiseminar-cms',
    title: 'Asobi CMS',
    icon: '✏️',
    src: 'https://r25347sh.github.io/asobiseminar/login.html',
    external: true,
  },
  {
    id: 'settings',
    title: '設定',
    icon: '⚙️',
    internal: 'settings',
  },
  {
    id: 'store',
    title: 'ストア',
    icon: '🛒',
    internal: 'store',
  },
  {
    id: 'terminal',
    title: 'PilotTerm',
    icon: '⬛',
    internal: 'terminal',
  },
]

/** ストアで入手可能な試験的拡張（インストール後にデスクトップへ） */
export const STORE_CATALOG = [
  {
    id: 'taskmanager',
    title: 'タスクマネージャー',
    icon: '📊',
    internal: 'taskmanager',
    description: '実行中アプリの一覧・終了・最小化を行う試験的ツール',
    experimental: true,
  },
]

export function mergeApps(installed = []) {
  const map = new Map()
  BASE_APPS.forEach((a) => map.set(a.id, { ...a }))
  installed.forEach((a) => {
    if (a?.id) map.set(a.id, { ...map.get(a.id), ...a })
  })
  return Array.from(map.values())
}
