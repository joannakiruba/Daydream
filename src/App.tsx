import type { CSSProperties } from 'react'
import { Topbar } from './components/Topbar'
import { Dock } from './components/dock/Dock'
import { Drawer } from './components/drawer/Drawer'
import { PizzaScene } from './components/pizza/PizzaScene'
import { useWidgetStore } from './stores/widgetStore'

export default function App() {
  const dockPosition = useWidgetStore((s) => s.dockPosition)
  const activeWidget = useWidgetStore((s) => s.activeWidget)

  const shellStyle: CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const bodyStyle: CSSProperties = {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  }

  const drawerSize = activeWidget ? 'var(--drawer-width)' : '0px'

  const inset = {
    top: dockPosition === 'top' ? `calc(var(--dock-thickness) + ${drawerSize})` : '0px',
    bottom: dockPosition === 'bottom' ? `calc(var(--dock-thickness) + ${drawerSize})` : '0px',
    left: dockPosition === 'left' ? `calc(var(--dock-thickness) + ${drawerSize})` : '0px',
    right: dockPosition === 'right' ? `calc(var(--dock-thickness) + ${drawerSize})` : '0px',
  }

  const workspaceStyle: CSSProperties = {
    position: 'absolute',
    top: inset.top,
    bottom: inset.bottom,
    left: inset.left,
    right: inset.right,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-xl)',
    transition: `all var(--transition-slow)`,
  }

  return (
    <div style={shellStyle}>
      <Topbar />
      <div style={bodyStyle}>
        <Dock />
        <Drawer />
        <main style={workspaceStyle}>
          <PizzaScene />
        </main>
      </div>
    </div>
  )
}
