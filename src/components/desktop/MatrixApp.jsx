import { useRef, useEffect, useState } from 'react'

export default function MatrixApp() {
  const ref = useRef(null)
  const [speed, setSpeed] = useState(1)
  const [density, setDensity] = useState(0.04)
  const running = useRef(true)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let cols = []
    let w = 0
    let h = 0
    const fontSize = 14
    const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF<>*+-=|#'.split('')

    const resize = () => {
      const parent = canvas.parentElement
      w = parent.clientWidth
      h = parent.clientHeight
      canvas.width = w
      canvas.height = h
      const n = Math.floor(w / fontSize)
      cols = Array.from({ length: n }, () => Math.random() * h)
    }
    resize()

    let raf
    const draw = () => {
      if (!running.current) return
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(0, 0, w, h)
      ctx.font = fontSize + 'px monospace'
      for (let i = 0; i < cols.length; i++) {
        if (Math.random() > density) continue
        const ch = chars[(Math.random() * chars.length) | 0]
        const x = i * fontSize
        const y = cols[i]
        ctx.fillStyle = '#0f0'
        ctx.fillText(ch, x, y)
        cols[i] = y > h + Math.random() * 40 ? 0 : y + fontSize * speed
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    window.addEventListener('resize', resize)
    return () => {
      running.current = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [speed, density])

  useEffect(() => {
    running.current = true
  }, [speed, density])

  return (
    <div className="h-full flex flex-col bg-black text-green-400">
      <div className="flex gap-4 px-3 py-2 text-xs border-b border-green-900/50">
        <label className="flex items-center gap-2">
          speed
          <input type="range" min={0.3} max={3} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2">
          density
          <input type="range" min={0.01} max={0.2} step={0.01} value={density} onChange={(e) => setDensity(Number(e.target.value))} />
        </label>
      </div>
      <div className="flex-1 relative">
        <canvas ref={ref} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  )
}
