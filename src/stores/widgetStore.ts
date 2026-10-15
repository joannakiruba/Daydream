import { create } from 'zustand'

export type WidgetId =
  | 'tasks'
  | 'journal'
  | 'scratchpad'
  | 'capture'
  | 'calendar'
  | 'countdowns'
  | 'review'
  | 'theme'

export type DockPosition = 'left' | 'right' | 'top' | 'bottom'

export type DockAxis = 'horizontal' | 'vertical'

export function dockAxis(pos: DockPosition): DockAxis {
  return pos === 'left' || pos === 'right' ? 'vertical' : 'horizontal'
}

export function drawerSide(pos: DockPosition): 'left' | 'right' | 'top' | 'bottom' {
  const map: Record<DockPosition, 'left' | 'right' | 'top' | 'bottom'> = {
    left: 'left',
    right: 'right',
    top: 'top',
    bottom: 'bottom',
  }
  return map[pos]
}

const STORAGE_KEY = 'daydream:widget-state'

const VALID_POSITIONS = new Set<string>(['left', 'right', 'top', 'bottom'])
const VALID_WIDGETS = new Set<string>(['tasks', 'journal', 'scratchpad', 'capture', 'calendar', 'countdowns', 'review', 'theme'])

function loadPersisted(): { dockPosition: DockPosition; activeWidget: WidgetId | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const pos = VALID_POSITIONS.has(parsed.dockPosition) ? parsed.dockPosition as DockPosition : 'left'
      const widget = parsed.activeWidget && VALID_WIDGETS.has(parsed.activeWidget) ? parsed.activeWidget as WidgetId : null
      return { dockPosition: pos, activeWidget: widget }
    }
  } catch { /* ignore corrupt data */ }
  return { dockPosition: 'left', activeWidget: null }
}

function persist(state: { dockPosition: DockPosition; activeWidget: WidgetId | null }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded, ignore */ }
}

interface WidgetState {
  activeWidget: WidgetId | null
  dockPosition: DockPosition
  setActiveWidget: (id: WidgetId | null) => void
  toggleWidget: (id: WidgetId) => void
  setDockPosition: (pos: DockPosition) => void
  cycleDockPosition: () => void
}

const cycle: DockPosition[] = ['left', 'top', 'right', 'bottom']

const initial = loadPersisted()

export const useWidgetStore = create<WidgetState>((set, get) => ({
  activeWidget: initial.activeWidget,
  dockPosition: initial.dockPosition,

  setActiveWidget: (id) => {
    set({ activeWidget: id })
    persist({ dockPosition: get().dockPosition, activeWidget: id })
  },

  toggleWidget: (id) => {
    const next = get().activeWidget === id ? null : id
    set({ activeWidget: next })
    persist({ dockPosition: get().dockPosition, activeWidget: next })
  },

  setDockPosition: (pos) => {
    set({ dockPosition: pos })
    persist({ dockPosition: pos, activeWidget: get().activeWidget })
  },

  cycleDockPosition: () => {
    const current = get().dockPosition
    const idx = cycle.indexOf(current)
    const next = cycle[(idx + 1) % cycle.length]
    set({ dockPosition: next })
    persist({ dockPosition: next, activeWidget: get().activeWidget })
  },
}))
