import type { CSSProperties } from 'react'
import type { ClutterSlot } from '../../lib/clutterEngine'
import type { WeatherId, ScenePalette } from '../../stores/themeStore'
import { RainEffect, WindowRain } from './RainEffect'

interface BedroomSceneProps {
  slots: ClutterSlot[]
  weather: WeatherId
  animate: boolean
  restored?: boolean
  palette?: ScenePalette
}

/* ── palette (set per-render from prop) ── */
let P: ScenePalette = {
  wall: '#252038', wallHi: '#2d2842',
  floor: '#2e2848', floorHi: '#362f52',
  wood: '#3a3450', woodLt: '#4a4065',
  accent: '#c4b5fd', accentDim: '#8b7cc8',
  blanket: '#c4b5fd', pillow: '#ddd6fe',
  sky: '#1e2540', skyRain: '#283050',
  rug1: 'rgba(196,181,253,0.08)', rug2: 'rgba(196,181,253,0.04)',
}

const abs = (extra: CSSProperties): CSSProperties => ({
  position: 'absolute',
  ...extra,
})

/* ── Furniture pieces ── */

function Window({ rain, animate }: { rain: boolean; animate: boolean }) {
  const frame = abs({ left: '14%', top: '6%', width: '16%', height: '36%', zIndex: 1 })
  const glass: CSSProperties = {
    width: '100%', height: '100%',
    borderRadius: 4,
    background: rain ? P.skyRain : P.sky,
    border: `2px solid ${P.woodLt}`,
    overflow: 'hidden',
    position: 'relative',
    transition: 'background 1s ease',
  }
  const paneV: CSSProperties = abs({
    left: '50%', top: 0, bottom: 0, width: 2,
    background: P.woodLt, transform: 'translateX(-50%)', zIndex: 2,
  })
  const paneH: CSSProperties = abs({
    top: '50%', left: 0, right: 0, height: 2,
    background: P.woodLt, transform: 'translateY(-50%)', zIndex: 2,
  })
  const sill: CSSProperties = abs({
    bottom: -4, left: '-4%', right: '-4%', height: 5,
    background: P.wood, borderRadius: 2, zIndex: 3,
  })
  return (
    <div style={frame}>
      <div style={glass}>
        {rain && <WindowRain animate={animate} />}
        <div style={paneV} />
        <div style={paneH} />
      </div>
      <div style={sill} />
    </div>
  )
}

function Bookshelf() {
  const f = abs({ right: '4%', top: '5%', width: '16%', height: '40%', zIndex: 1 })
  const outer: CSSProperties = {
    width: '100%', height: '100%', background: P.wood,
    borderRadius: 3, position: 'relative', border: `1px solid ${P.woodLt}`,
  }
  const shelf = (top: string): CSSProperties => abs({
    left: '6%', right: '6%', top, height: 2, background: P.woodLt,
  })
  const book = (left: string, top: string, w: number, h: number, color: string): CSSProperties => abs({
    left, top, width: w, height: h, background: color, borderRadius: 1,
  })
  return (
    <div style={f}>
      <div style={outer}>
        <div style={shelf('30%')} />
        <div style={shelf('60%')} />
        <div style={book('12%', '8%', 6, 18, P.accentDim)} />
        <div style={book('26%', '10%', 5, 16, P.accent)} />
        <div style={book('38%', '9%', 7, 17, P.accent)} />
        <div style={book('55%', '12%', 5, 14, P.woodLt)} />
        <div style={book('14%', '35%', 6, 20, P.accentDim)} />
        <div style={book('28%', '38%', 5, 17, P.accentDim)} />
        <div style={book('50%', '36%', 7, 19, P.accent)} />
        <div style={book('12%', '65%', 5, 18, P.accent)} />
        <div style={book('25%', '67%', 6, 16, P.accentDim)} />
        <div style={book('42%', '64%', 5, 19, P.accent)} />
      </div>
    </div>
  )
}

function Desk() {
  const f = abs({ right: '18%', top: '46%', width: '24%', height: '14%', zIndex: 2 })
  const surface: CSSProperties = {
    width: '100%', height: '40%', background: P.wood,
    borderRadius: '3px 3px 0 0', border: `1px solid ${P.woodLt}`,
    borderBottom: 'none', position: 'relative',
  }
  const legL = abs({ left: '6%', top: '40%', width: 4, bottom: 0, background: P.wood })
  const legR = abs({ right: '6%', top: '40%', width: 4, bottom: 0, background: P.wood })
  return (
    <div style={f}>
      <div style={surface} />
      <div style={legL} />
      <div style={legR} />
    </div>
  )
}

function Chair() {
  const f = abs({ left: '48%', top: '44%', width: '8%', height: '18%', zIndex: 2 })
  const back: CSSProperties = abs({
    left: '15%', top: 0, width: '70%', height: '50%',
    background: P.wood, borderRadius: '3px 3px 0 0', border: `1px solid ${P.woodLt}`,
  })
  const seat: CSSProperties = abs({
    left: '5%', top: '48%', width: '90%', height: '20%',
    background: P.woodLt, borderRadius: 2,
  })
  const legL = abs({ left: '10%', top: '66%', width: 3, bottom: 0, background: P.wood })
  const legR = abs({ right: '10%', top: '66%', width: 3, bottom: 0, background: P.wood })
  return (
    <div style={f}>
      <div style={back} />
      <div style={seat} />
      <div style={legL} />
      <div style={legR} />
    </div>
  )
}

function Bed() {
  const f = abs({ right: '3%', bottom: '0%', width: '42%', height: '42%', zIndex: 2 })
  const frame: CSSProperties = abs({
    inset: 0, background: P.wood, borderRadius: '4px 4px 0 0',
    border: `1px solid ${P.woodLt}`, borderBottom: 'none',
  })
  const mattress: CSSProperties = abs({
    left: '4%', right: '4%', top: '20%', bottom: '4%',
    background: P.wallHi, borderRadius: 3,
  })
  const blanket: CSSProperties = abs({
    left: '6%', right: '6%', top: '35%', bottom: '6%',
    background: P.blanket, opacity: 0.18, borderRadius: 3,
  })
  const blanketStripe: CSSProperties = abs({
    left: '6%', right: '6%', top: '55%', height: '8%',
    background: P.blanket, opacity: 0.10, borderRadius: 2,
  })
  const pillow: CSSProperties = abs({
    right: '8%', top: '22%', width: '20%', height: '14%',
    background: P.pillow, opacity: 0.20, borderRadius: 3,
  })
  const headboard: CSSProperties = abs({
    left: '2%', right: '2%', top: 0, height: '18%',
    background: P.woodLt, borderRadius: '4px 4px 0 0',
  })
  return (
    <div style={f}>
      <div style={frame} />
      <div style={headboard} />
      <div style={mattress} />
      <div style={blanket} />
      <div style={blanketStripe} />
      <div style={pillow} />
    </div>
  )
}

function Rug() {
  return (
    <div style={abs({
      left: '18%', bottom: '6%', width: '28%', height: '14%', zIndex: 1,
      background: P.rug1, borderRadius: '50%', border: `1px solid ${P.rug2}`,
    })} />
  )
}

function Lamp({ animate }: { animate: boolean }) {
  const glow: CSSProperties = abs({
    left: '60%', top: '30%', width: '16%', height: '24%', zIndex: 4,
    background: `radial-gradient(ellipse, ${P.accent}18 0%, transparent 70%)`,
    pointerEvents: 'none',
    animation: animate ? 'lamp-pulse 4s ease-in-out infinite' : 'none',
  })
  const shade: CSSProperties = abs({
    left: '65%', top: '38%', width: '5%', height: '6%', zIndex: 3,
    background: P.accentDim, opacity: 0.5, borderRadius: '4px 4px 2px 2px',
  })
  const pole: CSSProperties = abs({
    left: 'calc(65% + 2%)', top: '44%', width: 2, height: '5%', zIndex: 3,
    background: P.woodLt,
  })
  return (
    <>
      <div style={glow} />
      <div style={shade} />
      <div style={pole} />
    </>
  )
}

function DoorFrame() {
  const f = abs({ left: '2%', top: '12%', width: '10%', height: '46%', zIndex: 1 })
  const door: CSSProperties = {
    width: '100%', height: '100%', background: P.wood,
    borderRadius: '3px 3px 0 0', border: `1px solid ${P.woodLt}`,
    borderBottom: 'none', position: 'relative',
  }
  const knob = abs({
    right: '15%', top: '52%', width: 4, height: 4,
    background: P.accentDim, borderRadius: '50%',
  })
  return (
    <div style={f}><div style={door}><div style={knob} /></div></div>
  )
}

/* ── Clutter objects ── */

interface ClutterDef {
  name: string
  x: string
  y: string
  z: number
  render: (o: number) => React.ReactNode
}

const clutterDefs: ClutterDef[] = [
  {
    name: 'books',
    x: '64%', y: '42%', z: 3,
    render: (o) => (
      <>
        <div style={{ width: 16, height: 4, background: '#c87070', opacity: o, borderRadius: 1 }} />
        <div style={{ width: 18, height: 4, background: '#7090c8', opacity: o, borderRadius: 1, marginTop: 1, marginLeft: -1 }} />
        <div style={{ width: 14, height: 4, background: '#80b880', opacity: o, borderRadius: 1, marginTop: 1, marginLeft: 2 }} />
      </>
    ),
  },
  {
    name: 'mug',
    x: '74%', y: '43%', z: 3,
    render: (o) => (
      <div style={{ position: 'relative', opacity: o }}>
        <div style={{ width: 8, height: 3, background: '#d4d0e0', borderRadius: '2px 2px 0 0' }} />
        <div style={{ width: 8, height: 7, background: '#b0a8c0', borderRadius: '0 0 2px 2px' }} />
        <div style={abs({ right: -4, top: 4, width: 4, height: 4, border: '1.5px solid #b0a8c0', borderRadius: '0 3px 3px 0', borderLeft: 'none' })} />
      </div>
    ),
  },
  {
    name: 'papers',
    x: '30%', y: '76%', z: 3,
    render: (o) => (
      <div style={{ position: 'relative', opacity: o }}>
        <div style={{ width: 12, height: 9, background: '#e8e4f0', opacity: 0.6, borderRadius: 1, transform: 'rotate(-8deg)' }} />
        <div style={abs({ left: 8, top: 4, width: 10, height: 8, background: '#ddd8ea', opacity: 0.5, borderRadius: 1, transform: 'rotate(5deg)' })} />
        <div style={abs({ left: 3, top: 8, width: 11, height: 8, background: '#d8d2e4', opacity: 0.4, borderRadius: 1, transform: 'rotate(-3deg)' })} />
      </div>
    ),
  },
  {
    name: 'clothes',
    x: '48%', y: '38%', z: 3,
    render: (o) => (
      <div style={{ position: 'relative', opacity: o }}>
        <div style={{ width: 18, height: 6, background: '#6878a0', borderRadius: '4px 4px 1px 1px', transform: 'rotate(-5deg)' }} />
        <div style={{ width: 14, height: 4, background: '#586890', borderRadius: 1, marginTop: -1, marginLeft: 2 }} />
      </div>
    ),
  },
  {
    name: 'shoes',
    x: '4%', y: '84%', z: 3,
    render: (o) => (
      <div style={{ display: 'flex', gap: 3, opacity: o }}>
        <div style={{ width: 8, height: 6, background: '#5a5070', borderRadius: '3px 3px 1px 1px' }} />
        <div style={{ width: 8, height: 6, background: '#5a5070', borderRadius: '3px 3px 1px 1px', marginTop: 1 }} />
      </div>
    ),
  },
  {
    name: 'pizzabox',
    x: '22%', y: '68%', z: 3,
    render: (o) => (
      <div style={{ position: 'relative', opacity: o }}>
        <div style={{ width: 20, height: 18, background: '#8a7050', borderRadius: 2, border: '1px solid #9a8060' }} />
        <div style={abs({ left: 3, top: 3, width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '6px solid #a09070' })} />
      </div>
    ),
  },
  {
    name: 'laptop',
    x: '68%', y: '62%', z: 3,
    render: (o) => (
      <div style={{ position: 'relative', opacity: o }}>
        <div style={{ width: 22, height: 14, background: '#303848', borderRadius: '2px 2px 0 0', border: '1px solid #404858' }} />
        <div style={{ width: 14, height: 8, background: '#384060', borderRadius: 1, margin: '2px auto 0' }} />
        <div style={{ width: 26, height: 3, background: '#3a3450', borderRadius: '0 0 2px 2px', marginLeft: -2 }} />
      </div>
    ),
  },
  {
    name: 'bag',
    x: '38%', y: '74%', z: 3,
    render: (o) => (
      <div style={{ position: 'relative', opacity: o }}>
        <div style={{ width: 14, height: 16, background: '#605878', borderRadius: '5px 5px 3px 3px' }} />
        <div style={abs({ left: 3, top: -3, width: 8, height: 4, border: '1.5px solid #706888', borderRadius: '4px 4px 0 0', borderBottom: 'none' })} />
      </div>
    ),
  },
]

/* ── Clutter wrapper with transitions ── */

function ClutterObject({ def, level, animate }: { def: ClutterDef; level: number; animate: boolean }) {
  if (level <= 0) return null
  const style: CSSProperties = {
    position: 'absolute',
    left: def.x,
    top: def.y,
    zIndex: def.z,
    opacity: level,
    transform: `translateY(${(1 - level) * 6}px)`,
    transition: animate ? 'opacity 0.6s ease, transform 0.6s ease' : 'none',
    pointerEvents: 'none',
    imageRendering: 'pixelated',
  }
  return <div style={style}>{def.render(1)}</div>
}

/* ── Restoration glow overlay ── */

function RestorationOverlay({ animate }: { animate: boolean }) {
  const glow: CSSProperties = abs({
    inset: 0,
    background: `radial-gradient(ellipse at 50% 40%, ${P.accent}20 0%, transparent 60%)`,
    zIndex: 8,
    pointerEvents: 'none',
    animation: animate ? 'restore-glow 3s ease-in-out infinite' : 'none',
    opacity: animate ? 1 : 0.6,
  })
  const sparkles: CSSProperties = abs({
    inset: 0,
    zIndex: 9,
    pointerEvents: 'none',
    overflow: 'hidden',
  })
  const sparkle = (left: string, top: string, delay: string, size: number): CSSProperties => abs({
    left, top,
    width: size, height: size,
    background: P.accent,
    borderRadius: '50%',
    opacity: 0.6,
    animation: animate ? `sparkle-float 2.5s ${delay} ease-in-out infinite` : 'none',
  })
  return (
    <>
      <div style={glow} />
      <div style={sparkles}>
        <div style={sparkle('20%', '30%', '0s', 3)} />
        <div style={sparkle('45%', '20%', '0.4s', 2)} />
        <div style={sparkle('70%', '35%', '0.8s', 3)} />
        <div style={sparkle('30%', '55%', '1.2s', 2)} />
        <div style={sparkle('60%', '50%', '1.6s', 3)} />
        <div style={sparkle('80%', '60%', '0.6s', 2)} />
        <div style={sparkle('15%', '70%', '1.0s', 2)} />
      </div>
    </>
  )
}

/* ── Main scene ── */

export function BedroomScene({ slots, weather, animate, restored, palette }: BedroomSceneProps) {
  if (palette) P = palette

  const isRaining = weather === 'rain'
  const isSnowing = weather === 'snow'

  const room: CSSProperties = {
    width: '100%',
    maxWidth: 640,
    aspectRatio: '16 / 10',
    borderRadius: 'var(--radius-lg)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: restored
      ? `0 8px 24px rgba(0,0,0,0.35), 0 0 30px ${P.accent}15`
      : 'var(--shadow-lg)',
    imageRendering: 'pixelated',
    border: '1px solid var(--color-border)',
    transition: 'box-shadow 1s ease',
  }

  const wall: CSSProperties = abs({
    inset: 0, bottom: '42%',
    background: `linear-gradient(180deg, ${P.wall} 0%, ${P.wallHi} 100%)`,
  })
  const floor: CSSProperties = abs({
    left: 0, right: 0, bottom: 0, top: '58%',
    background: `linear-gradient(180deg, ${P.floor} 0%, ${P.floorHi} 100%)`,
  })
  const baseboard: CSSProperties = abs({
    left: 0, right: 0, top: '57%', height: '2%',
    background: P.woodLt, zIndex: 1,
  })

  return (
    <div style={room}>
      <div style={wall} />
      <div style={floor} />
      <div style={baseboard} />

      <Window rain={isRaining} animate={animate} />
      <Bookshelf />
      <DoorFrame />
      <Desk />
      <Chair />
      <Bed />
      <Rug />
      <Lamp animate={animate} />

      {slots.map((slot, i) => (
        <ClutterObject key={i} def={clutterDefs[i]} level={slot.clutterLevel} animate={animate} />
      ))}

      {isRaining && <RainEffect animate={animate} />}
      {isSnowing && <RainEffect animate={animate} tint="rgba(220,220,240,0.3)" intensity={25} />}
      {restored && <RestorationOverlay animate={animate} />}
    </div>
  )
}
