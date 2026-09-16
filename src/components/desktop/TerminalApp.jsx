import { useState, useRef, useCallback, useEffect } from 'react'
import { runPilotScript, SAMPLE, HELP_TEXT } from '../../lib/pilotScript'

export default function TerminalApp() {
  const [code, setCode] = useState(SAMPLE)
  const [logs, setLogs] = useState([])
  const [vars, setVars] = useState({})
  const outRef = useRef(null)

  const run = useCallback(() => {
    const result = runPilotScript(code)
    setVars(result.vars || {})
    const lines = [
      { type: 'sys', text: '── run ──' },
      ...result.output.map((t) => ({
        type: t.startsWith('Error:') ? 'err' : 'out',
        text: t,
      })),
    ]
    if (result.ok) {
      lines.push({ type: 'sys', text: '── ok ──' })
    }
    setLogs((prev) => [...prev, ...lines])
  }, [code])

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight
  }, [logs])

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      run()
    }
  }

  const showHelp = () => {
    setLogs((prev) => [...prev, { type: 'sys', text: HELP_TEXT }])
  }

  const varSummary = Object.keys(vars)
    .map((k) => {
      const v = vars[k]
      const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
      return k + '=' + (s.length > 24 ? s.slice(0, 24) + '…' : s)
    })
    .join('  ')

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-[#e6edf3] font-mono text-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-[#161b22]">
        <span className="font-semibold text-[#58a6ff]">PilotTerm</span>
        <span className="text-xs opacity-50">PilotScript v2 · Ctrl+Enter</span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={showHelp}
            className="px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/15"
          >
            Help
          </button>
          <button
            type="button"
            onClick={() => {
              setLogs([])
              setVars({})
            }}
            className="px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/15"
          >
            Clear
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
          <p className="opacity-40 text-xs">Output appears here after Run. Ctrl+Enter to execute.</p>
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

      {varSummary && (
        <div className="px-3 py-1.5 border-t border-white/10 text-[10px] opacity-50 truncate bg-[#0d1117]">
          env: {varSummary}
        </div>
      )}
    </div>
  )
}
