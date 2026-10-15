import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { DockPosition } from '../../stores/widgetStore'

interface DockIconProps {
  icon: string
  label: string
  active: boolean
  dockPosition: DockPosition
  onClick: () => void
}

export function DockIcon({ icon, label, active, dockPosition, onClick }: DockIconProps) {
  const [hovered, setHovered] = useState(false)

  const btnStyle: CSSProperties = {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
    fontSize: 18,
    background: active
      ? 'var(--color-accent-glow)'
      : hovered
        ? 'var(--color-bg-hover)'
        : 'transparent',
    color: active
      ? 'var(--color-accent)'
      : hovered
        ? 'var(--color-text-secondary)'
        : 'var(--color-text-muted)',
    transition: 'background var(--transition-fast), color var(--transition-fast)',
    position: 'relative',
    flexShrink: 0,
  }

  const tooltipOffset: Record<DockPosition, CSSProperties> = {
    left: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    right: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    top: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
  }

  const tooltipStyle: CSSProperties = {
    position: 'absolute',
    ...tooltipOffset[dockPosition],
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-overlay)',
    color: 'var(--color-text-primary)',
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: hovered && !active ? 1 : 0,
    transition: 'opacity var(--transition-fast)',
    zIndex: 50,
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--color-border)',
  }

  return (
    <button
      style={btnStyle}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      <span style={tooltipStyle} role="tooltip">{label}</span>
    </button>
  )
}
