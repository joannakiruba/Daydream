import type { CSSProperties, ReactNode } from 'react'
import { useWidgetStore, dockAxis, type WidgetId } from '../../stores/widgetStore'
import { DockIcon } from './DockIcon'
import { PixelIcon } from '../PixelIcon'

const widgets: { id: WidgetId; label: string; icon: ReactNode }[] = [
  { id: 'tasks', label: 'Tasks', icon: <PixelIcon name="tasks" size={18} /> },
  { id: 'journal', label: 'Journal', icon: <PixelIcon name="journal" size={18} /> },
  { id: 'scratchpad', label: 'Scratchpad', icon: <PixelIcon name="scratchpad" size={18} /> },
  { id: 'calendar', label: 'Calendar', icon: <PixelIcon name="calendar" size={18} /> },
  { id: 'countdowns', label: 'Countdowns', icon: <PixelIcon name="countdowns" size={18} /> },
  { id: 'review', label: 'Review', icon: <PixelIcon name="review" size={18} /> },
  { id: 'theme', label: 'Theme', icon: <PixelIcon name="theme" size={18} /> },
]

const positionIcons: Record<string, string> = {
  left: 'chevron-right',
  top: 'chevron-down',
  right: 'chevron-left',
  bottom: 'chevron-up',
}

export function Dock() {
  const { activeWidget, toggleWidget, dockPosition, cycleDockPosition } = useWidgetStore()
  const axis = dockAxis(dockPosition)
  const isVertical = axis === 'vertical'

  const borderEdge: Record<string, CSSProperties> = {
    left: { borderRight: '1px solid var(--color-border)' },
    right: { borderLeft: '1px solid var(--color-border)' },
    top: { borderBottom: '1px solid var(--color-border)' },
    bottom: { borderTop: '1px solid var(--color-border)' },
  }

  const positionAnchors: Record<string, CSSProperties> = {
    left: { top: 0, left: 0, bottom: 0, width: 'var(--dock-thickness)' },
    right: { top: 0, right: 0, bottom: 0, width: 'var(--dock-thickness)' },
    top: { top: 0, left: 0, right: 0, height: 'var(--dock-thickness)' },
    bottom: { bottom: 0, left: 0, right: 0, height: 'var(--dock-thickness)' },
  }

  const navStyle: CSSProperties = {
    position: 'absolute',
    ...positionAnchors[dockPosition],
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: 'center',
    padding: isVertical ? 'var(--space-sm) 0' : '0 var(--space-sm)',
    gap: 'var(--space-xs)',
    background: 'var(--color-bg-raised)',
    ...borderEdge[dockPosition],
    zIndex: 20,
    overflow: 'hidden',
  }

  const cyclerStyle: CSSProperties = {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12,
    color: 'var(--color-text-muted)',
    opacity: 0.5,
    transition: 'opacity var(--transition-fast)',
    flexShrink: 0,
    marginTop: isVertical ? 'auto' : 0,
    marginLeft: isVertical ? 0 : 'auto',
  }

  return (
    <nav style={navStyle} aria-label="Widget dock">
      {widgets.map((w) => (
        <DockIcon
          key={w.id}
          icon={w.icon}
          label={w.label}
          active={activeWidget === w.id}
          dockPosition={dockPosition}
          onClick={() => toggleWidget(w.id)}
        />
      ))}
      <button
        style={cyclerStyle}
        onClick={cycleDockPosition}
        aria-label={`Move dock (currently ${dockPosition})`}
        title={`Move dock (currently ${dockPosition})`}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5' }}
      >
        <PixelIcon name={positionIcons[dockPosition]} size={12} />
      </button>
    </nav>
  )
}
