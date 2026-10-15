import { useMemo, type CSSProperties } from 'react'
import { useThemeStore } from '../../stores/themeStore'
import { useTaskStore } from '../../stores/taskStore'
import { computeClutterSlots } from '../../lib/clutterEngine'
import { today } from '../../lib/dates'
import { BedroomScene } from './BedroomScene'

export function PixelRoom() {
  const weather = useThemeStore((s) => s.weather)
  const animate = useThemeStore((s) => s.animate)
  const scenePalette = useThemeStore((s) => s.scenePalette)
  const preset = useThemeStore((s) => s.preset)

  const tasks = useTaskStore((s) => s.tasks)
  const assignments = useTaskStore((s) => s.assignments)
  const dayRecords = useTaskStore((s) => s.dayRecords)

  const todayStr = today()
  const slots = useMemo(
    () => computeClutterSlots(tasks, assignments, todayStr),
    [tasks, assignments, todayStr],
  )

  const restored = useMemo(() => {
    const todayAssignments = Object.values(assignments).filter((a) => a.date === todayStr)
    return todayAssignments.length > 0 && todayAssignments.every((a) => a.done)
  }, [assignments, todayStr])

  const dayClosed = dayRecords[todayStr]?.closedAt != null

  const containerStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    gap: 'var(--space-sm)',
  }

  return (
    <div style={containerStyle}>
      <BedroomScene
        slots={slots}
        weather={weather}
        animate={animate}
        restored={restored}
        palette={scenePalette}
      />

      {restored && (
        <div style={{
          fontSize: 12, color: 'var(--color-success)', fontWeight: 600,
          textAlign: 'center', letterSpacing: 0.5,
        }}>
          {dayClosed ? 'Day complete — room restored' : 'All tasks done — room restored!'}
        </div>
      )}

      <div style={{
        fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'center',
        opacity: 0.6, letterSpacing: 0.5,
      }}>
        {preset.name}
      </div>
    </div>
  )
}
