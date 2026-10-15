import { useState, useMemo, type CSSProperties } from 'react'
import { useTaskStore } from '../../stores/taskStore'
import { today, addDays, formatDate } from '../../lib/dates'

export function CalendarWidget() {
  const tasks = useTaskStore((s) => s.tasks)
  const assignments = useTaskStore((s) => s.assignments)
  const dayRecords = useTaskStore((s) => s.dayRecords)

  const todayStr = today()
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(todayStr + 'T12:00:00')
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const grid = useMemo(() => {
    const first = new Date(viewMonth.year, viewMonth.month, 1)
    const startDay = first.getDay()
    const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate()
    const cells: (string | null)[] = []
    for (let i = 0; i < startDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(viewMonth.month + 1).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      cells.push(`${viewMonth.year}-${m}-${dd}`)
    }
    return cells
  }, [viewMonth])

  const dayData = useMemo(() => {
    const map: Record<string, { total: number; done: number; closed: boolean }> = {}
    for (const a of Object.values(assignments)) {
      if (!map[a.date]) map[a.date] = { total: 0, done: 0, closed: false }
      map[a.date].total++
      if (a.done) map[a.date].done++
    }
    for (const [date, rec] of Object.entries(dayRecords)) {
      if (rec.closedAt && map[date]) map[date].closed = true
    }
    return map
  }, [assignments, dayRecords])

  const selectedTasks = useMemo(() => {
    return Object.values(assignments)
      .filter((a) => a.date === selectedDate)
      .map((a) => ({ task: tasks[a.taskId], done: a.done }))
      .filter((i) => i.task != null)
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1
        return a.task!.sortOrder - b.task!.sortOrder
      })
  }, [assignments, tasks, selectedDate])

  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })
  }
  const nextMonth = () => {
    setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })
  }

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: 'var(--space-sm)',
    gap: 'var(--space-sm)',
    overflowY: 'auto',
  }

  const nav: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 2,
    flexShrink: 0,
  }

  const dayHeader: CSSProperties = {
    fontSize: 9,
    color: 'var(--color-text-muted)',
    textAlign: 'center',
    padding: '2px 0',
    textTransform: 'uppercase',
  }

  const cellStyle = (date: string | null): CSSProperties => {
    if (!date) return { visibility: 'hidden' as const }
    const isToday = date === todayStr
    const isSelected = date === selectedDate
    const data = dayData[date]
    const allDone = data && data.total > 0 && data.done === data.total
    return {
      aspectRatio: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-sm)',
      fontSize: 11,
      cursor: 'pointer',
      transition: 'all var(--transition-fast)',
      background: isSelected
        ? 'var(--color-accent-glow)'
        : isToday
          ? 'rgba(255,255,255,0.03)'
          : 'transparent',
      color: isSelected
        ? 'var(--color-accent)'
        : allDone
          ? 'var(--color-success)'
          : isToday
            ? 'var(--color-text-primary)'
            : 'var(--color-text-secondary)',
      fontWeight: isToday || isSelected ? 600 : 400,
      border: isToday && !isSelected ? '1px solid var(--color-accent-dim)' : '1px solid transparent',
      position: 'relative',
    }
  }

  const dotIndicator = (date: string): CSSProperties | null => {
    const data = dayData[date]
    if (!data || data.total === 0) return null
    return {
      width: 4,
      height: 4,
      borderRadius: 2,
      background: data.done === data.total ? 'var(--color-success)' : 'var(--color-accent-dim)',
      position: 'absolute',
      bottom: 2,
    }
  }

  const sectionLabel: CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    fontWeight: 600,
  }

  const taskItem = (done: boolean): CSSProperties => ({
    fontSize: 12,
    color: done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
    textDecoration: done ? 'line-through' : 'none',
    padding: '3px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-xs)',
  })

  const taskDot = (done: boolean): CSSProperties => ({
    width: 6,
    height: 6,
    borderRadius: 3,
    background: done ? 'var(--color-success)' : 'var(--color-text-muted)',
    flexShrink: 0,
  })

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div style={container}>
      <div style={nav}>
        <button style={navBtn} onClick={prevMonth} aria-label="Previous month">‹</button>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{monthLabel}</span>
        <button style={navBtn} onClick={nextMonth} aria-label="Next month">›</button>
      </div>

      <div style={gridStyle}>
        {days.map((d, i) => <div key={i} style={dayHeader}>{d}</div>)}
        {grid.map((date, i) => (
          date ? (
            <button key={i} style={cellStyle(date)} onClick={() => setSelectedDate(date)} aria-label={date}>
              {parseInt(date.slice(8), 10)}
              {(() => { const d = dotIndicator(date); return d ? <div style={d} /> : null })()}
            </button>
          ) : (
            <div key={i} style={cellStyle(date)} />
          )
        ))}
      </div>

      <div style={sectionLabel}>
        {selectedDate === todayStr ? 'Today' : formatDate(selectedDate)}
      </div>

      {selectedTasks.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          No tasks on this day.
        </div>
      )}

      {selectedTasks.map((item) => (
        <div key={item.task!.id} style={taskItem(item.done)}>
          <div style={taskDot(item.done)} />
          <span>{item.task!.title}</span>
        </div>
      ))}
    </div>
  )
}
