import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Pilot Console — F12 風の簡易デバッグパネル
 * - log / warn / error / info のキャプチャ
 * - JS 評価（Pilot シェル文脈）
 * - 紐づいたサイトアプリのメタ情報表示
 */

function formatArg(a) {
  if (a === null) return 'null'
  if (a === undefined) return 'undefined'
  if (typeof a === 'string') return a
  if (typeof a === 'number' || typeof a === 'boolean') return String(a)
  try {
    return JSON.stringify(a, null, 2)
  } catch {
    return String(a)
  }
}

export default function ConsoleApp({ targetApp = null, apps = [] }) {
  const [logs, setLogs] = useState([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [filter, setFilter] = useState('all')
  const endRef = useRef(null)
  const inputRef = useRef(null)

  const push = useCallback((level, args, source = 'pilot') => {
    setLogs((prev) => [
      ...prev.slice(-500),
      {
        id: Date.now() + Math.random(),
        level,
        text: args.map(formatArg).join(' '),
        time: new Date().toLocaleTimeString('ja-JP'),
        source,
      },
    ])
  }, [])

  // console フック
  useEffect(() => {
    const levels = ['log', 'info', 'warn', 'error', 'debug']
    const originals = {}
    levels.forEach((lv) => {
      originals[lv] = console[lv].bind(console)
      console[lv] = (...args) => {
        originals[lv](...args)
        push(lv === 'debug' ? 'log' : lv, args, 'console')
      }
    })
    push('info', ['Pilot Console attached. Type JS and press Enter.'])
    return () => {
      levels.forEach((lv) => {
        console[lv] = originals[lv]
      })
    }
  }, [push])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    if (targetApp) {
      push('info', [
        `Target: ${targetApp.title} (${targetApp.id})` +
          (targetApp.src ? ` → ${targetApp.src}` : targetApp.internal ? ` [internal:${targetApp.internal}]` : ''),
      ], 'system')
      if (targetApp.external) {
        push(
          'warn',
          [
            'Cross-origin iframe: ページ内部の console は読めません。Pilot 側ログとシェル評価のみ利用可能です。',
          ],
          'system'
        )
      }
    }
  }, [targetApp?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const run = () => {
    const code = input.trim()
    if (!code) return
    setHistory((h) => [code, ...h].slice(0, 50))
    setHistIdx(-1)
    push('log', ['› ' + code], 'input')
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(
        '"use strict"; const apps = this.apps; const target = this.target; return (async () => { return await (async () => { ' +
          (code.includes('return') || code.includes(';') ? code : 'return (' + code + ')') +
          ' })() })()'
      ).call({ apps, target: targetApp })
      Promise.resolve(result).then(
        (v) => {
          if (v !== undefined) push('info', [v], 'result')
        },
        (err) => push('error', [err?.message || String(err)], 'result')
      )
    } catch (e) {
      push('error', [e.message || String(e)], 'result')
    }
    setInput('')
  }

  const filtered = logs.filter((l) => filter === 'all' || l.level === filter)

  const levelColor = {
    log: 'text-zinc-200',
    info: 'text-sky-400',
    warn: 'text-amber-400',
    error: 'text-red-400',
    input: 'text-emerald-400',
    result: 'text-violet-300',
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-[#e6edf3] font-mono text-[12px]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-[#161b22]">
        <span className="font-semibold text-[#58a6ff]">Console</span>
        {targetApp && (
          <span className="text-[10px] opacity-60 truncate">
            → {targetApp.icon} {targetApp.title}
          </span>
        )}
        <div className="ml-auto flex gap-1">
          {['all', 'log', 'info', 'warn', 'error'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                filter === f ? 'bg-white/15' : 'opacity-50 hover:opacity-80'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setLogs([])}
            className="px-2 py-0.5 rounded text-[10px] bg-white/10 hover:bg-white/15 ml-1"
          >
            Clear
          </button>
        </div>
      </div>

      {targetApp && (
        <div className="px-3 py-1.5 border-b border-white/5 text-[10px] opacity-50 flex gap-3 flex-wrap">
          <span>id={targetApp.id}</span>
          {targetApp.src && <span className="truncate">src={targetApp.src}</span>}
          {targetApp.internal && <span>internal={targetApp.internal}</span>}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filtered.map((l) => (
          <div key={l.id} className={`flex gap-2 ${levelColor[l.level] || ''}`}>
            <span className="opacity-30 shrink-0 w-16">{l.time}</span>
            <span className="opacity-40 shrink-0 w-10 uppercase text-[10px]">{l.level}</span>
            <pre className="whitespace-pre-wrap break-all m-0 flex-1">{l.text}</pre>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/10 flex items-center gap-2 px-2 py-1.5 bg-[#010409]">
        <span className="text-emerald-500">›</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              run()
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              const next = Math.min(histIdx + 1, history.length - 1)
              if (history[next] != null) {
                setHistIdx(next)
                setInput(history[next])
              }
            } else if (e.key === 'ArrowDown') {
              e.preventDefault()
              const next = histIdx - 1
              if (next < 0) {
                setHistIdx(-1)
                setInput('')
              } else {
                setHistIdx(next)
                setInput(history[next] || '')
              }
            }
          }}
          className="flex-1 bg-transparent outline-none text-[#e6edf3]"
          placeholder="expression or statement…"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
