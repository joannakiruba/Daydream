import { create } from 'zustand'
import type { Task, Project, DailyAssignment, TaskInput, ProjectInput, DayRecord } from '../types/task'
import { generateId } from '../lib/id'
import { today } from '../lib/dates'

const STORAGE_KEY = 'daydream:task-data'

interface PersistedData {
  tasks: Record<string, Task>
  projects: Record<string, Project>
  assignments: Record<string, DailyAssignment>
  dayRecords: Record<string, DayRecord>
}

function loadData(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        tasks: parsed.tasks ?? {},
        projects: parsed.projects ?? {},
        assignments: parsed.assignments ?? {},
        dayRecords: parsed.dayRecords ?? {},
      }
    }
  } catch { /* corrupt data */ }
  return { tasks: {}, projects: {}, assignments: {}, dayRecords: {} }
}

function saveData(data: PersistedData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* quota */ }
}

export type ActiveTab = 'today' | 'projects' | 'all'

interface TaskStore {
  tasks: Record<string, Task>
  projects: Record<string, Project>
  assignments: Record<string, DailyAssignment>
  dayRecords: Record<string, DayRecord>
  activeTab: ActiveTab

  addTask: (input: TaskInput) => string
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  addProject: (input: ProjectInput) => string
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  assignToDay: (taskId: string, date: string) => void
  unassignFromDay: (taskId: string, date: string) => void
  toggleDailyDone: (taskId: string, date: string) => void

  closeDay: (date: string) => void
  deferTask: (taskId: string, fromDate: string, toDate: string) => void
  markAllComplete: (date: string) => void

  setActiveTab: (tab: ActiveTab) => void
}

const initial = loadData()

function autoCloseMissedDays(data: PersistedData): PersistedData {
  const todayStr = today()
  const assignedDates = new Set<string>()
  for (const a of Object.values(data.assignments)) {
    assignedDates.add(a.date)
  }

  let changed = false
  const dayRecords = { ...data.dayRecords }

  for (const date of assignedDates) {
    if (date >= todayStr) continue
    if (dayRecords[date]?.closedAt) continue
    dayRecords[date] = {
      date,
      closedAt: new Date().toISOString(),
      allCompleteAt: dayRecords[date]?.allCompleteAt ?? null,
    }
    changed = true
  }

  if (!changed) return data
  return { ...data, dayRecords }
}

const bootstrapped = autoCloseMissedDays(initial)
if (bootstrapped !== initial) {
  saveData(bootstrapped)
}

export const useTaskStore = create<TaskStore>((set, get) => {
  function persist() {
    const { tasks, projects, assignments, dayRecords } = get()
    saveData({ tasks, projects, assignments, dayRecords })
  }

  function checkAllComplete(date: string) {
    const state = get()
    const dayAssignments = Object.values(state.assignments).filter((a) => a.date === date)
    const existing = state.dayRecords[date]

    if (dayAssignments.length === 0) {
      if (existing?.allCompleteAt) {
        set((s) => ({
          dayRecords: {
            ...s.dayRecords,
            [date]: { ...existing, allCompleteAt: null },
          },
        }))
        persist()
      }
      return
    }

    const allDone = dayAssignments.every((a) => a.done)

    if (allDone && !existing?.allCompleteAt) {
      set((s) => ({
        dayRecords: {
          ...s.dayRecords,
          [date]: { date, closedAt: existing?.closedAt ?? null, allCompleteAt: new Date().toISOString() },
        },
      }))
      persist()
    } else if (!allDone && existing?.allCompleteAt) {
      set((s) => ({
        dayRecords: {
          ...s.dayRecords,
          [date]: { ...existing, allCompleteAt: null },
        },
      }))
      persist()
    }
  }

  return {
    tasks: bootstrapped.tasks,
    projects: bootstrapped.projects,
    assignments: bootstrapped.assignments,
    dayRecords: bootstrapped.dayRecords,
    activeTab: 'today',

    addTask: (input) => {
      const id = generateId()
      const task: Task = {
        id,
        title: input.title,
        description: input.description ?? '',
        completionMode: input.completionMode ?? 'checkbox',
        done: false,
        percent: 0,
        priority: input.priority ?? 2,
        deadline: input.deadline ?? null,
        timeEstimate: input.timeEstimate ?? null,
        projectId: input.projectId ?? null,
        parentId: input.parentId ?? null,
        sortOrder: Date.now(),
        createdAt: new Date().toISOString(),
        completedAt: null,
      }
      set((s) => ({ tasks: { ...s.tasks, [id]: task } }))
      persist()
      return id
    },

    updateTask: (id, updates) => {
      set((s) => {
        const existing = s.tasks[id]
        if (!existing) return s
        const merged = { ...existing, ...updates }
        if (updates.done === true && !existing.completedAt) {
          merged.completedAt = new Date().toISOString()
        } else if (updates.done === false) {
          merged.completedAt = null
        }
        return { tasks: { ...s.tasks, [id]: merged } }
      })
      persist()
    },

    deleteTask: (id) => {
      set((s) => {
        const toDelete = new Set([id])
        let changed = true
        while (changed) {
          changed = false
          for (const t of Object.values(s.tasks)) {
            if (t.parentId && toDelete.has(t.parentId) && !toDelete.has(t.id)) {
              toDelete.add(t.id)
              changed = true
            }
          }
        }
        const tasks: Record<string, Task> = {}
        for (const [k, v] of Object.entries(s.tasks)) {
          if (!toDelete.has(k)) tasks[k] = v
        }
        const assignments: Record<string, DailyAssignment> = {}
        for (const [k, v] of Object.entries(s.assignments)) {
          if (!toDelete.has(v.taskId)) assignments[k] = v
        }
        return { tasks, assignments }
      })
      persist()
    },

    addProject: (input) => {
      const id = generateId()
      const project: Project = {
        id,
        title: input.title,
        description: input.description ?? '',
        color: input.color ?? '#c4b5fd',
        createdAt: new Date().toISOString(),
        archivedAt: null,
      }
      set((s) => ({ projects: { ...s.projects, [id]: project } }))
      persist()
      return id
    },

    updateProject: (id, updates) => {
      set((s) => {
        const existing = s.projects[id]
        if (!existing) return s
        return { projects: { ...s.projects, [id]: { ...existing, ...updates } } }
      })
      persist()
    },

    deleteProject: (id) => {
      set((s) => {
        const { [id]: _removed, ...remaining } = s.projects
        const tasks = { ...s.tasks }
        for (const t of Object.values(tasks)) {
          if (t.projectId === id) {
            tasks[t.id] = { ...t, projectId: null }
          }
        }
        return { projects: remaining, tasks }
      })
      persist()
    },

    assignToDay: (taskId, date) => {
      const key = `${taskId}:${date}`
      set((s) => {
        if (s.assignments[key]) return s
        return { assignments: { ...s.assignments, [key]: { taskId, date, done: false } } }
      })
      persist()
      checkAllComplete(date)
    },

    unassignFromDay: (taskId, date) => {
      const key = `${taskId}:${date}`
      set((s) => {
        const { [key]: _removed, ...remaining } = s.assignments
        return { assignments: remaining }
      })
      persist()
      checkAllComplete(date)
    },

    toggleDailyDone: (taskId, date) => {
      const key = `${taskId}:${date}`
      set((s) => {
        const existing = s.assignments[key]
        if (!existing) return s
        return {
          assignments: { ...s.assignments, [key]: { ...existing, done: !existing.done } },
        }
      })
      persist()
      checkAllComplete(date)
    },

    closeDay: (date) => {
      if (date > today()) return
      set((s) => {
        const existing = s.dayRecords[date]
        if (existing?.closedAt) return s
        return {
          dayRecords: {
            ...s.dayRecords,
            [date]: {
              date,
              closedAt: new Date().toISOString(),
              allCompleteAt: existing?.allCompleteAt ?? null,
            },
          },
        }
      })
      persist()
    },

    deferTask: (taskId, fromDate, toDate) => {
      const fromKey = `${taskId}:${fromDate}`
      const toKey = `${taskId}:${toDate}`
      set((s) => {
        if (!s.assignments[fromKey]) return s
        const { [fromKey]: _removed, ...remaining } = s.assignments
        return {
          assignments: { ...remaining, [toKey]: { taskId, date: toDate, done: false } },
        }
      })
      persist()
      checkAllComplete(fromDate)
      checkAllComplete(toDate)
    },

    markAllComplete: (date) => {
      const now = new Date().toISOString()
      set((s) => {
        const updated = { ...s.assignments }
        const taskUpdates = { ...s.tasks }
        for (const [key, a] of Object.entries(updated)) {
          if (a.date !== date || a.done) continue
          updated[key] = { ...a, done: true }
          const task = taskUpdates[a.taskId]
          if (!task) continue
          taskUpdates[a.taskId] = {
            ...task,
            done: true,
            percent: 100,
            completedAt: task.completedAt ?? now,
          }
        }
        return { assignments: updated, tasks: taskUpdates }
      })
      persist()
      checkAllComplete(date)
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
  }
})
