import { create } from 'zustand'
import type { Task, Project, DailyAssignment, TaskInput, ProjectInput } from '../types/task'
import { generateId } from '../lib/id'

const STORAGE_KEY = 'daydream:task-data'

interface PersistedData {
  tasks: Record<string, Task>
  projects: Record<string, Project>
  assignments: Record<string, DailyAssignment>
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
      }
    }
  } catch { /* corrupt data */ }
  return { tasks: {}, projects: {}, assignments: {} }
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

  setActiveTab: (tab: ActiveTab) => void
}

const initial = loadData()

export const useTaskStore = create<TaskStore>((set, get) => {
  function persist() {
    const { tasks, projects, assignments } = get()
    saveData({ tasks, projects, assignments })
  }

  return {
    tasks: initial.tasks,
    projects: initial.projects,
    assignments: initial.assignments,
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
      set((s) => ({
        assignments: { ...s.assignments, [key]: { taskId, date, done: false } },
      }))
      persist()
    },

    unassignFromDay: (taskId, date) => {
      const key = `${taskId}:${date}`
      set((s) => {
        const { [key]: _removed, ...remaining } = s.assignments
        return { assignments: remaining }
      })
      persist()
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
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
  }
})
