import { useState, type CSSProperties } from 'react'
import type { Task, CompletionMode, Priority, TaskInput } from '../../types/task'
import { useTaskStore } from '../../stores/taskStore'

const PROJECT_COLORS = ['#c4b5fd', '#86d9a0', '#f0d08c', '#f0918c', '#8cc8f0', '#e0a0d0']

const modes: { value: CompletionMode; label: string }[] = [
  { value: 'checkbox', label: '☑ Check' },
  { value: 'percentage', label: '▓ Percent' },
  { value: 'subtask', label: '⊞ Subtasks' },
]

const priorities: Priority[] = [1, 2, 3, 4]
const priorityColors: Record<Priority, string> = {
  1: 'var(--color-text-muted)',
  2: 'var(--color-text-secondary)',
  3: 'var(--color-warning)',
  4: 'var(--color-danger)',
}

const field: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-xs)',
}
const labelStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}
const inputStyle: CSSProperties = {
  fontSize: 13,
  padding: '6px 8px',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-bg-base)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-primary)',
  width: '100%',
}
const pillRow: CSSProperties = {
  display: 'flex',
  gap: 'var(--space-xs)',
  flexWrap: 'wrap',
}

interface TaskEditorProps {
  initial?: Task
  defaultProjectId?: string | null
  defaultParentId?: string | null
  onSave: (input: TaskInput) => void
  onCancel: () => void
}

export { PROJECT_COLORS }

export function TaskEditor({ initial, defaultProjectId, defaultParentId, onSave, onCancel }: TaskEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [mode, setMode] = useState<CompletionMode>(initial?.completionMode ?? 'checkbox')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 2)
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [timeEstimate, setTimeEstimate] = useState(initial?.timeEstimate?.toString() ?? '')
  const [projectId, setProjectId] = useState(initial?.projectId ?? defaultProjectId ?? '')
  const [showNotes, setShowNotes] = useState(!!initial?.description)

  const allProjects = useTaskStore((s) => s.projects)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      completionMode: mode,
      priority,
      deadline: deadline || null,
      timeEstimate: timeEstimate ? parseInt(timeEstimate, 10) : null,
      projectId: projectId || defaultProjectId || null,
      parentId: initial?.parentId ?? defaultParentId ?? null,
    })
  }

  const container: CSSProperties = {
    padding: 'var(--space-sm)',
    background: 'var(--color-bg-overlay)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    border: '1px solid var(--color-border)',
    margin: '4px 0',
  }

  const pill = (active: boolean, color?: string): CSSProperties => ({
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${active ? (color ?? 'var(--color-accent)') : 'var(--color-border)'}`,
    background: active ? `${color ?? 'var(--color-accent)'}20` : 'transparent',
    color: active ? (color ?? 'var(--color-accent)') : 'var(--color-text-muted)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  })

  const twoCol: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-sm)',
  }

  const btnRow: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-sm)',
    marginTop: 'var(--space-xs)',
  }

  const btnBase: CSSProperties = {
    fontSize: 12,
    padding: '5px 12px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
  }

  return (
    <form style={container} onSubmit={handleSubmit}>
      <div style={field}>
        <label style={labelStyle}>Title</label>
        <input
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
          autoFocus
        />
      </div>

      <div style={field}>
        <label style={labelStyle}>Completion mode</label>
        <div style={pillRow}>
          {modes.map((m) => (
            <button key={m.value} type="button" style={pill(mode === m.value)} onClick={() => setMode(m.value)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={field}>
        <label style={labelStyle}>Priority</label>
        <div style={pillRow}>
          {priorities.map((p) => (
            <button
              key={p}
              type="button"
              style={pill(priority === p, priorityColors[p])}
              onClick={() => setPriority(p)}
            >
              P{p}
            </button>
          ))}
        </div>
      </div>

      <div style={twoCol}>
        <div style={field}>
          <label style={labelStyle}>Deadline</label>
          <input
            type="date"
            style={{ ...inputStyle, colorScheme: 'dark' }}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div style={field}>
          <label style={labelStyle}>Estimate (min)</label>
          <input
            type="number"
            min={0}
            step={5}
            style={inputStyle}
            value={timeEstimate}
            onChange={(e) => setTimeEstimate(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {Object.keys(allProjects).length > 0 && (
        <div style={field}>
          <label style={labelStyle}>Project</label>
          <select
            style={{ ...inputStyle, colorScheme: 'dark' }}
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">None</option>
            {Object.values(allProjects).map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      )}

      {!showNotes ? (
        <button
          type="button"
          style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'left', padding: 0 }}
          onClick={() => setShowNotes(true)}
        >
          + Add notes
        </button>
      ) : (
        <div style={field}>
          <label style={labelStyle}>Notes</label>
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes..."
          />
        </div>
      )}

      <div style={btnRow}>
        <button
          type="button"
          style={{ ...btnBase, color: 'var(--color-text-muted)' }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            ...btnBase,
            background: 'var(--color-accent)',
            color: 'var(--color-bg-base)',
            fontWeight: 600,
            opacity: title.trim() ? 1 : 0.4,
          }}
        >
          {initial ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  )
}
