import type { CSSProperties } from 'react'
import { useThemeStore } from '../../stores/themeStore'

const sceneColors: Record<string, { floor: string; wall: string; accent: string }> = {
  bedroom: { floor: '#2a2540', wall: '#231f33', accent: '#c4b5fd' },
  cafe: { floor: '#2d2520', wall: '#241f1a', accent: '#f0d08c' },
  garden: { floor: '#1f2a20', wall: '#1a231b', accent: '#86d9a0' },
}

export function PixelRoom() {
  const scene = useThemeStore((s) => s.scene)
  const colors = sceneColors[scene]

  const containerStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  }

  const roomStyle: CSSProperties = {
    width: '100%',
    maxWidth: 640,
    aspectRatio: '16 / 10',
    borderRadius: 'var(--radius-lg)',
    background: `linear-gradient(180deg, ${colors.wall} 0%, ${colors.wall} 55%, ${colors.floor} 55%, ${colors.floor} 100%)`,
    border: '1px solid var(--color-border)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-lg)',
    imageRendering: 'pixelated',
  }

  const windowStyle: CSSProperties = {
    width: 60,
    height: 80,
    borderRadius: 'var(--radius-md)',
    border: `2px solid ${colors.accent}40`,
    background: `linear-gradient(180deg, ${colors.accent}15 0%, ${colors.accent}05 100%)`,
    position: 'absolute',
    top: '15%',
    left: '20%',
  }

  const windowCrossV: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    background: `${colors.accent}30`,
    transform: 'translateX(-50%)',
  }

  const windowCrossH: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    background: `${colors.accent}30`,
    transform: 'translateY(-50%)',
  }

  const deskStyle: CSSProperties = {
    width: 120,
    height: 50,
    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
    background: `${colors.accent}18`,
    border: `1px solid ${colors.accent}20`,
    borderBottom: 'none',
    position: 'absolute',
    bottom: '0%',
    right: '25%',
  }

  const lampStyle: CSSProperties = {
    width: 16,
    height: 24,
    borderRadius: '8px 8px 2px 2px',
    background: `${colors.accent}25`,
    border: `1px solid ${colors.accent}30`,
    position: 'absolute',
    bottom: 50,
    right: 'calc(25% + 15px)',
  }

  const lampGlow: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${colors.accent}15 0%, transparent 70%)`,
    position: 'absolute',
    bottom: 52,
    right: 'calc(25% + 3px)',
    pointerEvents: 'none',
  }

  const rugStyle: CSSProperties = {
    width: 140,
    height: 30,
    borderRadius: 'var(--radius-xl)',
    background: `${colors.accent}10`,
    border: `1px solid ${colors.accent}12`,
    position: 'absolute',
    bottom: '10%',
    left: '15%',
  }

  const labelStyle: CSSProperties = {
    position: 'absolute',
    bottom: 'var(--space-lg)',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'var(--color-text-muted)',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.6,
  }

  return (
    <div style={containerStyle}>
      <div style={roomStyle}>
        <div style={windowStyle}>
          <div style={windowCrossV} />
          <div style={windowCrossH} />
        </div>
        <div style={rugStyle} />
        <div style={deskStyle} />
        <div style={lampStyle} />
        <div style={lampGlow} />
      </div>
      <span style={labelStyle}>{scene}</span>
    </div>
  )
}
