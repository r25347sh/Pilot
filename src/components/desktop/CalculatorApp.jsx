import { useState } from 'react'

function safeEval(expr) {
  const cleaned = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
  if (!/^[0-9+\-*/().%\s]+$/.test(cleaned)) throw new Error('invalid')
  // percent: 50% -> 0.5
  const withPct = cleaned.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)')
  // eslint-disable-next-line no-new-func
  const fn = new Function(`"use strict"; return (${withPct})`)
  const v = fn()
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('nan')
  return v
}

const KEYS = [
  ['C', '(', ')', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '%', '='],
]

export default function CalculatorApp() {
  const [expr, setExpr] = useState('')
  const [display, setDisplay] = useState('0')

  const press = (k) => {
    if (k === 'C') {
      setExpr('')
      setDisplay('0')
      return
    }
    if (k === '=') {
      try {
        const v = safeEval(expr || display)
        setDisplay(String(v))
        setExpr(String(v))
      } catch {
        setDisplay('Error')
      }
      return
    }
    const next = expr === 'Error' ? k : expr + k
    setExpr(next)
    setDisplay(next || '0')
  }

  return (
    <div className="h-full flex flex-col bg-[#111] text-white p-4 max-w-sm mx-auto">
      <div className="flex-1 flex items-end justify-end text-3xl font-mono tabular-nums break-all pb-4 min-h-[4rem]">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {KEYS.flat().map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className={`h-12 rounded-xl text-lg font-medium transition-colors ${
              k === '='
                ? 'bg-[#0078d4] hover:bg-[#106ebe]'
                : k === 'C'
                ? 'bg-red-500/80 hover:bg-red-500'
                : 'bg-white/10 hover:bg-white/15'
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  )
}
