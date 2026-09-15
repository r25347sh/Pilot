import { useEffect, useRef } from 'react'

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('mousedown', handle)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousedown', handle)
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  // 画面外にはみ出さないよう調整
  const style = {
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - items.length * 36 - 16),
  }

  return (
    <div
      ref={ref}
      className="fixed z-[10000] min-w-[180px] py-1.5 rounded-lg bg-[#2d2d2d]/95 backdrop-blur-xl border border-white/10 shadow-2xl text-white text-sm"
      style={style}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} className="my-1 border-t border-white/10" />
        ) : (
          <button
            key={i}
            onClick={() => {
              item.onClick?.()
              onClose()
            }}
            disabled={item.disabled}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 transition-colors ${
              item.disabled
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-[#0078d4] cursor-pointer'
            }`}
          >
            {item.icon && <span className="w-5 text-center">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        )
      )}
    </div>
  )
}
