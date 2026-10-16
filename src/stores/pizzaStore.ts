import { create } from 'zustand'

export type ToppingId = 'pepperoni' | 'mushroom' | 'olive' | 'pepper' | 'onion' | 'pineapple'

export interface ToppingDef {
  id: ToppingId
  label: string
  color: string
}

export const TOPPINGS: ToppingDef[] = [
  { id: 'pepperoni', label: 'Pepperoni', color: '#c03020' },
  { id: 'mushroom', label: 'Mushroom', color: '#c8b090' },
  { id: 'olive', label: 'Olive', color: '#2a2a2a' },
  { id: 'pepper', label: 'Pepper', color: '#40a840' },
  { id: 'onion', label: 'Onion', color: '#d8a0d0' },
  { id: 'pineapple', label: 'Pineapple', color: '#e8d040' },
]

const STORAGE_KEY = 'daydream:pizza'

interface PizzaStore {
  selectedToppings: ToppingId[]
  toggleTopping: (id: ToppingId) => void
}

function load(): ToppingId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ToppingId[]
      const valid = new Set<string>(TOPPINGS.map(t => t.id))
      return parsed.filter(id => valid.has(id))
    }
  } catch { /* corrupt */ }
  return []
}

function save(toppings: ToppingId[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(toppings)) } catch { /* quota */ }
}

export const usePizzaStore = create<PizzaStore>((set, get) => ({
  selectedToppings: load(),
  toggleTopping: (id) => {
    const current = get().selectedToppings
    const next = current.includes(id) ? current.filter(t => t !== id) : [...current, id]
    set({ selectedToppings: next })
    save(next)
  },
}))
