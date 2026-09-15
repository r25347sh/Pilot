/**
 * ベースアプリケーション定義（title/icon の単一ソース）
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

export function mergeApps(installed = []) {
  const map = new Map()
  BASE_APPS.forEach((a) => map.set(a.id, { ...a }))
  installed.forEach((a) => {
    if (a?.id) map.set(a.id, { ...map.get(a.id), ...a })
  })
  return Array.from(map.values())
}
