import { useRef, type CSSProperties } from 'react'
import { useScratchpadStore } from '../../stores/scratchpadStore'

export function ScratchpadWidget() {
  const content = useScratchpadStore((s) => s.content)
  const setContent = useScratchpadStore((s) => s.setContent)
  const ref = useRef<HTMLTextAreaElement>(null)

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: 'var(--space-sm)',
    gap: 'var(--space-xs)',
  }

  const label: CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    fontWeight: 600,
  }

  const area: CSSProperties = {
    flex: 1,
    resize: 'none',
    fontSize: 13,
    lineHeight: 1.6,
    padding: 'var(--space-sm)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-overlay)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  }

  const charCount: CSSProperties = {
    fontSize: 10,
    color: 'var(--color-text-muted)',
    textAlign: 'right',
  }

  return (
    <div style={container}>
      <div style={label}>Scratchpad</div>
      <textarea
        ref={ref}
        style={area}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type anything here — notes, snippets, ideas. It auto-saves."
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-focus)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
      />
      <div style={charCount}>{content.length} chars</div>
    </div>
  )
}
