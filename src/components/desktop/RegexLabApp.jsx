import { useMemo, useState } from 'react'

export default function RegexLabApp() {
  const [pattern, setPattern] = useState('(\\w+)@(\\w+)\\.(\\w+)')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('contact: alice@example.com and bob@test.org')
  const [error, setError] = useState('')

  const result = useMemo(() => {
    setError('')
    try {
      const re = new RegExp(pattern, flags)
      const matches = []
      if (flags.includes('g')) {
        let m
        const r = new RegExp(pattern, flags)
        while ((m = r.exec(text)) !== null) {
          matches.push({ index: m.index, full: m[0], groups: m.slice(1) })
          if (m[0].length === 0) r.lastIndex++
        }
      } else {
        const m = text.match(re)
        if (m) matches.push({ index: m.index ?? 0, full: m[0], groups: m.slice(1) })
      }
      return matches
    } catch (e) {
      setError(e.message)
      return []
    }
  }, [pattern, flags, text])

  const highlighted = useMemo(() => {
    if (!result.length || error) return text
    // simple non-overlapping highlight by indices
    const parts = []
    let last = 0
    const sorted = [...result].sort((a, b) => a.index - b.index)
    for (const m of sorted) {
      if (m.index < last) continue
      parts.push({ t: text.slice(last, m.index), hit: false })
      parts.push({ t: m.full, hit: true })
      last = m.index + m.full.length
    }
    parts.push({ t: text.slice(last), hit: false })
    return parts
  }, [result, text, error])

  return (
    <div className="h-full flex flex-col bg-[var(--surface-bg)] text-[var(--surface-text)] p-3 gap-2 text-sm">
      <div className="flex gap-2 items-center">
        <span className="opacity-50">/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="flex-1 bg-[var(--input-bg)] rounded px-2 py-1.5 font-mono outline-none"
          spellCheck={false}
        />
        <span className="opacity-50">/</span>
        <input
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          className="w-16 bg-[var(--input-bg)] rounded px-2 py-1.5 font-mono outline-none"
          spellCheck={false}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="h-28 bg-[var(--input-bg)] rounded p-2 font-mono text-xs outline-none resize-none"
        spellCheck={false}
      />
      <div className="flex-1 overflow-auto rounded border border-[var(--surface-border)] p-2 font-mono text-xs leading-relaxed">
        {typeof highlighted === 'string' ? (
          highlighted
        ) : (
          highlighted.map((p, i) =>
            p.hit ? (
              <mark key={i} className="bg-amber-400/40 text-inherit rounded px-0.5">
                {p.t}
              </mark>
            ) : (
              <span key={i}>{p.t}</span>
            )
          )
        )}
      </div>
      <div className="text-xs opacity-70 max-h-32 overflow-auto">
        {result.length === 0 ? (
          <span>マッチなし</span>
        ) : (
          result.map((m, i) => (
            <div key={i}>
              [{m.index}] {JSON.stringify(m.full)}
              {m.groups.length ? ' groups: ' + JSON.stringify(m.groups) : ''}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
