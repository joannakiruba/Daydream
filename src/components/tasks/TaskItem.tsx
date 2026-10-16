import { useState, useMemo, type CSSProperties } from 'react'
import type { Priority } from '../../types/task'
import { useTaskStore } from '../../stores/taskStore'
import { getSubtasks, computePercent } from '../../lib/taskHelpers'
import { formatDate, daysUntil, formatTimeEstimate, today } from '../../lib/dates'
import { TaskEditor } from './TaskEditor'
import { PixelIcon } from '../PixelIcon'

const priorityColors: Record<Priority, string> = {
  1: 'var(--color-text-muted)',
  2: 'var(--color-text-secondary)',
  3: 'var(--color-warning)',
  4: 'var(--color-danger)',
}

function ProgressBar({
  value,
  interactive,
  onChange,
}: {
  value: number
  interactive?: boolean
  onChange?: (v: number) => void
}) {
  const track: CSSProperties = {
    flex: 1,
    height: 6,
    borderRadius: 3,
    background: 'var(--color-bg-base)',
    cursor: interactive ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
  }
  const fill: CSSProperties = {
    position: 'absolute',
    inset: '0 auto 0 0',
    width: `${value}%`,
    borderRadius: 3,
    background: value >= 100 ? 'var(--color-success)' : 'var(--color-accent-dim)',
    transition: 'width var(--transition-fast)',
  }
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onChange) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100 / 5) * 5
    onChange(Math.max(0, Math.min(100, pct)))
  }
  return (
    <div
      style={track}
      onClick={handleClick}
      role={interactive ? 'slider' : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 100 : undefined}
      aria-valuenow={interactive ? value : undefined}
      aria-label={interactive ? 'Task progress' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div style={fill} />
    </div>
  )
}

interface TaskItemProps {
  taskId: string
  depth?: number
  showDailyToggle?: boolean
  dailyDate?: string
}

export function TaskItem({ taskId, depth = 0, showDailyToggle, dailyDate }: TaskItemProps) {
  const task = useTaskStore((s) => s.tasks[taskId])
  const allTasks = useTaskStore((s) => s.tasks)
  const assignments = useTaskStore((s) => s.assignments)
  const projects = useTaskStore((s) => s.projects)
  const { updateTask, deleteTask, addTask, assignToDay } = useTaskStore()

  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [addingChild, setAddingChild] = useState(false)
  const [childTitle, setChildTitle] = useState('')
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  const subtasks = useMemo(() => getSubtasks(allTasks, taskId), [allTasks, taskId])
  const percent = useMemo(() => computePercent(allTasks, taskId), [allTasks, taskId])
  const hasChildren = subtasks.length > 0

  if (!task) return null

  if (editing) {
    return (
      <TaskEditor
        initial={task}
        onSave={(input) => {
          updateTask(taskId, input)
          setEditing(false)
        }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  const todayStr = today()
  const isAssignedToday = `${taskId}:${todayStr}` in assignments
  const dailyKey = dailyDate ? `${taskId}:${dailyDate}` : null
  const dailyAssignment = dailyKey ? assignments[dailyKey] : undefined
  const dailyDone = dailyAssignment?.done ?? false
  const isComplete = percent >= 100
  const project = task.projectId ? projects[task.projectId] : null
  const deadlineDays = task.deadline ? daysUntil(task.deadline) : null

  const handleToggleDone = () => {
    if (showDailyToggle && dailyDate) {
      const { toggleDailyDone } = useTaskStore.getState()
      toggleDailyDone(taskId, dailyDate)
      if (task.completionMode === 'checkbox') {
        updateTask(taskId, { done: !dailyDone })
      }
    } else if (task.completionMode === 'checkbox') {
      updateTask(taskId, { done: !task.done })
    }
  }

  const handlePercentChange = (v: number) => {
    updateTask(taskId, { percent: v, done: v >= 100 })
  }

  const handleAddChild = () => {
    if (!childTitle.trim()) return
    addTask({ title: childTitle.trim(), parentId: taskId, projectId: task.projectId })
    setChildTitle('')
    setAddingChild(false)
    if (!expanded) setExpanded(true)
  }

  const isDone = showDailyToggle ? dailyDone : (task.completionMode === 'checkbox' ? task.done : isComplete)

  const row: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-sm)',
    padding: '6px var(--space-sm)',
    paddingLeft: `calc(var(--space-sm) + ${depth * 16}px)`,
    borderRadius: 'var(--radius-sm)',
    background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
    transition: 'background var(--transition-fast)',
  }

  const checkSize = 20
  const checkStyle: CSSProperties = {
    width: checkSize,
    height: checkSize,
    borderRadius: 0,
    border: `2px solid ${isDone ? 'var(--color-accent)' : 'var(--color-text-muted)'}`,
    background: isDone ? 'var(--color-accent)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: isDone ? 'var(--color-bg-base)' : 'transparent',
    flexShrink: 0,
    marginTop: 2,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  }

  const titleStyle: CSSProperties = {
    fontSize: 13,
    color: isDone ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
    textDecoration: isDone ? 'line-through' : 'none',
    lineHeight: 1.4,
    flex: 1,
    cursor: hasChildren ? 'pointer' : 'default',
  }

  const badgeBase: CSSProperties = {
    fontSize: 10,
    padding: '1px 5px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-base)',
    whiteSpace: 'nowrap',
    lineHeight: 1.4,
  }

  const actionBtn: CSSProperties = {
    width: 22,
    height: 22,
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    color: 'var(--color-text-muted)',
    opacity: hovered || focused ? 1 : 0,
    transition: 'opacity var(--transition-fast)',
    flexShrink: 0,
  }

  const progressRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    marginTop: 2,
  }

  const metaRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    marginTop: 2,
    flexWrap: 'wrap',
  }

  const doneCount = subtasks.filter((s) => computePercent(allTasks, s.id) >= 100).length

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={() => setFocused(false)}>
      <div style={row}>
        {/* Completion control */}
        {(task.completionMode === 'checkbox' || showDailyToggle) && (
          <button style={checkStyle} onClick={handleToggleDone} aria-label="Toggle done">
            <PixelIcon name="check" size={10} color={isDone ? 'var(--color-bg-base)' : 'transparent'} />
          </button>
        )}
        {task.completionMode === 'percentage' && !showDailyToggle && (
          <span style={{ ...badgeBase, color: 'var(--color-accent)', fontSize: 11, minWidth: 32, textAlign: 'center' }}>
            {task.percent}%
          </span>
        )}
        {task.completionMode === 'subtask' && !showDailyToggle && (
          <span style={{ ...badgeBase, color: 'var(--color-accent-dim)', fontSize: 11, minWidth: 32, textAlign: 'center' }}>
            {doneCount}/{subtasks.length}
          </span>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            {hasChildren ? (
              <button
                style={{ ...titleStyle, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
              >
                {task.title}
              </button>
            ) : (
              <span style={titleStyle}>{task.title}</span>
            )}
            {task.priority >= 3 && (
              <span style={{ width: 7, height: 7, borderRadius: 0, background: priorityColors[task.priority], flexShrink: 0 }} />
            )}
          </div>

          {/* Progress bar for percentage / subtask modes */}
          {task.completionMode === 'percentage' && (
            <div style={progressRow}>
              <ProgressBar value={task.percent} interactive onChange={handlePercentChange} />
            </div>
          )}
          {task.completionMode === 'subtask' && hasChildren && (
            <div style={progressRow}>
              <ProgressBar value={percent} />
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{percent}%</span>
            </div>
          )}

          {/* Metadata badges */}
          {(task.deadline || task.timeEstimate || project || hasChildren) && (
            <div style={metaRow}>
              {task.deadline && (
                <span style={{
                  ...badgeBase,
                  color: deadlineDays !== null && deadlineDays < 0
                    ? 'var(--color-danger)'
                    : deadlineDays === 0
                      ? 'var(--color-warning)'
                      : 'var(--color-text-muted)',
                }}>
                  {deadlineDays === 0 ? 'Today' : deadlineDays === 1 ? 'Tomorrow' : formatDate(task.deadline)}
                </span>
              )}
              {task.timeEstimate && (
                <span style={{ ...badgeBase, color: 'var(--color-text-muted)' }}>
                  ~{formatTimeEstimate(task.timeEstimate)}
                </span>
              )}
              {project && (
                <span style={{ ...badgeBase, color: project.color }}>{project.title}</span>
              )}
              {hasChildren && !showDailyToggle && (
                <button
                  style={{ ...badgeBase, color: 'var(--color-text-muted)', cursor: 'pointer', border: 'none', background: 'var(--color-bg-base)' }}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <PixelIcon name="chevron-down" size={10} style={{ display: 'inline-block', verticalAlign: 'middle' }} /> : <PixelIcon name="chevron-right" size={10} style={{ display: 'inline-block', verticalAlign: 'middle' }} />} {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <button style={actionBtn} onClick={() => setEditing(true)} title="Edit"><PixelIcon name="edit" size={12} /></button>
        <button style={actionBtn} onClick={() => { setAddingChild(true); setExpanded(true) }} title="Add subtask"><PixelIcon name="plus" size={12} /></button>
        {!showDailyToggle && !isAssignedToday && (
          <button style={actionBtn} onClick={() => assignToDay(taskId, todayStr)} title="Assign to today"><PixelIcon name="today" size={12} /></button>
        )}
        <button
          style={{ ...actionBtn, color: hovered ? 'var(--color-danger)' : 'var(--color-text-muted)' }}
          onClick={() => deleteTask(taskId)}
          title="Delete"
        ><PixelIcon name="trash" size={12} /></button>
      </div>

      {/* Expanded subtasks */}
      {expanded && (
        <div>
          {subtasks.map((s) => (
            <TaskItem key={s.id} taskId={s.id} depth={depth + 1} />
          ))}
          {addingChild && (
            <div style={{ display: 'flex', gap: 'var(--space-xs)', padding: '4px var(--space-sm)', paddingLeft: `calc(var(--space-sm) + ${(depth + 1) * 16}px)` }}>
              <input
                autoFocus
                style={{
                  flex: 1,
                  fontSize: 13,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                placeholder="Subtask title..."
                value={childTitle}
                onChange={(e) => setChildTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddChild()
                  if (e.key === 'Escape') { setAddingChild(false); setChildTitle('') }
                }}
              />
              <button
                style={{ fontSize: 11, color: 'var(--color-text-muted)', padding: '4px' }}
                onClick={() => { setAddingChild(false); setChildTitle('') }}
              ><PixelIcon name="close" size={10} /></button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
