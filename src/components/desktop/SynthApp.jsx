import { useRef, useState, useEffect } from 'react'

const NOTES = [
  ['C4', 261.63],
  ['D4', 293.66],
  ['E4', 329.63],
  ['F4', 349.23],
  ['G4', 392.0],
  ['A4', 440.0],
  ['B4', 493.88],
  ['C5', 523.25],
]

export default function SynthApp() {
  const ctxRef = useRef(null)
  const [wave, setWave] = useState('sine')
  const [attack, setAttack] = useState(0.02)
  const [release, setRelease] = useState(0.3)
  const [gain, setGain] = useState(0.2)
  const [status, setStatus] = useState('クリックで AudioContext を起動')

  const ensureCtx = async () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext
      ctxRef.current = new AC()
    }
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume()
    setStatus('ready · ' + ctxRef.current.sampleRate + ' Hz')
    return ctxRef.current
  }

  const play = async (freq) => {
    const ctx = await ensureCtx()
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = wave
    osc.frequency.value = freq
    g.gain.value = 0
    osc.connect(g)
    g.connect(ctx.destination)
    const t = ctx.currentTime
    g.gain.linearRampToValueAtTime(gain, t + attack)
    g.gain.linearRampToValueAtTime(0, t + attack + release)
    osc.start(t)
    osc.stop(t + attack + release + 0.05)
  }

  useEffect(() => () => {
    try {
      ctxRef.current?.close()
    } catch {}
  }, [])

  return (
    <div className="h-full flex flex-col bg-[#0c0a09] text-white p-4 gap-4">
      <header>
        <h1 className="font-semibold text-lg">WaveSynth</h1>
        <p className="text-xs opacity-50">{status}</p>
      </header>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex flex-col gap-1">
          波形
          <select value={wave} onChange={(e) => setWave(e.target.value)} className="bg-white/10 rounded px-2 py-1">
            <option value="sine">sine</option>
            <option value="square">square</option>
            <option value="sawtooth">sawtooth</option>
            <option value="triangle">triangle</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Attack {attack.toFixed(2)}s
          <input type="range" min={0.005} max={0.5} step={0.005} value={attack} onChange={(e) => setAttack(Number(e.target.value))} />
        </label>
        <label className="flex flex-col gap-1">
          Release {release.toFixed(2)}s
          <input type="range" min={0.05} max={2} step={0.05} value={release} onChange={(e) => setRelease(Number(e.target.value))} />
        </label>
        <label className="flex flex-col gap-1">
          Gain {gain.toFixed(2)}
          <input type="range" min={0.01} max={0.5} step={0.01} value={gain} onChange={(e) => setGain(Number(e.target.value))} />
        </label>
      </div>
      <div className="flex gap-1 flex-wrap mt-auto pb-2">
        {NOTES.map(([name, freq]) => (
          <button
            key={name}
            type="button"
            onMouseDown={() => play(freq)}
            onTouchStart={(e) => {
              e.preventDefault()
              play(freq)
            }}
            className="w-12 h-28 rounded-b-lg bg-white/90 text-black text-xs font-medium hover:bg-cyan-200 active:bg-cyan-400 border border-black/20"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}
