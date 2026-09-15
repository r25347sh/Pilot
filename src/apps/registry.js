/**
 * ベースアプリケーション定義
 * title / icon はここを単一ソースとして動的に参照する
 * ストアから追加されたアプリは localforage 経由でマージされる
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
]

/**
 * ベース + インストール済みをマージ（id重複はインストール側優先）
 */
export function mergeApps(installed = []) {
  const map = new Map()
  BASE_APPS.forEach((a) => map.set(a.id, { ...a }))
  installed.forEach((a) => {
    if (a?.id) map.set(a.id, { ...map.get(a.id), ...a })
  })
  return Array.from(map.values())
}
