import type { Task } from '../types/task'

export function getSubtasks(tasks: Record<string, Task>, parentId: string): Task[] {
  return Object.values(tasks)
    .filter(t => t.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getProjectTasks(tasks: Record<string, Task>, projectId: string): Task[] {
  return Object.values(tasks)
    .filter(t => t.projectId === projectId && t.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getRootTasks(tasks: Record<string, Task>): Task[] {
  return Object.values(tasks)
    .filter(t => t.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function computePercent(tasks: Record<string, Task>, taskId: string, depth = 0): number {
  if (depth > 10) return 0
  const task = tasks[taskId]
  if (!task) return 0
  if (task.completionMode === 'checkbox') return task.done ? 100 : 0
  if (task.completionMode === 'percentage') return task.percent
  const children = getSubtasks(tasks, taskId)
  if (children.length === 0) return task.done ? 100 : 0
  return Math.round(
    children.reduce((sum, c) => sum + computePercent(tasks, c.id, depth + 1), 0) / children.length
  )
}
