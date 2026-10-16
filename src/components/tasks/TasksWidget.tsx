import { useState, useMemo, type CSSProperties } from 'react'
import type { DailyAssignment, Task } from '../../types/task'
import { useTaskStore } from '../../stores/taskStore'
import { getRootTasks, computePercent } from '../../lib/taskHelpers'
import { today, addDays, formatDate } from '../../lib/dates'
import { TaskItem } from './TaskItem'
import { TaskEditor } from './TaskEditor'
import { ProjectCard } from './ProjectCard'
import { PROJECT_COLORS } from './TaskEditor'
import { PixelIcon } from '../PixelIcon'

const tabs = [
  { id: 'today' as const, label: 'Today' },
  { id: 'projects' as const, label: 'Projects' },
  { id: 'all' as const, label: 'All' },
]

export function TasksWidget() {
  const activeTab = useTaskStore((s) => s.activeTab)
  const setActiveTab = useTaskStore((s) => s.setActiveTab)

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  }
  const tabBar: CSSProperties = {
    display: 'flex',
    gap: 2,
    padding: '0 var(--space-sm)',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
    background: 'var(--color-bg-raised)',
  }
  const tabBtn = (active: boolean): CSSProperties => ({
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
    padding: '8px 12px',
    borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
  })
  const content: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
  }

  return (
    <div style={container}>
      <div style={tabBar}>
        {tabs.map((t) => (
          <button key={t.id} style={tabBtn(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={content}>
        {activeTab === 'today' && <TodayView />}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'all' && <AllView />}
      </div>
    </div>
  )
}

/* ── Quick-add bar ── */

function QuickAdd({ onAdd, placeholder }: { onAdd: (title: string) => void; placeholder: string }) {
  const [value, setValue] = useState('')
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onAdd(value.trim())
      setValue('')
    }
  }
  const row: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: '6px 8px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-overlay)',
    border: '1px solid var(--color-border)',
  }
  const inp: CSSProperties = {
    flex: 1,
    fontSize: 13,
    color: 'var(--color-text-primary)',
    background: 'transparent',
    border: 'none',
    outline: 'none',
  }
  return (
    <div style={row}>
      <PixelIcon name="plus" size={12} color="var(--color-accent-dim)" style={{ flexShrink: 0 }} />
      <input
        style={inp}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
      />
    </div>
  )
}

/* ── Defer picker ── */

function DeferPicker({ taskId, date, onClose }: { taskId: string; date: string; onClose: () => void }) {
  const { deferTask } = useTaskStore()
  const [customDate, setCustomDate] = useState('')

  const options = [
    { label: 'Tomorrow', target: addDays(date, 1) },
    { label: 'In 2 days', target: addDays(date, 2) },
    { label: 'Next week', target: addDays(date, 7) },
  ]

  const handleDefer = (target: string) => {
    deferTask(taskId, date, target)
    onClose()
  }

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
    padding: 'var(--space-sm)',
    background: 'var(--color-bg-overlay)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-md)',
  }

  const optBtn: CSSProperties = {
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-secondary)',
    textAlign: 'left',
    transition: 'background var(--transition-fast)',
  }

  const dateRow: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-xs)',
    alignItems: 'center',
  }

  return (
    <div style={container}>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>Defer to...</span>
      {options.map((o) => (
        <button
          key={o.label}
          style={optBtn}
          onClick={() => handleDefer(o.target)}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          {o.label} ({formatDate(o.target)})
        </button>
      ))}
      <div style={dateRow}>
        <input
          type="date"
          style={{
            flex: 1, fontSize: 11, padding: '3px 6px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          min={addDays(date, 1)}
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
        />
        <button
          style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 600, opacity: customDate ? 1 : 0.4 }}
          onClick={() => { if (customDate) handleDefer(customDate) }}
        >
          Go
        </button>
      </div>
      <button
        style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}
        onClick={onClose}
      >
        Cancel
      </button>
    </div>
  )
}

/* ── Today view ── */

function TodayView() {
  const tasks = useTaskStore((s) => s.tasks)
  const assignments = useTaskStore((s) => s.assignments)
  const dayRecords = useTaskStore((s) => s.dayRecords)
  const { addTask, assignToDay, toggleDailyDone, updateTask, closeDay, markAllComplete } = useTaskStore()
  const [showEditor, setShowEditor] = useState(false)
  const [deferringTaskId, setDeferringTaskId] = useState<string | null>(null)

  const todayStr = today()
  const dayClosed = dayRecords[todayStr]?.closedAt != null

  const items = useMemo(() => {
    return Object.values(assignments)
      .filter((a) => a.date === todayStr)
      .map((a) => ({ task: tasks[a.taskId], assignment: a }))
      .filter((i): i is { task: Task; assignment: DailyAssignment } => i.task != null)
      .sort((a, b) => {
        if (a.assignment.done !== b.assignment.done) return a.assignment.done ? 1 : -1
        return a.task.sortOrder - b.task.sortOrder
      })
  }, [assignments, tasks, todayStr])

  const doneCount = items.filter((i) => i.assignment.done).length
  const totalCount = items.length
  const allDone = totalCount > 0 && doneCount === totalCount
  const hasIncomplete = totalCount > 0 && doneCount < totalCount

  const handleQuickAdd = (title: string) => {
    const id = addTask({ title })
    assignToDay(id, todayStr)
  }

  const handleDailyToggle = (taskId: string) => {
    if (dayClosed) return
    const key = `${taskId}:${todayStr}`
    const assignment = assignments[key]
    if (!assignment) return
    const newDone = !assignment.done
    toggleDailyDone(taskId, todayStr)
    const task = tasks[taskId]
    if (task?.completionMode === 'checkbox') {
      updateTask(taskId, { done: newDone })
    }
  }

  const empty: CSSProperties = {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: 13,
    fontStyle: 'italic',
    padding: 'var(--space-lg) 0',
  }
  const summary: CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    textAlign: 'center',
  }
  const dailyRow: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-sm)',
    padding: '4px 0',
    borderRadius: 'var(--radius-sm)',
    position: 'relative',
  }
  const dailyCheck = (done: boolean): CSSProperties => ({
    width: 20,
    height: 20,
    borderRadius: 0,
    border: `2px solid ${done ? 'var(--color-success)' : 'var(--color-text-muted)'}`,
    background: done ? 'var(--color-success)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: done ? 'var(--color-bg-base)' : 'transparent',
    flexShrink: 0,
    marginTop: 4,
    cursor: dayClosed ? 'default' : 'pointer',
    transition: 'all var(--transition-fast)',
    opacity: dayClosed ? 0.6 : 1,
  })

  const deferBtn: CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
    flexShrink: 0,
    marginTop: 4,
    transition: 'color var(--transition-fast)',
  }

  const bannerStyle = (color: string): CSSProperties => ({
    padding: 'var(--space-sm) var(--space-md)',
    borderRadius: 'var(--radius-md)',
    background: `${color}10`,
    border: `1px solid ${color}30`,
    textAlign: 'center',
    fontSize: 13,
    color,
  })

  const closeBtnStyle = (primary: boolean): CSSProperties => ({
    padding: '6px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: 12,
    fontWeight: 600,
    background: primary ? 'var(--color-success)' : 'var(--color-bg-overlay)',
    color: primary ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
    border: primary ? 'none' : '1px solid var(--color-border)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  })

  return (
    <>
      {/* Day closed banner */}
      {dayClosed && (
        <div style={bannerStyle('var(--color-text-muted)')}>
          Day closed — {doneCount}/{totalCount} completed
        </div>
      )}

      {/* All-complete celebration banner */}
      {allDone && !dayClosed && (
        <div style={bannerStyle('var(--color-success)')}>
          All tasks complete! Your room is restored.
        </div>
      )}

      {/* Quick add (only when day is open) */}
      {!dayClosed && (
        <>
          <QuickAdd onAdd={handleQuickAdd} placeholder="Add a task for today..." />
          {showEditor && (
            <TaskEditor
              onSave={(input) => {
                const id = addTask(input)
                assignToDay(id, todayStr)
                setShowEditor(false)
              }}
              onCancel={() => setShowEditor(false)}
            />
          )}
          {!showEditor && (
            <button
              style={{ fontSize: 12, color: 'var(--color-accent-dim)', textAlign: 'left', padding: 0 }}
              onClick={() => setShowEditor(true)}
            >
              + Detailed task...
            </button>
          )}
        </>
      )}

      {/* Task list */}
      {items.length === 0 && !dayClosed && <div style={empty}>No tasks for today yet.</div>}
      {items.map(({ task, assignment }) => (
        <div key={task.id}>
          <div style={dailyRow}>
            <button style={dailyCheck(assignment.done)} onClick={() => handleDailyToggle(task.id)} aria-label={`Mark ${task.title} ${assignment.done ? 'incomplete' : 'complete'}`}>
              <PixelIcon name="check" size={10} color={assignment.done ? 'var(--color-bg-base)' : 'transparent'} />
            </button>
            <div style={{
              flex: 1,
              opacity: assignment.done ? 0.5 : (dayClosed ? 0.6 : 1),
              transition: 'opacity var(--transition-fast)',
            }}>
              <TaskItem taskId={task.id} showDailyToggle dailyDate={todayStr} />
            </div>
            {!dayClosed && !assignment.done && (
              <button
                style={deferBtn}
                onClick={() => setDeferringTaskId(deferringTaskId === task.id ? null : task.id)}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
                title="Defer to another day"
              >
                <PixelIcon name="defer" size={11} />
              </button>
            )}
          </div>
          {deferringTaskId === task.id && (
            <div style={{ marginLeft: 28, marginBottom: 'var(--space-sm)' }}>
              <DeferPicker taskId={task.id} date={todayStr} onClose={() => setDeferringTaskId(null)} />
            </div>
          )}
        </div>
      ))}

      {/* Summary */}
      {items.length > 0 && !dayClosed && (
        <div style={summary}>{doneCount}/{totalCount} completed today</div>
      )}

      {/* Day closure controls */}
      {totalCount > 0 && !dayClosed && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', paddingTop: 'var(--space-sm)' }}>
          {allDone && (
            <button style={closeBtnStyle(true)} onClick={() => closeDay(todayStr)}>
              Close Day
            </button>
          )}
          {hasIncomplete && (
            <>
              <button
                style={closeBtnStyle(false)}
                onClick={() => { markAllComplete(todayStr); closeDay(todayStr) }}
              >
                Complete All & Close
              </button>
              <button
                style={closeBtnStyle(false)}
                onClick={() => closeDay(todayStr)}
              >
                Close Anyway
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}

/* ── Projects view ── */

function ProjectsView() {
  const projects = useTaskStore((s) => s.projects)
  const { addProject } = useTaskStore()
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0])

  const projectList = useMemo(
    () => Object.values(projects).filter((p) => !p.archivedAt).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [projects],
  )

  const handleCreate = () => {
    if (!newTitle.trim()) return
    addProject({ title: newTitle.trim(), color: newColor })
    setNewTitle('')
    setNewColor(PROJECT_COLORS[0])
    setCreating(false)
  }

  const empty: CSSProperties = {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: 13,
    fontStyle: 'italic',
    padding: 'var(--space-lg) 0',
  }
  const createForm: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm)',
    background: 'var(--color-bg-overlay)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  }
  const inp: CSSProperties = {
    fontSize: 13,
    padding: '6px 8px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-base)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  return (
    <>
      {creating ? (
        <div style={createForm}>
          <input
            autoFocus
            style={inp}
            placeholder="Project name..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 0,
                  background: c,
                  border: c === newColor ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
            <button type="button" style={{ fontSize: 11, color: 'var(--color-text-muted)' }} onClick={() => setCreating(false)}>
              Cancel
            </button>
            <button
              type="button"
              style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 600, opacity: newTitle.trim() ? 1 : 0.4 }}
              onClick={handleCreate}
            >
              Create
            </button>
          </div>
        </div>
      ) : (
        <button
          style={{ fontSize: 12, color: 'var(--color-accent-dim)', textAlign: 'left', padding: '6px 0' }}
          onClick={() => setCreating(true)}
        >
          + New project
        </button>
      )}
      {projectList.length === 0 && !creating && <div style={empty}>No projects yet.</div>}
      {projectList.map((p) => (
        <ProjectCard key={p.id} projectId={p.id} />
      ))}
    </>
  )
}

/* ── All tasks view ── */

function AllView() {
  const tasks = useTaskStore((s) => s.tasks)
  const { addTask } = useTaskStore()
  const [showEditor, setShowEditor] = useState(false)

  const rootTasks = useMemo(() => getRootTasks(tasks), [tasks])
  const doneCount = useMemo(
    () => rootTasks.filter((t) => computePercent(tasks, t.id) >= 100).length,
    [rootTasks, tasks],
  )

  const handleQuickAdd = (title: string) => {
    addTask({ title })
  }

  const empty: CSSProperties = {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: 13,
    fontStyle: 'italic',
    padding: 'var(--space-lg) 0',
  }
  const summaryStyle: CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    textAlign: 'center',
  }

  return (
    <>
      <QuickAdd onAdd={handleQuickAdd} placeholder="Add a task..." />
      {showEditor && (
        <TaskEditor
          onSave={(input) => {
            addTask(input)
            setShowEditor(false)
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}
      {!showEditor && (
        <button
          style={{ fontSize: 12, color: 'var(--color-accent-dim)', textAlign: 'left', padding: 0 }}
          onClick={() => setShowEditor(true)}
        >
          + Detailed task...
        </button>
      )}
      {rootTasks.length === 0 && <div style={empty}>No tasks yet.</div>}
      {rootTasks.map((t) => (
        <TaskItem key={t.id} taskId={t.id} />
      ))}
      {rootTasks.length > 0 && (
        <div style={summaryStyle}>{doneCount}/{rootTasks.length} completed</div>
      )}
    </>
  )
}
