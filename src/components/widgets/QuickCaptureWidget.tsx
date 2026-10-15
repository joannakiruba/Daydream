import { useState, useMemo, type CSSProperties } from 'react'
import { useCaptureStore } from '../../stores/captureStore'
import { useTaskStore } from '../../stores/taskStore'
import { today } from '../../lib/dates'

type CaptureMode = 'note' | 'task'

export function QuickCaptureWidget() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<CaptureMode>('note')
  const { notes, addNote, deleteNote } = useCaptureStore()
  const { addTask, assignToDay } = useTaskStore()

  const sorted = useMemo(
    () => Object.values(notes).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notes],
  )

  const handleSubmit = () => {
    const val = text.trim()
    if (!val) return
    if (mode === 'task') {
      const id = addTask({ title: val })
      assignToDay(id, today())
    } else {
      addNote(val)
    }
    setText('')
  }

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm)',
    height: '100%',
    padding: 'var(--space-sm)',
  }

  const modeRow: CSSProperties = {
    display: 'flex',
    gap: 2,
  }

  const modePill = (active: boolean): CSSProperties => ({
    flex: 1,
    fontSize: 11,
    padding: '4px 0',
    borderRadius: 'var(--radius-sm)',
    background: active ? 'var(--color-accent-glow)' : 'transparent',
    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
    fontWeight: active ? 600 : 400,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  })

  const inputRow: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-xs)',
  }

  const inp: CSSProperties = {
    flex: 1,
    fontSize: 13,
    padding: '8px 10px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-overlay)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  const sendBtn: CSSProperties = {
    padding: '0 12px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-accent-glow)',
    color: 'var(--color-accent)',
    fontSize: 14,
    fontWeight: 600,
    border: '1px solid var(--color-accent-dim)',
    cursor: 'pointer',
    opacity: text.trim() ? 1 : 0.4,
  }

  const listStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  }

  const noteCard: CSSProperties = {
    padding: '6px 8px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-overlay)',
    border: '1px solid var(--color-border)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-xs)',
  }

  const empty: CSSProperties = {
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: 12,
    fontStyle: 'italic',
    padding: 'var(--space-lg) 0',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const ts = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div style={container}>
      <div style={modeRow}>
        <button style={modePill(mode === 'note')} onClick={() => setMode('note')}>Note</button>
        <button style={modePill(mode === 'task')} onClick={() => setMode('task')}>Task</button>
      </div>

      <div style={inputRow}>
        <input
          style={inp}
          placeholder={mode === 'task' ? 'Capture a task...' : 'Jot something down...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
        />
        <button style={sendBtn} onClick={handleSubmit} aria-label="Submit capture">+</button>
      </div>

      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600 }}>
        Recent Notes
      </div>

      <div style={listStyle}>
        {sorted.length === 0 && <div style={empty}>No captures yet. Jot something down!</div>}
        {sorted.map((n) => (
          <div key={n.id} style={noteCard}>
            <span style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.text}</span>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}>{ts(n.createdAt)}</span>
            <button
              style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0, lineHeight: 1 }}
              onClick={() => deleteNote(n.id)}
              title="Delete"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
