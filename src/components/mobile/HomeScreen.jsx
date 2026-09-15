import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppWindow from './AppWindow'
import Dock from './Dock'

export default function HomeScreen({ apps, openApps, openApp, focusApp, closeApp }) {
  // モバイルでは1つだけ全画面表示する想定（複数は履歴的に開く）
  const focusedId = Object.keys(openApps).find((id) => openApps[id]?.isFocused && openApps[id]?.isOpen)
  const isAppOpen = Boolean(focusedId)

  const handleOpen = (id) => {
    openApp(id)
  }

  const handleClose = () => {
    if (focusedId) closeApp(focusedId)
  }

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-black flex flex-col">
      {/* ステータスバー風 */}
      <div className="h-11 flex items-center justify-between px-5 text-white/80 text-xs font-medium pt-safe">
        <span>{new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex gap-1.5 items-center">
          <span>●●●</span>
          <span className="text-[10px]">LTE</span>
          <span>🔋</span>
        </div>
      </div>

      {/* ホーム画面アイコン群 */}
      <div className="flex-1 px-6 pt-8 pb-24 overflow-y-auto">
        <div className="grid grid-cols-4 gap-y-6 gap-x-4">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleOpen(app.id)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-[1.25rem] bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg border border-white/10">
                {app.icon}
              </div>
              <span className="text-white text-[11px] font-medium text-center leading-tight drop-shadow">
                {app.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* アプリウィンドウ（下からせり上がり） */}
      <AnimatePresence>
        {isAppOpen && focusedId && (
          <AppWindow
            key={focusedId}
            app={apps.find((a) => a.id === focusedId)}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Dock */}
      <Dock
        onHome={handleClose}
        isAppOpen={isAppOpen}
      />
    </div>
  )
}
