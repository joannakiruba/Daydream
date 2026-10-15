import { useState, useMemo, type CSSProperties } from 'react'
import type { DailyAssignment, Task } from '../../types/task'
import { useTaskStore } from '../../stores/taskStore'
import { getRootTasks, computePercent } from '../../lib/taskHelpers'
import { today } from '../../lib/dates'
import { TaskItem } from './TaskItem'
import { TaskEditor } from './TaskEditor'
import { ProjectCard } from './ProjectCard'
import { PROJECT_COLORS } from './TaskEditor'

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
  const plus: CSSProperties = {
    fontSize: 14,
    color: 'var(--color-accent-dim)',
    flexShrink: 0,
    width: 20,
    textAlign: 'center',
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
      <span style={plus}>+</span>
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

/* ── Today view ── */

function TodayView() {
  const tasks = useTaskStore((s) => s.tasks)
  const assignments = useTaskStore((s) => s.assignments)
  const { addTask, assignToDay, toggleDailyDone, updateTask } = useTaskStore()
  const [showEditor, setShowEditor] = useState(false)

  const todayStr = today()

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

  const handleQuickAdd = (title: string) => {
    const id = addTask({ title })
    assignToDay(id, todayStr)
  }

  const handleDailyToggle = (taskId: string) => {
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
  }
  const dailyCheck = (done: boolean): CSSProperties => ({
    width: 20,
    height: 20,
    borderRadius: 10,
    border: `2px solid ${done ? 'var(--color-success)' : 'var(--color-text-muted)'}`,
    background: done ? 'var(--color-success)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: done ? 'var(--color-bg-base)' : 'transparent',
    flexShrink: 0,
    marginTop: 4,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  })

  return (
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
      {items.length === 0 && <div style={empty}>No tasks for today yet.</div>}
      {items.map(({ task, assignment }) => (
        <div key={task.id} style={dailyRow}>
          <button style={dailyCheck(assignment.done)} onClick={() => handleDailyToggle(task.id)}>
            ✓
          </button>
          <div style={{ flex: 1, opacity: assignment.done ? 0.5 : 1, transition: 'opacity var(--transition-fast)' }}>
            <TaskItem taskId={task.id} showDailyToggle dailyDate={todayStr} />
          </div>
        </div>
      ))}
      {items.length > 0 && (
        <div style={summary}>{doneCount}/{items.length} completed today</div>
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
                  borderRadius: '50%',
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
  const summary: CSSProperties = {
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
        <div style={summary}>{doneCount}/{rootTasks.length} completed</div>
      )}
    </>
  )
}
