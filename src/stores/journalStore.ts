import { create } from 'zustand'

const STORAGE_KEY = 'daydream:journal'

export interface JournalEntry {
  date: string
  body: string
  updatedAt: string
}

interface JournalStore {
  entries: Record<string, JournalEntry>
  upsertEntry: (date: string, body: string) => void
  deleteEntry: (date: string) => void
}

function load(): Record<string, JournalEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Record<string, JournalEntry>
  } catch { /* corrupt */ }
  return {}
}

function save(entries: Record<string, JournalEntry>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)) } catch { /* quota */ }
}

const initial = load()

export const useJournalStore = create<JournalStore>((set, get) => ({
  entries: initial,

  upsertEntry: (date, body) => {
    const entry: JournalEntry = { date, body, updatedAt: new Date().toISOString() }
    set((s) => ({ entries: { ...s.entries, [date]: entry } }))
    save(get().entries)
  },

  deleteEntry: (date) => {
    set((s) => {
      const { [date]: _removed, ...rest } = s.entries
      return { entries: rest }
    })
    save(get().entries)
  },
}))
