import { motion } from 'framer-motion'

export default function AppWindow({ app, onClose }) {
  const iframeSrc = `${import.meta.env.BASE_URL}${app.src}`

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="absolute inset-x-0 top-11 bottom-16 z-40 flex flex-col bg-black rounded-t-3xl overflow-hidden shadow-2xl"
    >
      {/* アプリヘッダー */}
      <div className="h-12 flex items-center justify-between px-4 bg-slate-900/90 border-b border-white/10">
        <button
          onClick={onClose}
          className="text-indigo-400 text-sm font-medium flex items-center gap-1"
        >
          <span className="text-lg">‹</span> 戻る
        </button>
        <span className="text-white font-medium text-sm">{app.icon} {app.title}</span>
        <div className="w-12" />
      </div>

      {/* iframeコンテンツ */}
      <div className="flex-1 relative bg-white">
        <iframe
          src={iframeSrc}
          title={app.title}
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </motion.div>
  )
}
