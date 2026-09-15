import { useState, useEffect, useCallback } from 'react'
import Desktop from './components/desktop/Desktop'
import HomeScreen from './components/mobile/HomeScreen'

const APPS = [
  { id: 'profile', title: 'Profile', icon: '👤', src: 'app-profile.html' },
  { id: 'works', title: 'Works', icon: '💼', src: 'app-works.html' },
  { id: 'contact', title: 'Contact', icon: '✉️', src: 'app-contact.html' },
]

export default function App() {
  const [isMobile, setIsMobile] = useState(false)
  // グローバル状態: 開いているアプリとフォーカス
  const [openApps, setOpenApps] = useState({})
  // { id: { isOpen: true, isFocused: true, zIndex: 10, ... } }
  const [maxZ, setMaxZ] = useState(10)

  // 画面幅でDesktop / Mobile を完全出し分け
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const openApp = useCallback((id) => {
    setOpenApps((prev) => {
      const nextZ = maxZ + 1
      setMaxZ(nextZ)
      return {
        ...prev,
        [id]: {
          isOpen: true,
          isFocused: true,
          zIndex: nextZ,
          // Desktop用の位置・サイズ初期値
          x: 80 + Object.keys(prev).length * 30,
          y: 60 + Object.keys(prev).length * 30,
          width: 520,
          height: 380,
        },
      }
    })
    // 他をunfocus
    setOpenApps((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((k) => {
        if (k !== id) updated[k] = { ...updated[k], isFocused: false }
      })
      return updated
    })
  }, [maxZ])

  const focusApp = useCallback((id) => {
    setOpenApps((prev) => {
      const nextZ = maxZ + 1
      setMaxZ(nextZ)
      const updated = { ...prev }
      Object.keys(updated).forEach((k) => {
        updated[k] = {
          ...updated[k],
          isFocused: k === id,
          zIndex: k === id ? nextZ : updated[k].zIndex,
        }
      })
      return updated
    })
  }, [maxZ])

  const closeApp = useCallback((id) => {
    setOpenApps((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }, [])

  const updateWindow = useCallback((id, props) => {
    setOpenApps((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...props },
    }))
  }, [])

  const commonProps = {
    apps: APPS,
    openApps,
    openApp,
    focusApp,
    closeApp,
    updateWindow,
  }

  if (isMobile) {
    return <HomeScreen {...commonProps} />
  }
  return <Desktop {...commonProps} />
}
