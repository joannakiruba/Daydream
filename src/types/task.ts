export type CompletionMode = 'checkbox' | 'percentage' | 'subtask'

export type Priority = 1 | 2 | 3 | 4

export interface Task {
  id: string
  title: string
  description: string
  completionMode: CompletionMode
  done: boolean
  percent: number
  priority: Priority
  deadline: string | null
  timeEstimate: number | null
  projectId: string | null
  parentId: string | null
  sortOrder: number
  createdAt: string
  completedAt: string | null
}

export interface Project {
  id: string
  title: string
  description: string
  color: string
  createdAt: string
  archivedAt: string | null
}

export interface DailyAssignment {
  taskId: string
  date: string
  done: boolean
}

export interface TaskInput {
  title: string
  description?: string
  completionMode?: CompletionMode
  priority?: Priority
  deadline?: string | null
  timeEstimate?: number | null
  projectId?: string | null
  parentId?: string | null
}

export interface ProjectInput {
  title: string
  description?: string
  color?: string
}
