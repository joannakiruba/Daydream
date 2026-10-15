import { useMemo, type CSSProperties } from 'react'

interface RainEffectProps {
  animate: boolean
  tint?: string
  intensity?: number
}

interface Drop {
  left: string
  height: number
  opacity: number
  delay: string
  duration: string
}

function makeDrops(count: number): Drop[] {
  const out: Drop[] = []
  for (let i = 0; i < count; i++) {
    const seed = i * 7 + 13
    out.push({
      left: `${(seed * 3.7) % 100}%`,
      height: 8 + (seed % 5) * 3,
      opacity: 0.12 + (seed % 4) * 0.06,
      delay: `${((seed * 0.17) % 1.8).toFixed(2)}s`,
      duration: `${(0.5 + (seed % 6) * 0.08).toFixed(2)}s`,
    })
  }
  return out
}

export function RainEffect({ animate, tint = 'rgba(140,160,220,0.25)', intensity = 40 }: RainEffectProps) {
  const drops = useMemo(() => makeDrops(intensity), [intensity])

  const overlay: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 6,
    borderRadius: 'inherit',
  }

  return (
    <div style={overlay} aria-hidden>
      {drops.map((d, i) => {
        const style: CSSProperties = {
          position: 'absolute',
          left: d.left,
          top: animate ? undefined : `${(i * 23) % 80}%`,
          width: 1.5,
          height: d.height,
          background: tint,
          opacity: d.opacity,
          borderRadius: 1,
          animation: animate ? `rain-fall ${d.duration} ${d.delay} linear infinite` : 'none',
          transform: animate ? undefined : 'rotate(4deg)',
        }
        return <div key={i} style={style} />
      })}
    </div>
  )
}

export function WindowRain({ animate }: { animate: boolean }) {
  const streaks = useMemo(() => {
    const out: { left: string; top: string; h: number; delay: string }[] = []
    for (let i = 0; i < 8; i++) {
      out.push({
        left: `${10 + (i * 11) % 80}%`,
        top: `${(i * 17) % 60}%`,
        h: 12 + (i % 3) * 6,
        delay: `${(i * 0.3).toFixed(1)}s`,
      })
    }
    return out
  }, [])

  return (
    <>
      {streaks.map((s, i) => {
        const style: CSSProperties = {
          position: 'absolute',
          left: s.left,
          top: animate ? undefined : s.top,
          width: 1,
          height: s.h,
          background: 'rgba(160,180,240,0.35)',
          borderRadius: 1,
          transform: 'rotate(8deg)',
          animation: animate ? `rain-fall 0.7s ${s.delay} linear infinite` : 'none',
        }
        return <div key={i} style={style} />
      })}
    </>
  )
}
