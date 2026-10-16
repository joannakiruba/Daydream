import { useRef, useEffect, useMemo, type CSSProperties } from 'react'
import { useTaskStore } from '../../stores/taskStore'
import { usePizzaStore, TOPPINGS, type ToppingId } from '../../stores/pizzaStore'
import { today } from '../../lib/dates'

const GRID = 80
const CX = 40
const CY = 40
const RADIUS = 28
const CRUST_W = 4
const INNER_R = 4

const TOPPING_SPOTS: [number, number][][] = Array.from({ length: 8 }, (_, i) => {
  const base = (i * 45 + 22.5 - 90) * Math.PI / 180
  return [
    [Math.round(CX + Math.cos(base - 0.2) * 11), Math.round(CY + Math.sin(base - 0.2) * 11)],
    [Math.round(CX + Math.cos(base + 0.15) * 17), Math.round(CY + Math.sin(base + 0.15) * 17)],
    [Math.round(CX + Math.cos(base - 0.1) * 22), Math.round(CY + Math.sin(base - 0.1) * 22)],
  ]
})

const C = {
  boxOuter: '#6B4E0A',
  boxInner: '#8B6914',
  boxFloor: '#7A5C10',
  boxRim: '#9A7820',
  boxShadow: 'rgba(0,0,0,0.35)',
  cheese: '#E8C840',
  cheeseDark: '#D4B838',
  crust: '#C09030',
  crustEdge: '#A07020',
  crustHi: '#D0A040',
  sauce: '#B83020',
  sauceLight: '#C83828',
  line: '#B08828',
}

function drawPizza(
  ctx: CanvasRenderingContext2D,
  filledSlices: boolean[],
  toppings: ToppingId[],
) {
  ctx.clearRect(0, 0, GRID, GRID)

  // Box shadow
  ctx.fillStyle = C.boxShadow
  for (let y = 9; y < 77; y++)
    for (let x = 7; x < 77; x++)
      ctx.fillRect(x, y, 1, 1)

  // Box outer
  ctx.fillStyle = C.boxOuter
  for (let y = 5; y < 75; y++)
    for (let x = 5; x < 75; x++)
      ctx.fillRect(x, y, 1, 1)

  // Box inner
  ctx.fillStyle = C.boxInner
  for (let y = 8; y < 72; y++)
    for (let x = 8; x < 72; x++)
      ctx.fillRect(x, y, 1, 1)

  // Circular recess where pizza sits
  for (let y = CY - RADIUS - 3; y <= CY + RADIUS + 3; y++) {
    for (let x = CX - RADIUS - 3; x <= CX + RADIUS + 3; x++) {
      const dist = Math.sqrt((x - CX + 0.5) ** 2 + (y - CY + 0.5) ** 2)
      if (dist <= RADIUS + 2) {
        ctx.fillStyle = C.boxFloor
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }

  // Draw pizza slices
  const anyFilled = filledSlices.some(Boolean)
  if (anyFilled) {
    // First pass: sauce base for all filled slices
    for (let y = CY - RADIUS; y <= CY + RADIUS; y++) {
      for (let x = CX - RADIUS; x <= CX + RADIUS; x++) {
        const dx = x - CX + 0.5
        const dy = y - CY + 0.5
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > RADIUS) continue

        const angle = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360 + 90) % 360
        const sliceIdx = Math.floor(angle / 45)
        if (!filledSlices[sliceIdx]) continue

        if (dist > RADIUS - 1) {
          ctx.fillStyle = C.crustEdge
        } else if (dist > RADIUS - CRUST_W) {
          ctx.fillStyle = ((x + y) % 3 === 0) ? C.crust : C.crustHi
        } else if (dist < INNER_R) {
          ctx.fillStyle = ((x + y) % 2 === 0) ? C.sauce : C.sauceLight
        } else {
          ctx.fillStyle = ((x + y) % 4 === 0) ? C.cheeseDark : C.cheese
        }
        ctx.fillRect(x, y, 1, 1)
      }
    }

    // Dividing lines
    for (let i = 0; i < 8; i++) {
      const prev = (i + 7) % 8
      if (!filledSlices[i] && !filledSlices[prev]) continue
      const angle = (i * 45 - 90) * Math.PI / 180
      for (let r = INNER_R; r <= RADIUS - 1; r++) {
        const x = Math.round(CX + Math.cos(angle) * r - 0.5)
        const y = Math.round(CY + Math.sin(angle) * r - 0.5)
        ctx.fillStyle = C.line
        ctx.fillRect(x, y, 1, 1)
      }
    }

    // Toppings
    const activeToppings = TOPPINGS.filter(t => toppings.includes(t.id))
    for (let sliceIdx = 0; sliceIdx < 8; sliceIdx++) {
      if (!filledSlices[sliceIdx]) continue
      const spots = TOPPING_SPOTS[sliceIdx]
      activeToppings.forEach((topping, tIdx) => {
        if (tIdx >= spots.length) return
        const [tx, ty] = spots[tIdx]
        ctx.fillStyle = topping.color
        ctx.fillRect(tx, ty, 2, 2)
      })
    }
  }

  // Box rim highlights (top and left edges)
  ctx.fillStyle = C.boxRim
  for (let x = 5; x < 75; x++) ctx.fillRect(x, 5, 1, 1)
  for (let y = 5; y < 75; y++) ctx.fillRect(5, y, 1, 1)
  // Bottom-right darker edge
  ctx.fillStyle = '#5A4208'
  for (let x = 5; x < 75; x++) ctx.fillRect(x, 74, 1, 1)
  for (let y = 5; y < 75; y++) ctx.fillRect(74, y, 1, 1)
}

export function PizzaScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tasks = useTaskStore(s => s.tasks)
  const assignments = useTaskStore(s => s.assignments)
  const dayRecords = useTaskStore(s => s.dayRecords)
  const { selectedToppings, toggleTopping } = usePizzaStore()

  const todayStr = today()

  const { filledSlices, doneCount, totalCount, allDone, dayClosed } = useMemo(() => {
    const todayAssignments = Object.values(assignments).filter(a => a.date === todayStr)
    const total = todayAssignments.length
    const done = todayAssignments.filter(a => a.done).length
    const closed = dayRecords[todayStr]?.closedAt != null

    const sliceCount = total > 0 ? Math.round((done / total) * 8) : 0
    const filled = Array.from({ length: 8 }, (_, i) => i < sliceCount)

    return {
      filledSlices: filled,
      doneCount: done,
      totalCount: total,
      allDone: total > 0 && done === total,
      dayClosed: closed,
    }
  }, [assignments, tasks, dayRecords, todayStr])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawPizza(ctx, filledSlices, selectedToppings)
  }, [filledSlices, selectedToppings])

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-md)',
    height: '100%',
    padding: 'var(--space-md)',
  }

  const canvasWrap: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: 360,
  }

  const canvasStyle: CSSProperties = {
    imageRendering: 'pixelated',
    width: '100%',
    height: 'auto',
    display: 'block',
  }

  const glowStyle: CSSProperties = allDone ? {
    position: 'absolute',
    inset: -8,
    border: '3px solid var(--color-success)',
    opacity: 0.5,
    pointerEvents: 'none',
    animation: 'pizza-glow 2s ease-in-out infinite',
  } : { display: 'none' }

  const statusStyle: CSSProperties = {
    fontSize: 12,
    color: allDone ? 'var(--color-success)' : 'var(--color-text-muted)',
    textAlign: 'center',
    fontWeight: allDone ? 600 : 400,
  }

  const labelStyle: CSSProperties = {
    fontSize: 10,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 600,
  }

  const toppingRow: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-xs)',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 360,
  }

  return (
    <div style={container}>
      <div style={canvasWrap}>
        <canvas
          ref={canvasRef}
          width={GRID}
          height={GRID}
          style={canvasStyle}
        />
        <div style={glowStyle} />
      </div>

      <div style={statusStyle}>
        {totalCount === 0 && 'Complete tasks to earn pizza slices!'}
        {totalCount > 0 && allDone && (dayClosed ? 'Day complete — enjoy your pizza!' : 'All tasks done — pizza complete!')}
        {totalCount > 0 && !allDone && `${doneCount}/${totalCount} tasks — ${filledSlices.filter(Boolean).length}/8 slices`}
      </div>

      <div style={labelStyle}>Toppings</div>
      <div style={toppingRow}>
        {TOPPINGS.map(t => {
          const active = selectedToppings.includes(t.id)
          const btn: CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            fontSize: 10,
            border: `2px solid ${active ? t.color : 'var(--color-border)'}`,
            background: active ? `${t.color}20` : 'transparent',
            color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
          }
          const dot: CSSProperties = {
            width: 8,
            height: 8,
            background: t.color,
            flexShrink: 0,
          }
          return (
            <button key={t.id} style={btn} onClick={() => toggleTopping(t.id)}>
              <span style={dot} />
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
