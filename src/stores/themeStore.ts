import { create } from 'zustand'
import {
  type ThemePreset,
  type UITokens,
  getPreset,
  applyUITokens,
  buildUIOverrides,
} from '../lib/themes'

const STORAGE_KEY = 'daydream:theme-state'

interface PersistedTheme {
  presetId: string
  customAccent: string | null
  respectReducedMotion: boolean
}

interface ThemeState {
  presetId: string
  preset: ThemePreset
  customAccent: string | null
  respectReducedMotion: boolean
  reducedMotionActive: boolean
  uiTokens: UITokens

  setPreset: (id: string) => void
  setCustomAccent: (hex: string | null) => void
  setRespectReducedMotion: (respect: boolean) => void
}

function isValidHex(v: unknown): v is string {
  return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)
}

function load(): PersistedTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        presetId: typeof parsed.presetId === 'string' ? parsed.presetId : 'cozy-violet',
        customAccent: isValidHex(parsed.customAccent) ? parsed.customAccent : null,
        respectReducedMotion: typeof parsed.respectReducedMotion === 'boolean' ? parsed.respectReducedMotion : true,
      }
    }
  } catch { /* corrupt */ }
  return { presetId: 'cozy-violet', customAccent: null, respectReducedMotion: true }
}

function save(data: PersistedTheme) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* quota */ }
}

function computeDerived(preset: ThemePreset, customAccent: string | null) {
  return { uiTokens: buildUIOverrides(preset.ui, customAccent) }
}

const saved = load()
const initialPreset = getPreset(saved.presetId)
const initialDerived = computeDerived(initialPreset, saved.customAccent)

applyUITokens(initialDerived.uiTokens)

export const useThemeStore = create<ThemeState>((set, get) => {
  function persist() {
    const s = get()
    save({ presetId: s.presetId, customAccent: s.customAccent, respectReducedMotion: s.respectReducedMotion })
  }

  function recompute() {
    const s = get()
    const derived = computeDerived(s.preset, s.customAccent)
    set(derived)
    applyUITokens(derived.uiTokens)
  }

  return {
    presetId: saved.presetId,
    preset: initialPreset,
    customAccent: saved.customAccent,
    respectReducedMotion: saved.respectReducedMotion,
    reducedMotionActive: false,
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

    setRespectReducedMotion: (respect) => {
      set({ respectReducedMotion: respect })
      persist()
    },
  }
})
