import { useState, useEffect, useCallback } from 'react'
import Desktop from './components/desktop/Desktop'
import HomeScreen from './components/mobile/HomeScreen'
import { WALLPAPERS } from './components/desktop/SettingsApp'
import { mergeApps } from './apps/registry'
import {
  getSettings,
  setSettings,
  getIconPositions,
  setIconPositions,
  getInstalledApps,
  setInstalledApps,
} from './lib/storage'

const DEFAULT_WALLPAPER = WALLPAPERS[0].value

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [openApps, setOpenApps] = useState({})
  const [maxZ, setMaxZ] = useState(10)

  const [apps, setApps] = useState(() => mergeApps([]))
  const [installedList, setInstalledList] = useState([])
  const [iconPositions, setIconPositionsState] = useState({})

  const [themePref, setThemePref] = useState('system')
  const [wallpaper, setWallpaper] = useState(DEFAULT_WALLPAPER)
  const [resolvedTheme, setResolvedTheme] = useState(getSystemTheme)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [settings, positions, installed] = await Promise.all([
          getSettings(),
          getIconPositions(),
          getInstalledApps(),
        ])
        if (cancelled) return

        if (settings) {
          if (settings.theme) setThemePref(settings.theme)
          if (settings.wallpaper) setWallpaper(settings.wallpaper)
        }
        if (positions && typeof positions === 'object') {
          setIconPositionsState(positions)
        }
        const list = Array.isArray(installed) ? installed : []
        setInstalledList(list)
        setApps(mergeApps(list))
      } catch (e) {
        console.error('storage load failed', e)
        setApps(mergeApps([]))
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const apply = () => {
      const resolved = themePref === 'system' ? getSystemTheme() : themePref
      setResolvedTheme(resolved)
      document.documentElement.setAttribute('data-theme', resolved)
    }
    apply()
    if (themePref !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => apply()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [themePref])

  useEffect(() => {
    if (!ready) return
    setSettings({ theme: themePref, wallpaper }).catch(() => {})
  }, [themePref, wallpaper, ready])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const updateIconPosition = useCallback((id, pos) => {
    setIconPositionsState((prev) => {
      const next = { ...prev, [id]: pos }
      setIconPositions(next).catch(() => {})
      return next
    })
  }, [])

  const installApp = useCallback(async (item) => {
    setInstalledList((prev) => {
      if (prev.some((a) => a.id === item.id)) return prev
      const next = [...prev, item]
      setInstalledApps(next).catch(() => {})
      setApps(mergeApps(next))
      return next
    })
  }, [])

  const uninstallApp = useCallback(async (id) => {
    setInstalledList((prev) => {
      const next = prev.filter((a) => a.id !== id)
      setInstalledApps(next).catch(() => {})
      setApps(mergeApps(next))
      return next
    })
    setOpenApps((prev) => {
      const u = { ...prev }
      delete u[id]
      return u
    })
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
          const isCompact = id === 'settings' || id === 'store' || id === 'taskmanager'
          updated[id] = {
            isOpen: true,
            isFocused: true,
            isMinimized: false,
            isMaximized: false,
            isFullscreen: false,
            zIndex: nextZ,
            x: 100 + Object.keys(prev).length * 28,
            y: 50 + Object.keys(prev).length * 28,
            width: isCompact ? 640 : 900,
            height: isCompact ? 480 : 560,
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
          [id]: { ...cur, isMaximized: false, isFullscreen: false, ...rect, prevRect: null },
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
          [id]: { ...cur, isFullscreen: false, isMaximized: false, ...rect, prevRect: null },
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

  const storeProps = {
    installedIds: installedList.map((a) => a.id),
    onInstall: installApp,
    onUninstall: uninstallApp,
  }

  const taskManagerProps = {
    apps,
    openApps,
    focusApp,
    minimizeApp,
    closeApp,
  }

  const commonProps = {
    apps,
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
    storeProps,
    taskManagerProps,
    iconPositions,
    updateIconPosition,
  }

  if (!ready) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#0c1a2e] text-white/60 text-sm">
        Loading...
      </div>
    )
  }

  if (isMobile) {
    return <HomeScreen {...commonProps} />
  }
  return <Desktop {...commonProps} />
}
