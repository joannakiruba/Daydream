import { useState, useMemo, type CSSProperties } from 'react'
import { useTaskStore } from '../../stores/taskStore'
import { getProjectTasks, computePercent } from '../../lib/taskHelpers'
import { TaskItem } from './TaskItem'
import { PROJECT_COLORS } from './TaskEditor'
import { PixelIcon } from '../PixelIcon'

export function ProjectCard({ projectId }: { projectId: string }) {
  const project = useTaskStore((s) => s.projects[projectId])
  const allTasks = useTaskStore((s) => s.tasks)
  const { addTask, updateProject, deleteProject } = useTaskStore()

  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editColor, setEditColor] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const tasks = useMemo(() => getProjectTasks(allTasks, projectId), [allTasks, projectId])
  const doneCount = useMemo(
    () => tasks.filter((t) => computePercent(allTasks, t.id) >= 100).length,
    [tasks, allTasks],
  )
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0

  if (!project) return null

  const startEdit = () => {
    setEditTitle(project.title)
    setEditColor(project.color)
    setEditing(true)
  }
  const saveEdit = () => {
    if (editTitle.trim()) {
      updateProject(projectId, { title: editTitle.trim(), color: editColor })
    }
    setEditing(false)
  }
  const handleAddTask = () => {
    if (!newTitle.trim()) return
    addTask({ title: newTitle.trim(), projectId })
    setNewTitle('')
    setAddingTask(false)
  }

  const card: CSSProperties = {
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-overlay)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  }
  const header: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: '8px var(--space-sm)',
    cursor: 'pointer',
  }
  const dot: CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: 0,
    background: project.color,
    flexShrink: 0,
  }
  const titleText: CSSProperties = {
    flex: 1,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  }
  const countText: CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-muted)',
  }
  const barTrack: CSSProperties = {
    height: 3,
    background: 'var(--color-bg-base)',
    borderRadius: 2,
  }
  const barFill: CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    borderRadius: 2,
    background: progress >= 100 ? 'var(--color-success)' : project.color,
    transition: 'width var(--transition-fast)',
  }
  const editRow: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm)',
    borderTop: '1px solid var(--color-border)',
  }
  const colorRow: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-xs)',
  }
  const inpStyle: CSSProperties = {
    fontSize: 13,
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-base)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    flex: 1,
  }

  return (
    <div style={card}>
      <div style={header} onClick={() => !editing && setExpanded(!expanded)}>
        <span style={dot} />
        <span style={titleText}>{project.title}</span>
        <span style={countText}>{doneCount}/{tasks.length}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>{expanded ? <PixelIcon name="chevron-down" size={10} /> : <PixelIcon name="chevron-right" size={10} />}</span>
      </div>
      {tasks.length > 0 && (
        <div style={{ padding: '0 var(--space-sm) 6px' }}>
          <div style={barTrack}><div style={barFill} /></div>
        </div>
      )}

      {editing && (
        <div style={editRow}>
          <input
            autoFocus
            style={inpStyle}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
          />
          <div style={colorRow}>
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 0,
                  background: c,
                  border: c === editColor ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setEditColor(c)}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
            <button
              type="button"
              style={{ fontSize: 11, color: 'var(--color-danger)' }}
              onClick={() => { deleteProject(projectId); setEditing(false) }}
            >Delete</button>
            <button type="button" style={{ fontSize: 11, color: 'var(--color-text-muted)' }} onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button type="button" style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 600 }} onClick={saveEdit}>
              Save
            </button>
          </div>
        </div>
      )}

      {expanded && !editing && (
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 4, paddingBottom: 4 }}>
          <div style={{ display: 'flex', gap: 'var(--space-xs)', padding: '0 var(--space-sm)', marginBottom: 4 }}>
            <button
              type="button"
              style={{ fontSize: 11, color: 'var(--color-text-muted)' }}
              onClick={startEdit}
            ><PixelIcon name="edit" size={10} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} /> Edit</button>
          </div>
          {tasks.map((t) => (
            <TaskItem key={t.id} taskId={t.id} />
          ))}
          {addingTask ? (
            <div style={{ display: 'flex', gap: 'var(--space-xs)', padding: '4px var(--space-sm)' }}>
              <input
                autoFocus
                style={inpStyle}
                placeholder="Task title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask()
                  if (e.key === 'Escape') { setAddingTask(false); setNewTitle('') }
                }}
              />
              <button type="button" style={{ fontSize: 11, color: 'var(--color-text-muted)' }} onClick={() => { setAddingTask(false); setNewTitle('') }}><PixelIcon name="close" size={10} /></button>
            </div>
          ) : (
            <button
              type="button"
              style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '4px var(--space-sm)', width: '100%', textAlign: 'left' }}
              onClick={() => setAddingTask(true)}
            >+ Add task</button>
          )}
        </div>
      )}
    </div>
  )
}
