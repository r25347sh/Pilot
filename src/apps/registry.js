/** ベースアプリ（常時インストール） */
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
]

/** ストア試験的拡張 */
export const STORE_CATALOG = [
  {
    id: 'terminal',
    title: 'PilotTerm',
    icon: '⬛',
    internal: 'terminal',
    description: 'PilotScript v2 独自言語ターミナル。字句解析・AST・関数・配列対応。',
    experimental: true,
  },
  {
    id: 'taskmanager',
    title: 'タスクマネージャー',
    icon: '📊',
    internal: 'taskmanager',
    description: '実行中アプリの一覧・表示・最小化・強制終了。',
    experimental: true,
  },
  {
    id: 'notepad',
    title: 'メモ',
    icon: '📄',
    internal: 'notepad',
    description: 'ローカル永続メモ。複数タブ相当の簡易ノート。',
    experimental: true,
  },
  {
    id: 'calculator',
    title: '電卓',
    icon: '🔢',
    internal: 'calculator',
    description: '式評価対応の関数電卓（四則・括弧・%）。',
    experimental: true,
  },
  {
    id: 'drawpad',
    title: 'DrawPad',
    icon: '🖌️',
    internal: 'drawpad',
    description: 'キャンバスお絵かき。色・太さ・消去。PNG保存。',
    experimental: true,
  },
  {
    id: 'synth',
    title: 'WaveSynth',
    icon: '🎹',
    internal: 'synth',
    description: 'Web Audio シンセ。波形・エンベロープ・鍵盤演奏。',
    experimental: true,
  },
  {
    id: 'matrix',
    title: 'Matrix Rain',
    icon: '🟩',
    internal: 'matrix',
    description: 'デジタル雨ビジュアライザ。速度・密度調整。',
    experimental: true,
  },
  {
    id: 'netlab',
    title: 'NetLab',
    icon: '🌐',
    internal: 'netlab',
    description: 'HTTP リクエスト試験台。メソッド・ヘッダ・ボディ・レスポンス表示。',
    experimental: true,
  },
  {
    id: 'regexlab',
    title: 'Regex Lab',
    icon: '🔍',
    internal: 'regexlab',
    description: '正規表現テスター。マッチハイライト・グループ表示。',
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
