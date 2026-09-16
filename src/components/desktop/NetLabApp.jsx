import { useState } from 'react'

export default function NetLabApp() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('https://httpbin.org/get')
  const [headers, setHeaders] = useState('{\n  "Accept": "application/json"\n}')
  const [body, setBody] = useState('')
  const [out, setOut] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    setLoading(true)
    setOut('')
    const t0 = performance.now()
    try {
      let hdr = {}
      try {
        hdr = headers.trim() ? JSON.parse(headers) : {}
      } catch {
        throw new Error('Headers must be valid JSON')
      }
      const init = { method, headers: hdr }
      if (method !== 'GET' && method !== 'HEAD' && body) init.body = body
      const res = await fetch(url, init)
      const text = await res.text()
      const ms = (performance.now() - t0).toFixed(1)
      let pretty = text
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2)
      } catch {}
      setOut(
        [
          `HTTP ${res.status} ${res.statusText}  (${ms} ms)`,
          [...res.headers.entries()].map(([k, v]) => k + ': ' + v).join('\n'),
          '',
          pretty,
        ].join('\n')
      )
    } catch (e) {
      setOut('Error: ' + (e.message || String(e)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[var(--surface-bg)] text-[var(--surface-text)] text-sm">
      <div className="p-3 border-b border-[var(--surface-border)] flex flex-wrap gap-2 items-center">
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-[var(--input-bg)] rounded px-2 py-1.5">
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 min-w-[12rem] bg-[var(--input-bg)] rounded px-2 py-1.5 outline-none"
          placeholder="https://..."
        />
        <button
          type="button"
          onClick={send}
          disabled={loading}
          className="px-3 py-1.5 rounded bg-[#0078d4] text-white hover:bg-[#106ebe] disabled:opacity-50"
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-1 min-h-0">
        <div className="flex flex-col border-r border-[var(--surface-border)] min-h-0">
          <div className="px-2 py-1 text-xs opacity-50">Headers (JSON)</div>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            className="flex-1 p-2 font-mono text-xs bg-transparent outline-none resize-none"
            spellCheck={false}
          />
          <div className="px-2 py-1 text-xs opacity-50 border-t border-[var(--surface-border)]">Body</div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="h-28 p-2 font-mono text-xs bg-transparent outline-none resize-none"
            spellCheck={false}
          />
        </div>
        <pre className="p-3 overflow-auto font-mono text-xs whitespace-pre-wrap break-all m-0">{out || 'Response…'}</pre>
      </div>
    </div>
  )
}
