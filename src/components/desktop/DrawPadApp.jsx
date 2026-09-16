import { useRef, useState, useEffect } from 'react'

export default function DrawPadApp() {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const [color, setColor] = useState('#22d3ee')
  const [size, setSize] = useState(4)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const resize = () => {
      const parent = c.parentElement
      if (!parent) return
      const ratio = window.devicePixelRatio || 1
      const w = parent.clientWidth
      const h = parent.clientHeight
      c.width = w * ratio
      c.height = h * ratio
      c.style.width = w + 'px'
      c.style.height = h + 'px'
      const ctx = c.getContext('2d')
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.fillStyle = '#0b1220'
      ctx.fillRect(0, 0, w, h)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return { x: src.clientX - r.left, y: src.clientY - r.top }
  }

  const start = (e) => {
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }
  const move = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const p = pos(e)
    ctx.strokeStyle = color
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }
  const end = () => {
    drawing.current = false
  }

  const clear = () => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, c.clientWidth, c.clientHeight)
  }

  const save = () => {
    const a = document.createElement('a')
    a.download = 'drawpad.png'
    a.href = canvasRef.current.toDataURL('image/png')
    a.click()
  }

  return (
    <div className="h-full flex flex-col bg-[#0b1220]">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-white/10 text-white text-sm">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
        <label className="flex items-center gap-2 opacity-80">
          太さ
          <input type="range" min={1} max={40} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </label>
        <button type="button" onClick={clear} className="px-2 py-1 rounded bg-white/10 hover:bg-white/15">
          消去
        </button>
        <button type="button" onClick={save} className="px-2 py-1 rounded bg-[#0078d4] hover:bg-[#106ebe]">
          PNG
        </button>
      </div>
      <div className="flex-1 relative touch-none">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
    </div>
  )
}
