import { create } from 'zustand'

export type SceneId = 'bedroom' | 'cafe' | 'garden'
export type WeatherId = 'clear' | 'rain' | 'snow'

const STORAGE_KEY = 'daydream:theme-state'

interface ThemeState {
  scene: SceneId
  weather: WeatherId
  animationsEnabled: boolean
  setScene: (scene: SceneId) => void
  setWeather: (weather: WeatherId) => void
  setAnimationsEnabled: (enabled: boolean) => void
}

interface ThemeData {
  scene: SceneId
  weather: WeatherId
  animationsEnabled: boolean
}

function loadTheme(): Partial<ThemeData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<ThemeData>
  } catch {
    return {}
  }
}

function saveTheme(state: ThemeData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded — silently ignore */ }
}

const saved = loadTheme()

export const useThemeStore = create<ThemeState>((set, get) => ({
  scene: saved.scene ?? 'bedroom',
  weather: saved.weather ?? 'clear',
  animationsEnabled: saved.animationsEnabled ?? true,

  setScene: (scene) => {
    set({ scene })
    const s = get()
    saveTheme({ scene: s.scene, weather: s.weather, animationsEnabled: s.animationsEnabled })
  },
  setWeather: (weather) => {
    set({ weather })
    const s = get()
    saveTheme({ scene: s.scene, weather: s.weather, animationsEnabled: s.animationsEnabled })
  },
  setAnimationsEnabled: (enabled) => {
    set({ animationsEnabled: enabled })
    const s = get()
    saveTheme({ scene: s.scene, weather: s.weather, animationsEnabled: s.animationsEnabled })
  },
}))
