import { useMemo, type CSSProperties } from 'react'
import { useThemeStore, type SceneId, type WeatherId } from '../../stores/themeStore'
import { useTaskStore } from '../../stores/taskStore'
import { computeClutterSlots } from '../../lib/clutterEngine'
import { today } from '../../lib/dates'
import { BedroomScene } from './BedroomScene'

const sceneLabels: Record<SceneId, string> = {
  bedroom: 'Bedroom',
  cafe: 'Café',
  garden: 'Garden',
}

const weatherLabels: Record<WeatherId, string> = {
  clear: '☀',
  rain: '🌧',
  snow: '❄',
}

const scenes: SceneId[] = ['bedroom', 'cafe', 'garden']
const weathers: WeatherId[] = ['clear', 'rain', 'snow']

export function PixelRoom() {
  const scene = useThemeStore((s) => s.scene)
  const weather = useThemeStore((s) => s.weather)
  const animate = useThemeStore((s) => s.animationsEnabled)
  const setScene = useThemeStore((s) => s.setScene)
  const setWeather = useThemeStore((s) => s.setWeather)
  const setAnimate = useThemeStore((s) => s.setAnimationsEnabled)

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

  const controls: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    flexWrap: 'wrap',
    justifyContent: 'center',
  }

  const pill = (active: boolean): CSSProperties => ({
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 'var(--radius-xl)',
    background: active ? 'var(--color-accent-glow)' : 'var(--color-bg-overlay)',
    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
    border: `1px solid ${active ? 'var(--color-accent-dim)' : 'var(--color-border)'}`,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    fontWeight: active ? 600 : 400,
  })

  const toggle: CSSProperties = {
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 'var(--radius-xl)',
    background: animate ? 'var(--color-bg-overlay)' : 'var(--color-bg-hover)',
    color: 'var(--color-text-muted)',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  }

  return (
    <div style={containerStyle}>
      {scene === 'bedroom' ? (
        <BedroomScene slots={slots} weather={weather} animate={animate} restored={restored} />
      ) : (
        <PlaceholderScene scene={scene} />
      )}

      {restored && (
        <div style={{
          fontSize: 12, color: 'var(--color-success)', fontWeight: 600,
          textAlign: 'center', letterSpacing: 0.5,
        }}>
          {dayClosed ? 'Day complete — room restored' : 'All tasks done — room restored!'}
        </div>
      )}

      <div style={controls}>
        {scenes.map((s) => (
          <button key={s} style={pill(scene === s)} onClick={() => setScene(s)}>
            {sceneLabels[s]}
          </button>
        ))}
        <span style={{ width: 1, height: 16, background: 'var(--color-border)' }} />
        {weathers.map((w) => (
          <button key={w} style={pill(weather === w)} onClick={() => setWeather(w)}>
            {weatherLabels[w]}
          </button>
        ))}
        <span style={{ width: 1, height: 16, background: 'var(--color-border)' }} />
        <button style={toggle} onClick={() => setAnimate(!animate)}>
          {animate ? '⏸ Static' : '▶ Animate'}
        </button>
      </div>
    </div>
  )
}

function PlaceholderScene({ scene }: { scene: SceneId }) {
  const colors: Record<SceneId, { wall: string; floor: string }> = {
    bedroom: { wall: '#231f33', floor: '#2a2540' },
    cafe: { wall: '#241f1a', floor: '#2d2520' },
    garden: { wall: '#1a231b', floor: '#1f2a20' },
  }
  const c = colors[scene]
  const style: CSSProperties = {
    width: '100%',
    maxWidth: 640,
    aspectRatio: '16 / 10',
    borderRadius: 'var(--radius-lg)',
    background: `linear-gradient(180deg, ${c.wall} 0%, ${c.wall} 55%, ${c.floor} 55%, ${c.floor} 100%)`,
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-lg)',
    imageRendering: 'pixelated',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-muted)',
    fontSize: 13,
    fontStyle: 'italic',
  }
  return <div style={style}>{sceneLabels[scene]} — coming soon</div>
}
