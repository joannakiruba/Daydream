import { create } from 'zustand'
import { generateId } from '../lib/id'

const STORAGE_KEY = 'daydream:captures'

export interface CaptureNote {
  id: string
  text: string
  createdAt: string
}

interface CaptureStore {
  notes: Record<string, CaptureNote>
  addNote: (text: string) => string
  deleteNote: (id: string) => void
}

function load(): Record<string, CaptureNote> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Record<string, CaptureNote>
  } catch { /* corrupt */ }
  return {}
}

function save(notes: Record<string, CaptureNote>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)) } catch { /* quota */ }
}

const initial = load()

export const useCaptureStore = create<CaptureStore>((set, get) => ({
  notes: initial,

  addNote: (text) => {
    const id = generateId()
    const note: CaptureNote = { id, text, createdAt: new Date().toISOString() }
    set((s) => ({ notes: { ...s.notes, [id]: note } }))
    save(get().notes)
    return id
  },

  deleteNote: (id) => {
    set((s) => {
      const { [id]: _removed, ...rest } = s.notes
      return { notes: rest }
    })
    save(get().notes)
  },
}))
