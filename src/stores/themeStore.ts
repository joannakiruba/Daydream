import { create } from 'zustand'

export type SceneId = 'bedroom' | 'cafe' | 'garden'
export type WeatherId = 'clear' | 'rain' | 'snow'

interface ThemeState {
  scene: SceneId
  weather: WeatherId
  animationsEnabled: boolean
  setScene: (scene: SceneId) => void
  setWeather: (weather: WeatherId) => void
  setAnimationsEnabled: (enabled: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  scene: 'bedroom',
  weather: 'clear',
  animationsEnabled: true,
  setScene: (scene) => set({ scene }),
  setWeather: (weather) => set({ weather }),
  setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
}))
