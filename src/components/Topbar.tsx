import type { CSSProperties } from 'react'

export function Topbar() {
  const barStyle: CSSProperties = {
    height: 'var(--topbar-height)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--space-md)',
    background: 'var(--color-bg-raised)',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
    zIndex: 30,
    WebkitAppRegion: 'drag' as unknown as string,
  }

  const titleStyle: CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-accent)',
    letterSpacing: 0.5,
  }

  const dateStyle: CSSProperties = {
    fontSize: 12,
    color: 'var(--color-text-muted)',
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <header style={barStyle}>
      <span style={titleStyle}>Daydream</span>
      <span style={dateStyle}>{today}</span>
    </header>
  )
}
