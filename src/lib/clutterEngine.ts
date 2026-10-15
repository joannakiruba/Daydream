import type { Task, DailyAssignment } from '../types/task'
import { computePercent } from './taskHelpers'

export const NUM_SLOTS = 8

export interface ClutterSlot {
  slotIndex: number
  clutterLevel: number
  taskCount: number
}

function hashToSlot(taskId: string): number {
  let h = 0
  for (let i = 0; i < taskId.length; i++) {
    h = ((h << 5) - h + taskId.charCodeAt(i)) | 0
  }
  return Math.abs(h) % NUM_SLOTS
}

export function computeClutterSlots(
  tasks: Record<string, Task>,
  assignments: Record<string, DailyAssignment>,
  date: string,
): ClutterSlot[] {
  const buckets: { total: number; count: number }[] = Array.from(
    { length: NUM_SLOTS },
    () => ({ total: 0, count: 0 }),
  )

  for (const a of Object.values(assignments)) {
    if (a.date !== date) continue
    const t = tasks[a.taskId]
    if (!t || t.parentId !== null) continue
    const pct = computePercent(tasks, t.id)
    const incompletion = 1 - pct / 100
    const slot = hashToSlot(t.id)
    buckets[slot].total += incompletion
    buckets[slot].count += 1
  }

  return buckets.map((b, i) => ({
    slotIndex: i,
    clutterLevel: b.count > 0 ? b.total / b.count : 0,
    taskCount: b.count,
  }))
}
