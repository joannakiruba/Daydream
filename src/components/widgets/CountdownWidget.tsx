import { useState, useMemo, type CSSProperties } from 'react'
import { useCountdownStore } from '../../stores/countdownStore'
import { daysUntil, formatDate } from '../../lib/dates'

export function CountdownWidget() {
  const countdowns = useCountdownStore((s) => s.countdowns)
  const addCountdown = useCountdownStore((s) => s.addCountdown)
  const deleteCountdown = useCountdownStore((s) => s.deleteCountdown)

  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  const sorted = useMemo(
    () => Object.values(countdowns).sort((a, b) => a.targetDate.localeCompare(b.targetDate)),
    [countdowns],
  )

  const handleCreate = () => {
    if (!title.trim() || !date) return
    addCountdown(title.trim(), date)
    setTitle('')
    setDate('')
    setCreating(false)
  }

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: 'var(--space-sm)',
    gap: 'var(--space-sm)',
    overflowY: 'auto',
  }

  const card: CSSProperties = {
    padding: 'var(--space-sm)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-overlay)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
  }

  const numStyle = (days: number): CSSProperties => ({
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1,
    minWidth: 40,
    textAlign: 'center',
    color: days <= 0
      ? 'var(--color-success)'
      : days <= 3
        ? 'var(--color-danger)'
        : days <= 7
          ? 'var(--color-warning)'
          : 'var(--color-accent)',
  })

  const infoStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  }

  const titleStyle: CSSProperties = {
    fontSize: 13,
    color: 'var(--color-text-primary)',
    fontWeight: 500,
  }

  const dateStyle: CSSProperties = {
    fontSize: 10,
    color: 'var(--color-text-muted)',
  }

  const delBtn: CSSProperties = {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    flexShrink: 0,
    transition: 'color var(--transition-fast)',
  }

  const createForm: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
    padding: 'var(--space-sm)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-overlay)',
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

  return (
    <div style={container}>
      {creating ? (
        <div style={createForm}>
          <input
            autoFocus
            style={inp}
            placeholder="Countdown name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
          />
          <input
            type="date"
            style={inp}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
            <button style={{ fontSize: 11, color: 'var(--color-text-muted)' }} onClick={() => setCreating(false)}>
              Cancel
            </button>
            <button
              style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 600, opacity: title.trim() && date ? 1 : 0.4 }}
              onClick={handleCreate}
            >
              Create
            </button>
          </div>
        </div>
      ) : (
        <button
          style={{ fontSize: 12, color: 'var(--color-accent-dim)', textAlign: 'left', padding: '4px 0' }}
          onClick={() => setCreating(true)}
        >
          + New countdown
        </button>
      )}

      {sorted.length === 0 && !creating && (
        <div style={empty}>
          No countdowns yet.
          <br />
          Track days until events that matter.
        </div>
      )}

      {sorted.map((c) => {
        const days = daysUntil(c.targetDate)
        const label = days < 0
          ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
          : days === 0
            ? 'Today!'
            : `${days} day${days !== 1 ? 's' : ''}`
        return (
          <div key={c.id} style={card}>
            <span style={numStyle(days)}>{days <= 0 ? (days === 0 ? '!' : '✓') : days}</span>
            <div style={infoStyle}>
              <div style={titleStyle}>{c.title}</div>
              <div style={dateStyle}>{formatDate(c.targetDate)} — {label}</div>
            </div>
            <button
              style={delBtn}
              onClick={() => deleteCountdown(c.id)}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-danger)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
              title="Delete"
            >
              x
            </button>
          </div>
        )
      })}
    </div>
  )
}
