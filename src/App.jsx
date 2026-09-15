import { useState, useEffect, useCallback } from 'react'
import Desktop from './components/desktop/Desktop'
import HomeScreen from './components/mobile/HomeScreen'

// 疑似アプリケーション（外部GitHub Pagesサイトをiframeで読み込み）
const APPS = [
  {
    id: 'reitansai',
    title: '麗澤祭',
    icon: '🎪',
    src: 'https://r25347sh.github.io/reitansai/',
    external: true,
  },
  {
    id: 'asobiseminar',
    title: 'Asobi Lab.',
    icon: '🎨',
    src: 'https://r25347sh.github.io/asobiseminar/',
    external: true,
  },
]

export default function App() {
  const [isMobile, setIsMobile] = useState(false)
  const [openApps, setOpenApps] = useState({})
  const [maxZ, setMaxZ] = useState(10)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const openApp = useCallback((id) => {
    setMaxZ((prevMax) => {
      const nextZ = prevMax + 1
      setOpenApps((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((k) => {
          updated[k] = { ...updated[k], isFocused: false }
        })
        const existing = prev[id]
        if (existing?.isOpen) {
          // 既に開いている → フォーカス＋最小化解除
          updated[id] = {
            ...existing,
            isFocused: true,
            isMinimized: false,
            zIndex: nextZ,
          }
        } else {
          updated[id] = {
            isOpen: true,
            isFocused: true,
            isMinimized: false,
            isMaximized: false,
            isFullscreen: false,
            zIndex: nextZ,
            x: 100 + Object.keys(prev).length * 28,
            y: 50 + Object.keys(prev).length * 28,
            width: 900,
            height: 560,
            prevRect: null, // maximize/fullscreen からの復元用
          }
        }
        return updated
      })
      return nextZ
    })
  }, [])

  const focusApp = useCallback((id) => {
    setMaxZ((prevMax) => {
      const nextZ = prevMax + 1
      setOpenApps((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((k) => {
          updated[k] = {
            ...updated[k],
            isFocused: k === id,
            zIndex: k === id ? nextZ : updated[k].zIndex,
            // タスクバーからクリック時は最小化解除
            isMinimized: k === id ? false : updated[k].isMinimized,
          }
        })
        return updated
      })
      return nextZ
    })
  }, [])

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

  // 最小化
  const minimizeApp = useCallback((id) => {
    setOpenApps((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true, isFocused: false },
    }))
  }, [])

  // 最大化 / 復元
  const toggleMaximize = useCallback((id) => {
    setOpenApps((prev) => {
      const cur = prev[id]
      if (!cur) return prev
      if (cur.isMaximized || cur.isFullscreen) {
        // 復元
        const rect = cur.prevRect || { x: 100, y: 50, width: 900, height: 560 }
        return {
          ...prev,
          [id]: {
            ...cur,
            isMaximized: false,
            isFullscreen: false,
            ...rect,
            prevRect: null,
          },
        }
      }
      // 最大化
      return {
        ...prev,
        [id]: {
          ...cur,
          isMaximized: true,
          isFullscreen: false,
          prevRect: { x: cur.x, y: cur.y, width: cur.width, height: cur.height },
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight - 48, // タスクバー分
        },
      }
    })
  }, [])

  // 全画面
  const toggleFullscreen = useCallback((id) => {
    setOpenApps((prev) => {
      const cur = prev[id]
      if (!cur) return prev
      if (cur.isFullscreen) {
        const rect = cur.prevRect || { x: 100, y: 50, width: 900, height: 560 }
        return {
          ...prev,
          [id]: {
            ...cur,
            isFullscreen: false,
            isMaximized: false,
            ...rect,
            prevRect: null,
          },
        }
      }
      return {
        ...prev,
        [id]: {
          ...cur,
          isFullscreen: true,
          isMaximized: false,
          prevRect: cur.isMaximized
            ? cur.prevRect
            : { x: cur.x, y: cur.y, width: cur.width, height: cur.height },
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        },
      }
    })
  }, [])

  const commonProps = {
    apps: APPS,
    openApps,
    openApp,
    focusApp,
    closeApp,
    updateWindow,
    minimizeApp,
    toggleMaximize,
    toggleFullscreen,
  }

  if (isMobile) {
    return <HomeScreen {...commonProps} />
  }
  return <Desktop {...commonProps} />
}
