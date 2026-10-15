import { create } from 'zustand'
import { generateId } from '../lib/id'

const STORAGE_KEY = 'daydream:countdowns'

export interface Countdown {
  id: string
  title: string
  targetDate: string
  createdAt: string
}

interface CountdownStore {
  countdowns: Record<string, Countdown>
  addCountdown: (title: string, targetDate: string) => string
  deleteCountdown: (id: string) => void
}

function load(): Record<string, Countdown> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Record<string, Countdown>
  } catch { /* corrupt */ }
  return {}
}

function save(countdowns: Record<string, Countdown>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(countdowns)) } catch { /* quota */ }
}

const initial = load()

export const useCountdownStore = create<CountdownStore>((set, get) => ({
  countdowns: initial,

  addCountdown: (title, targetDate) => {
    const id = generateId()
    const countdown: Countdown = { id, title, targetDate, createdAt: new Date().toISOString() }
    set((s) => ({ countdowns: { ...s.countdowns, [id]: countdown } }))
    save(get().countdowns)
    return id
  },

  deleteCountdown: (id) => {
    set((s) => {
      const { [id]: _removed, ...rest } = s.countdowns
      return { countdowns: rest }
    })
    save(get().countdowns)
  },
}))
