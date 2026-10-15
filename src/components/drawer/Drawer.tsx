import { AnimatePresence, motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useWidgetStore, dockAxis, type WidgetId, type DockPosition } from '../../stores/widgetStore'
import { TasksWidget } from '../tasks/TasksWidget'
import { QuickCaptureWidget } from '../widgets/QuickCaptureWidget'
import { ScratchpadWidget } from '../widgets/ScratchpadWidget'
import { JournalWidget } from '../widgets/JournalWidget'
import { DailyReviewWidget } from '../widgets/DailyReviewWidget'
import { CalendarWidget } from '../widgets/CalendarWidget'
import { CountdownWidget } from '../widgets/CountdownWidget'
import { ThemeStudioWidget } from '../widgets/ThemeStudioWidget'

const widgetLabels: Record<WidgetId, string> = {
  tasks: 'Tasks',
  journal: 'Journal',
  scratchpad: 'Scratchpad',
  capture: 'Quick Capture',
  calendar: 'Calendar',
  countdowns: 'Countdowns',
  review: 'Daily Review',
  theme: 'Theme Studio',
}

const widgetIcons: Record<WidgetId, string> = {
  tasks: '☑',
  journal: '✎',
  scratchpad: '✐',
  capture: '⚡',
  calendar: '▦',
  countdowns: '⏳',
  review: '★',
  theme: '◐',
}

function getContainerStyle(pos: DockPosition, isOpen: boolean): CSSProperties {
  const axis = dockAxis(pos)
  const isVertical = axis === 'vertical'

  const anchors: Record<DockPosition, CSSProperties> = {
    left: { top: 0, left: 'var(--dock-thickness)', bottom: 0, width: 'var(--drawer-width)' },
    right: { top: 0, right: 'var(--dock-thickness)', bottom: 0, width: 'var(--drawer-width)' },
    top: { top: 'var(--dock-thickness)', left: 0, right: 0, height: 'var(--drawer-width)' },
    bottom: { bottom: 'var(--dock-thickness)', left: 0, right: 0, height: 'var(--drawer-width)' },
  }

  return {
    position: 'absolute',
    ...anchors[pos],
    zIndex: 15,
    pointerEvents: isOpen ? 'auto' : 'none',
    overflow: isVertical ? 'visible' : 'hidden',
  }
}

function getPanelStyle(pos: DockPosition): CSSProperties {
  const axis = dockAxis(pos)
  const isVertical = axis === 'vertical'

  const borderEdge: Record<DockPosition, CSSProperties> = {
    left: { borderRight: '1px solid var(--color-border)' },
    right: { borderLeft: '1px solid var(--color-border)' },
    top: { borderBottom: '1px solid var(--color-border)' },
    bottom: { borderTop: '1px solid var(--color-border)' },
  }

  return {
    width: isVertical ? '100%' : undefined,
    height: isVertical ? '100%' : '100%',
    background: 'var(--color-bg-raised)',
    ...borderEdge[pos],
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }
}

const DRAWER_SIZE = 340

function getSlideMotion(pos: DockPosition) {
  const map: Record<DockPosition, { axis: 'x' | 'y'; from: number }> = {
    left: { axis: 'x', from: -DRAWER_SIZE },
    right: { axis: 'x', from: DRAWER_SIZE },
    top: { axis: 'y', from: -DRAWER_SIZE },
    bottom: { axis: 'y', from: DRAWER_SIZE },
  }
  const { axis, from } = map[pos]
  return {
    initial: { [axis]: from, opacity: 0 },
    animate: { [axis]: 0, opacity: 1 },
    exit: { [axis]: from, opacity: 0 },
  }
}

export function Drawer() {
  const { activeWidget, setActiveWidget, dockPosition } = useWidgetStore()

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    padding: 'var(--space-sm) var(--space-md)',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
    minHeight: 44,
  }

  const iconStyle: CSSProperties = {
    fontSize: 16,
    color: 'var(--color-accent-dim)',
    flexShrink: 0,
  }

  const titleStyle: CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    flex: 1,
  }

  const closeStyle: CSSProperties = {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    fontSize: 14,
    color: 'var(--color-text-muted)',
    flexShrink: 0,
    transition: 'color var(--transition-fast)',
  }

  const bodyStyle: CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }

  const motion_ = activeWidget ? getSlideMotion(dockPosition) : null

  return (
    <div style={getContainerStyle(dockPosition, activeWidget !== null)}>
      <AnimatePresence mode="wait">
        {activeWidget && motion_ && (
          <motion.div
            key={activeWidget}
            initial={motion_.initial}
            animate={motion_.animate}
            exit={motion_.exit}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={getPanelStyle(dockPosition)}
          >
            <div style={headerStyle}>
              <span style={iconStyle}>{widgetIcons[activeWidget]}</span>
              <span style={titleStyle}>{widgetLabels[activeWidget]}</span>
              <button
                style={closeStyle}
                onClick={() => setActiveWidget(null)}
                aria-label="Close drawer"
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
              >
                ✕
              </button>
            </div>
            <div style={bodyStyle}>
              {activeWidget === 'tasks' && <TasksWidget />}
              {activeWidget === 'capture' && <QuickCaptureWidget />}
              {activeWidget === 'scratchpad' && <ScratchpadWidget />}
              {activeWidget === 'journal' && <JournalWidget />}
              {activeWidget === 'review' && <DailyReviewWidget />}
              {activeWidget === 'calendar' && <CalendarWidget />}
              {activeWidget === 'countdowns' && <CountdownWidget />}
              {activeWidget === 'theme' && <ThemeStudioWidget />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
