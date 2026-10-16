import { useMemo, type CSSProperties } from 'react'
import { useTaskStore } from '../../stores/taskStore'
import { useJournalStore } from '../../stores/journalStore'
import { today, formatDate, addDays } from '../../lib/dates'
import { computePercent } from '../../lib/taskHelpers'
import { PixelIcon } from '../PixelIcon'

export function DailyReviewWidget() {
  const tasks = useTaskStore((s) => s.tasks)
  const assignments = useTaskStore((s) => s.assignments)
  const dayRecords = useTaskStore((s) => s.dayRecords)
  const journalEntries = useJournalStore((s) => s.entries)

  const todayStr = today()

  const todayItems = useMemo(() => {
    return Object.values(assignments)
      .filter((a) => a.date === todayStr)
      .map((a) => ({ task: tasks[a.taskId], done: a.done }))
      .filter((i) => i.task != null)
  }, [assignments, tasks, todayStr])

  const doneCount = todayItems.filter((i) => i.done).length
  const totalCount = todayItems.length
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const streak = useMemo(() => {
    let count = 0
    let d = addDays(todayStr, -1)
    while (true) {
      const rec = dayRecords[d]
      if (!rec?.closedAt) break
      const dayAssignments = Object.values(assignments).filter((a) => a.date === d)
      if (dayAssignments.length === 0) break
      const allDone = dayAssignments.every((a) => a.done)
      if (!allDone) break
      count++
      d = addDays(d, -1)
    }
    return count
  }, [dayRecords, assignments, todayStr])

  const projectProgress = useMemo(() => {
    const projectTasks: Record<string, { done: number; total: number; name: string }> = {}
    for (const item of todayItems) {
      if (!item.task) continue
      const pid = item.task.projectId
      if (!pid) continue
      const project = useTaskStore.getState().projects[pid]
      if (!project) continue
      if (!projectTasks[pid]) projectTasks[pid] = { done: 0, total: 0, name: project.title }
      projectTasks[pid].total++
      if (item.done) projectTasks[pid].done++
    }
    return Object.values(projectTasks)
  }, [todayItems])

  const hasJournal = journalEntries[todayStr] != null

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)',
    height: '100%',
    padding: 'var(--space-sm)',
    overflowY: 'auto',
  }

  const statRow: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-sm)',
  }

  const statCard = (accent: string): CSSProperties => ({
    flex: 1,
    padding: 'var(--space-sm)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-overlay)',
    border: '1px solid var(--color-border)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    color: accent,
  })

  const statNum: CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.2,
  }

  const statLabel: CSSProperties = {
    fontSize: 10,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }

  const progressTrack: CSSProperties = {
    width: '100%',
    height: 8,
    borderRadius: 4,
    background: 'var(--color-bg-base)',
    overflow: 'hidden',
  }

  const progressFill = (value: number): CSSProperties => ({
    height: '100%',
    width: `${value}%`,
    borderRadius: 4,
    background: value >= 100 ? 'var(--color-success)' : 'var(--color-accent-dim)',
    transition: 'width var(--transition-normal)',
  })

  const sectionLabel: CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    fontWeight: 600,
  }

  const taskRow = (done: boolean): CSSProperties => ({
    fontSize: 12,
    color: done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
    textDecoration: done ? 'line-through' : 'none',
    padding: '2px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
  })

  const dot = (done: boolean): CSSProperties => ({
    width: 6,
    height: 6,
    borderRadius: 0,
    background: done ? 'var(--color-success)' : 'var(--color-text-muted)',
    flexShrink: 0,
  })

  const empty: CSSProperties = {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: 12,
    fontStyle: 'italic',
    padding: 'var(--space-lg) 0',
  }

  if (totalCount === 0) {
    return (
      <div style={container}>
        <div style={empty}>
          No tasks assigned today.
          <br />
          Add some tasks to see your daily review.
        </div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={statRow}>
        <div style={statCard('var(--color-accent)')}>
          <span style={statNum}>{doneCount}/{totalCount}</span>
          <span style={statLabel}>Tasks</span>
        </div>
        <div style={statCard('var(--color-success)')}>
          <span style={statNum}>{pct}%</span>
          <span style={statLabel}>Progress</span>
        </div>
        <div style={statCard('var(--color-warning)')}>
          <span style={statNum}>{streak}</span>
          <span style={statLabel}>Streak</span>
        </div>
      </div>

      <div>
        <div style={progressTrack}>
          <div style={progressFill(pct)} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        <div style={sectionLabel}>Today's Tasks</div>
        {todayItems.map((item) => (
          <div key={item.task!.id} style={taskRow(item.done)}>
            <div style={dot(item.done)} />
            <span>{item.task!.title}</span>
          </div>
        ))}
      </div>

      {projectProgress.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          <div style={sectionLabel}>Project Activity</div>
          {projectProgress.map((p) => (
            <div key={p.name} style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{p.name}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{p.done}/{p.total}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        <div style={sectionLabel}>Status</div>
        <div style={{ fontSize: 12, color: hasJournal ? 'var(--color-success)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          {hasJournal ? <PixelIcon name="check" size={10} color="var(--color-success)" /> : <span style={{ width: 10, height: 10, border: '2px solid var(--color-text-muted)', display: 'inline-block' }} />}
          {hasJournal ? 'Journal written' : 'No journal entry yet'}
        </div>
        <div style={{ fontSize: 12, color: dayRecords[todayStr]?.closedAt ? 'var(--color-success)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          {dayRecords[todayStr]?.closedAt ? <PixelIcon name="check" size={10} color="var(--color-success)" /> : <span style={{ width: 10, height: 10, border: '2px solid var(--color-text-muted)', display: 'inline-block' }} />}
          {dayRecords[todayStr]?.closedAt ? 'Day closed' : 'Day still open'}
        </div>
      </div>
    </div>
  )
}
