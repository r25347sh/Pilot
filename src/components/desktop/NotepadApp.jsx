import { useState, useEffect, useCallback } from 'react'
import localforage from 'localforage'

const KEY = 'pilot-notepad-docs'

export default function NotepadApp() {
  const [docs, setDocs] = useState([{ id: '1', title: '無題', body: '' }])
  const [active, setActive] = useState('1')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    localforage.getItem(KEY).then((v) => {
      if (Array.isArray(v) && v.length) {
        setDocs(v)
        setActive(v[0].id)
      }
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    localforage.setItem(KEY, docs).catch(() => {})
  }, [docs, ready])

  const cur = docs.find((d) => d.id === active) || docs[0]

  const update = useCallback(
    (patch) => {
      setDocs((prev) => prev.map((d) => (d.id === active ? { ...d, ...patch } : d)))
    },
    [active]
  )

  const add = () => {
    const id = String(Date.now())
    setDocs((prev) => [...prev, { id, title: '無題', body: '' }])
    setActive(id)
  }

  const remove = () => {
    if (docs.length <= 1) return
    const next = docs.filter((d) => d.id !== active)
    setDocs(next)
    setActive(next[0].id)
  }

  return (
    <div className="h-full flex bg-[var(--surface-bg)] text-[var(--surface-text)]">
      <aside className="w-40 border-r border-[var(--surface-border)] flex flex-col">
        <div className="p-2 flex gap-1">
          <button type="button" onClick={add} className="flex-1 text-xs py-1 rounded bg-[var(--input-bg)] hover:bg-[var(--hover-bg)]">
            ＋
          </button>
          <button type="button" onClick={remove} className="px-2 text-xs py-1 rounded bg-[var(--input-bg)] hover:bg-red-500/20">
            −
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {docs.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActive(d.id)}
              className={`w-full text-left px-3 py-2 text-xs truncate ${
                d.id === active ? 'bg-[var(--hover-bg)] font-medium' : 'opacity-70 hover:bg-[var(--hover-bg)]'
              }`}
            >
              {d.title || '無題'}
            </button>
          ))}
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <input
          value={cur?.title || ''}
          onChange={(e) => update({ title: e.target.value })}
          className="px-4 py-2 border-b border-[var(--surface-border)] bg-transparent outline-none font-medium"
          placeholder="タイトル"
        />
        <textarea
          value={cur?.body || ''}
          onChange={(e) => update({ body: e.target.value })}
          className="flex-1 p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"
          placeholder="ここにメモ…"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
