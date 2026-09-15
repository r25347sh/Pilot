import localforage from 'localforage'

localforage.config({
  name: 'PilotOS',
  storeName: 'settings',
  description: 'Pilot Virtual OS persistent storage',
})

const KEYS = {
  SETTINGS: 'pilot-settings',
  ICON_POSITIONS: 'pilot-icon-positions',
  INSTALLED_APPS: 'pilot-installed-apps',
}

export async function getSettings() {
  return (await localforage.getItem(KEYS.SETTINGS)) || null
}

export async function setSettings(data) {
  await localforage.setItem(KEYS.SETTINGS, data)
}

export async function getIconPositions() {
  return (await localforage.getItem(KEYS.ICON_POSITIONS)) || {}
}

export async function setIconPositions(positions) {
  await localforage.setItem(KEYS.ICON_POSITIONS, positions)
}

export async function getInstalledApps() {
  return (await localforage.getItem(KEYS.INSTALLED_APPS)) || []
}

export async function setInstalledApps(apps) {
  await localforage.setItem(KEYS.INSTALLED_APPS, apps)
}

export { KEYS }
