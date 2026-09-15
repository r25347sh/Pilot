import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * PilotScript — 独自言語
 * 複数行を書いて Run / Ctrl+Enter で実行
 */

function tokenizeExpr(s) {
  s = s.trim()
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s)
  return s
}

function expand(text, vars) {
  return String(text).replace(/\$\{([^}]+)\}/g, (_, k) => {
    const key = k.trim()
    return vars[key] !== undefined ? String(vars[key]) : '${' + key + '}'
  })
}

function runPilotScript(source, initialVars = {}) {
  const lines = source.split(/\r?\n/)
  const vars = { ...initialVars }
  const out = []
  let i = 0
  let skipNext = false
  let repeatNext = 0

  const execOne = (raw) => {
    let line = raw.trim()
    if (!line || line.startsWith('#')) return
    const upper = line.toUpperCase()

    if (upper === 'CLEAR') {
      out.length = 0
      out.push({ type: 'sys', text: '(cleared)' })
      return
    }
    if (upper === 'HELP') {
      out.push({
        type: 'sys',
        text: [
          'PilotScript commands:',
          '  SAY <text> | CLEAR | HELP | TIME | LIST | ECHO ENV',
          '  LET name = value',
          '  ADD a b -> name | SUB | MUL | DIV',
          '  IF name IS value   (applies to next line)',
          '  REPEAT n           (next line n times)',
          '  Variables: SAY Hello ${name}',
        ].join('\n'),
      })
      return
    }
    if (upper === 'TIME') {
      out.push({ type: 'out', text: new Date().toLocaleString('ja-JP') })
      return
    }
    if (upper === 'LIST') {
      const keys = Object.keys(vars)
      out.push({
        type: 'out',
        text: keys.length ? keys.map((k) => k + ' = ' + JSON.stringify(vars[k])).join('\n') : '(no vars)',
      })
      return
    }
    if (upper === 'ECHO ENV') {
      out.push({
        type: 'out',
        text:
          'lang=' +
          navigator.language +
          '\nonline=' +
          navigator.onLine +
          '\nua=' +
          navigator.userAgent.slice(0, 60) +
          '…',
      })
      return
    }

    if (upper.startsWith('SAY ')) {
      out.push({ type: 'out', text: expand(line.slice(4), vars) })
      return
    }

    if (upper.startsWith('LET ')) {
      const rest = line.slice(4)
      const eq = rest.indexOf('=')
      if (eq < 0) {
        out.push({ type: 'err', text: 'LET needs name = value' })
        return
      }
      const name = rest.slice(0, eq).trim()
      const val = tokenizeExpr(expand(rest.slice(eq + 1).trim(), vars))
      vars[name] = val
      out.push({ type: 'sys', text: name + ' := ' + JSON.stringify(val) })
      return
    }

    const math = upper.match(/^(ADD|SUB|MUL|DIV)\s+(.+)\s*->\s*(\S+)\s*$/i)
    if (math) {
      const op = math[1].toUpperCase()
      const parts = math[2].trim().split(/\s+/)
      if (parts.length < 2) {
        out.push({ type: 'err', text: 'need two operands' })
        return
      }
      let a = tokenizeExpr(expand(parts[0], vars))
      let b = tokenizeExpr(expand(parts[1], vars))
      if (typeof a === 'string' && vars[a] !== undefined) a = vars[a]
      if (typeof b === 'string' && vars[b] !== undefined) b = vars[b]
      a = Number(a)
      b = Number(b)
      if (Number.isNaN(a) || Number.isNaN(b)) {
        out.push({ type: 'err', text: 'operands must be numbers' })
        return
      }
      let r
      if (op === 'ADD') r = a + b
      else if (op === 'SUB') r = a - b
      else if (op === 'MUL') r = a * b
      else if (op === 'DIV') r = b === 0 ? NaN : a / b
      const dest = math[3]
      vars[dest] = r
      out.push({ type: 'sys', text: dest + ' := ' + r })
      return
    }

    if (upper.startsWith('IF ')) {
      const m = line.match(/^IF\s+(\S+)\s+IS\s+(.+)$/i)
      if (!m) {
        out.push({ type: 'err', text: 'IF name IS value' })
        return
      }
      const left = vars[m[1]] !== undefined ? vars[m[1]] : m[1]
      const right = tokenizeExpr(expand(m[2].trim(), vars))
      skipNext = String(left) !== String(right)
      return
    }

    if (upper.startsWith('REPEAT ')) {
      const n = parseInt(line.slice(7).trim(), 10)
      if (Number.isNaN(n) || n < 0) {
        out.push({ type: 'err', text: 'REPEAT needs non-negative integer' })
        return
      }
      repeatNext = n
      return
    }

    out.push({ type: 'err', text: 'Unknown: ' + line })
  }

  while (i < lines.length) {
    const raw = lines[i]
    i += 1
    if (skipNext) {
      skipNext = false
      continue
    }
    if (repeatNext > 0) {
      const n = repeatNext
      repeatNext = 0
      for (let r = 0; r < n; r++) execOne(raw)
      continue
    }
    execOne(raw)
  }

  return { out, vars }
}

// バッククォート内の ${} は JS が評価してしまうので、サンプルは通常文字列で定義する
const SAMPLE = [
  '# PilotScript sample',
  'LET name = "Pilot"',
  'SAY Hello, ${name}!',
  'LET a = 21',
  'LET b = 2',
  'MUL a b -> answer',
  'SAY 21 x 2 = ${answer}',
  'TIME',
  'HELP',
  '',
].join('\n')

export default function TerminalApp() {
  const [code, setCode] = useState(SAMPLE)
  const [logs, setLogs] = useState([])
  const [vars, setVars] = useState({})
  const outRef = useRef(null)

  const run = useCallback(() => {
    const { out, vars: v } = runPilotScript(code, vars)
    setVars(v)
    setLogs((prev) => [...prev, { type: 'sys', text: '── run ──' }, ...out])
  }, [code, vars])

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight
  }, [logs])

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      run()
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-[#e6edf3] font-mono text-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-[#161b22]">
        <span className="font-semibold text-[#58a6ff]">PilotTerm</span>
        <span className="text-xs opacity-50">PilotScript · Ctrl+Enter to run</span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => {
              setLogs([])
              setVars({})
            }}
            className="px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/15"
          >
            Clear out
          </button>
          <button
            type="button"
            onClick={run}
            className="px-3 py-1 rounded text-xs font-semibold bg-[#238636] hover:bg-[#2ea043] text-white"
          >
            Run ▶
          </button>
        </div>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        className="flex-1 min-h-[40%] p-3 bg-[#0d1117] text-[#e6edf3] outline-none resize-none border-b border-white/10 leading-relaxed"
        placeholder="Write PilotScript here…"
      />

      <div ref={outRef} className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#010409]">
        {logs.length === 0 && (
          <p className="opacity-40 text-xs">Output appears here after Run.</p>
        )}
        {logs.map((line, idx) => (
          <pre
            key={idx}
            className={
              'whitespace-pre-wrap break-words m-0 ' +
              (line.type === 'err'
                ? 'text-[#f85149]'
                : line.type === 'sys'
                ? 'text-[#8b949e]'
                : 'text-[#3fb950]')
            }
          >
            {line.type === 'err' ? '✗ ' : line.type === 'sys' ? '· ' : '→ '}
            {line.text}
          </pre>
        ))}
      </div>
    </div>
  )
}
