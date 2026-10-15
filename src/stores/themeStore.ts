import { create } from 'zustand'
import {
  type ThemePreset,
  type WeatherId,
  type ScenePalette,
  type UITokens,
  getPreset,
  applyUITokens,
  buildUIOverrides,
} from '../lib/themes'

export type { WeatherId, ScenePalette }
export type SceneId = 'bedroom' | 'cafe' | 'garden'

const STORAGE_KEY = 'daydream:theme-state'

interface PersistedTheme {
  presetId: string
  customAccent: string | null
  weatherOverride: WeatherId | null
  animationSpeed: number
  respectReducedMotion: boolean
}

interface ThemeState {
  presetId: string
  preset: ThemePreset
  customAccent: string | null
  weatherOverride: WeatherId | null
  animationSpeed: number
  respectReducedMotion: boolean
  reducedMotionActive: boolean

  scenePalette: ScenePalette
  uiTokens: UITokens
  weather: WeatherId
  animate: boolean

  setPreset: (id: string) => void
  setCustomAccent: (hex: string | null) => void
  setWeatherOverride: (w: WeatherId | null) => void
  setAnimationSpeed: (speed: number) => void
  setRespectReducedMotion: (respect: boolean) => void
}

function load(): PersistedTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        presetId: parsed.presetId ?? 'rainy-bedroom',
        customAccent: parsed.customAccent ?? null,
        weatherOverride: parsed.weatherOverride ?? null,
        animationSpeed: parsed.animationSpeed ?? 1,
        respectReducedMotion: parsed.respectReducedMotion ?? true,
      }
    }
  } catch { /* corrupt */ }
  return { presetId: 'rainy-bedroom', customAccent: null, weatherOverride: null, animationSpeed: 1, respectReducedMotion: true }
}

function save(data: PersistedTheme) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* quota */ }
}

function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function computeDerived(preset: ThemePreset, customAccent: string | null, weatherOverride: WeatherId | null, animationSpeed: number, respectReducedMotion: boolean, reducedMotionActive: boolean) {
  const uiTokens = buildUIOverrides(preset.ui, customAccent)
  const weather = weatherOverride ?? preset.weather
  const motionBlocked = respectReducedMotion && reducedMotionActive
  const animate = !motionBlocked && animationSpeed > 0
  return { scenePalette: preset.scene, uiTokens, weather, animate }
}

const saved = load()
const initialPreset = getPreset(saved.presetId)
const initialReducedMotion = detectReducedMotion()
const initialDerived = computeDerived(initialPreset, saved.customAccent, saved.weatherOverride, saved.animationSpeed, saved.respectReducedMotion, initialReducedMotion)

applyUITokens(initialDerived.uiTokens)

export const useThemeStore = create<ThemeState>((set, get) => {
  function persist() {
    const s = get()
    save({ presetId: s.presetId, customAccent: s.customAccent, weatherOverride: s.weatherOverride, animationSpeed: s.animationSpeed, respectReducedMotion: s.respectReducedMotion })
  }

  function recompute() {
    const s = get()
    const derived = computeDerived(s.preset, s.customAccent, s.weatherOverride, s.animationSpeed, s.respectReducedMotion, s.reducedMotionActive)
    set(derived)
    applyUITokens(derived.uiTokens)
  }

  if (typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', (e) => {
      set({ reducedMotionActive: e.matches })
      recompute()
    })
  }

  return {
    presetId: saved.presetId,
    preset: initialPreset,
    customAccent: saved.customAccent,
    weatherOverride: saved.weatherOverride,
    animationSpeed: saved.animationSpeed,
    respectReducedMotion: saved.respectReducedMotion,
    reducedMotionActive: initialReducedMotion,
    ...initialDerived,

    setPreset: (id) => {
      const preset = getPreset(id)
      set({ presetId: id, preset })
      recompute()
      persist()
    },

    setCustomAccent: (hex) => {
      set({ customAccent: hex })
      recompute()
      persist()
    },

    setWeatherOverride: (w) => {
      set({ weatherOverride: w })
      recompute()
      persist()
    },

    setAnimationSpeed: (speed) => {
      set({ animationSpeed: speed })
      recompute()
      persist()
    },

    setRespectReducedMotion: (respect) => {
      set({ respectReducedMotion: respect })
      recompute()
      persist()
    },
  }
})
