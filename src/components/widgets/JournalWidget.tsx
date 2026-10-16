import { useState, useMemo, useEffect, type CSSProperties } from 'react'
import { useJournalStore } from '../../stores/journalStore'
import { today, addDays, formatDate } from '../../lib/dates'
import { PixelIcon } from '../PixelIcon'

export function JournalWidget() {
  const entries = useJournalStore((s) => s.entries)
  const upsertEntry = useJournalStore((s) => s.upsertEntry)
  const deleteEntry = useJournalStore((s) => s.deleteEntry)

  const [selectedDate, setSelectedDate] = useState(today())
  const entry = entries[selectedDate]
  const [draft, setDraft] = useState(entry?.body ?? '')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setDraft(entries[selectedDate]?.body ?? '')
    setDirty(false)
  }, [selectedDate, entries])

  const handleSave = () => {
    if (!draft.trim()) {
      if (entry) deleteEntry(selectedDate)
    } else {
      upsertEntry(selectedDate, draft)
    }
    setDirty(false)
  }

  const handleChange = (val: string) => {
    setDraft(val)
    setDirty(true)
  }

  const entryDates = useMemo(
    () => Object.keys(entries).sort((a, b) => b.localeCompare(a)),
    [entries],
  )

  const isToday = selectedDate === today()

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: 'var(--space-sm)',
    gap: 'var(--space-sm)',
  }

  const nav: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
    flexShrink: 0,
  }

  const navBtn: CSSProperties = {
    width: 26,
    height: 26,
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
  }

  const dateLabel: CSSProperties = {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 600,
    color: isToday ? 'var(--color-accent)' : 'var(--color-text-primary)',
  }

  const area: CSSProperties = {
    flex: 1,
    resize: 'none',
    fontSize: 13,
    lineHeight: 1.6,
    padding: 'var(--space-sm)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-overlay)',
    border: `1px solid ${dirty ? 'var(--color-accent-dim)' : 'var(--color-border)'}`,
    color: 'var(--color-text-primary)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  }

  const footer: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  }

  const saveBtn: CSSProperties = {
    fontSize: 11,
    padding: '4px 12px',
    borderRadius: 'var(--radius-sm)',
    background: dirty ? 'var(--color-accent-glow)' : 'transparent',
    color: dirty ? 'var(--color-accent)' : 'var(--color-text-muted)',
    fontWeight: 600,
    border: dirty ? '1px solid var(--color-accent-dim)' : '1px solid transparent',
    cursor: dirty ? 'pointer' : 'default',
    transition: 'all var(--transition-fast)',
  }

  const historyLabel: CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    fontWeight: 600,
    flexShrink: 0,
  }

  const historyList: CSSProperties = {
    maxHeight: 100,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    flexShrink: 0,
  }

  const historyItem = (active: boolean): CSSProperties => ({
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
    background: active ? 'var(--color-accent-glow)' : 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all var(--transition-fast)',
  })

  const empty: CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-muted)',
    fontSize: 12,
    fontStyle: 'italic',
  }

  return (
    <div style={container}>
      <div style={nav}>
        <button
          style={navBtn}
          onClick={() => setSelectedDate(addDays(selectedDate, -1))}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <PixelIcon name="chevron-left" size={12} />
        </button>
        <span style={dateLabel}>
          {isToday ? 'Today' : formatDate(selectedDate)}
        </span>
        <button
          style={navBtn}
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <PixelIcon name="chevron-right" size={12} />
        </button>
        {!isToday && (
          <button
            style={{ ...navBtn, fontSize: 10 }}
            onClick={() => setSelectedDate(today())}
            title="Jump to today"
          >
            <PixelIcon name="today" size={10} />
          </button>
        )}
      </div>

      <textarea
        style={area}
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => { if (dirty) handleSave() }}
        placeholder="How was your day?"
      />

      <div style={footer}>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {entry ? `Last saved ${new Date(entry.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'Not saved yet'}
        </span>
        <button style={saveBtn} onClick={handleSave}>
          {dirty ? 'Save' : 'Saved'}
        </button>
      </div>

      {entryDates.length > 0 && (
        <>
          <div style={historyLabel}>History</div>
          <div style={historyList}>
            {entryDates.map((d) => (
              <button key={d} style={historyItem(d === selectedDate)} onClick={() => setSelectedDate(d)}>
                {formatDate(d)}
                <span style={{ opacity: 0.5, marginLeft: 6 }}>
                  {entries[d].body.slice(0, 40)}{entries[d].body.length > 40 ? '...' : ''}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {entryDates.length === 0 && !draft && (
        <div style={empty}>Start writing your first entry.</div>
      )}
    </div>
  )
}
