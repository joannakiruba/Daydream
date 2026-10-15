import { create } from 'zustand'

const STORAGE_KEY = 'daydream:scratchpad'

interface ScratchpadStore {
  content: string
  setContent: (text: string) => void
}

function load(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw != null) return raw
  } catch { /* corrupt */ }
  return ''
}

export const useScratchpadStore = create<ScratchpadStore>((set) => ({
  content: load(),

  setContent: (text) => {
    set({ content: text })
    try { localStorage.setItem(STORAGE_KEY, text) } catch { /* quota */ }
  },
}))
