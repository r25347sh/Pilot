import { useState, useEffect, useCallback } from 'react'
import Desktop from './components/desktop/Desktop'
import HomeScreen from './components/mobile/HomeScreen'
import { WALLPAPERS } from './components/desktop/SettingsApp'

const APPS = [
  {
    id: 'reitansai',
    title: '麗探祭',
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
  {
    id: 'settings',
    title: '設定',
    icon: '⚙️',
    internal: true, // Reactコンポーネントで描画
  },
]

const DEFAULT_WALLPAPER = WALLPAPERS[0].value

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('pilot-settings')
    if (raw) return JSON.parse(raw)
  } catch {}
  return { theme: 'dark', wallpaper: DEFAULT_WALLPAPER }
}

export default function App() {
  const [isMobile, setIsMobile] = useState(false)
  const [openApps, setOpenApps] = useState({})
  const [maxZ, setMaxZ] = useState(10)

  const saved = loadSettings()
  const [themePref, setThemePref] = useState(saved.theme || 'dark')
  const [wallpaper, setWallpaper] = useState(saved.wallpaper || DEFAULT_WALLPAPER)
  const [resolvedTheme, setResolvedTheme] = useState(
    saved.theme === 'system' ? getSystemTheme() : saved.theme || 'dark'
  )

  // テーマ解決 & 永続化
  useEffect(() => {
    const resolved = themePref === 'system' ? getSystemTheme() : themePref
    setResolvedTheme(resolved)
    document.documentElement.setAttribute('data-theme', resolved)
    localStorage.setItem(
      'pilot-settings',
      JSON.stringify({ theme: themePref, wallpaper })
    )
  }, [themePref, wallpaper])

  useEffect(() => {
    if (themePref !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setResolvedTheme(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [themePref])

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
          updated[id] = {
            ...existing,
            isFocused: true,
            isMinimized: false,
            zIndex: nextZ,
          }
        } else {
          const isSettings = id === 'settings'
          updated[id] = {
            isOpen: true,
            isFocused: true,
            isMinimized: false,
            isMaximized: false,
            isFullscreen: false,
            zIndex: nextZ,
            x: 100 + Object.keys(prev).length * 28,
            y: 50 + Object.keys(prev).length * 28,
            width: isSettings ? 640 : 900,
            height: isSettings ? 480 : 560,
            prevRect: null,
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

  const minimizeApp = useCallback((id) => {
    setOpenApps((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true, isFocused: false },
    }))
  }, [])

  const toggleMaximize = useCallback((id) => {
    setOpenApps((prev) => {
      const cur = prev[id]
      if (!cur) return prev
      if (cur.isMaximized || cur.isFullscreen) {
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
          height: window.innerHeight - 48,
        },
      }
    })
  }, [])

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

  const settingsProps = {
    theme: themePref,
    wallpaper,
    onThemeChange: setThemePref,
    onWallpaperChange: setWallpaper,
  }

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
    wallpaper,
    resolvedTheme,
    settingsProps,
  }

  if (isMobile) {
    return <HomeScreen {...commonProps} />
  }
  return <Desktop {...commonProps} />
}
