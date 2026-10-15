import { useState, type CSSProperties } from 'react'
import { useThemeStore } from '../../stores/themeStore'
import { PRESETS, type WeatherId, type SeasonId } from '../../lib/themes'

const ACCENT_SWATCHES = [
  '#c4b5fd', '#f0a878', '#7888c0', '#90d890',
  '#e8a0d0', '#e0a050', '#a0c8e8', '#f08888',
  '#88d0b8', '#c8c080', '#b088d0', '#80b8d0',
]

const WEATHER_OPTIONS: { id: WeatherId; label: string; icon: string }[] = [
  { id: 'clear', label: 'Clear', icon: '☀' },
  { id: 'rain', label: 'Rain', icon: '🌧' },
  { id: 'snow', label: 'Snow', icon: '❄' },
]

const SEASONS: { id: SeasonId; label: string }[] = [
  { id: 'default', label: 'All' },
  { id: 'spring', label: 'Spring' },
  { id: 'summer', label: 'Summer' },
  { id: 'autumn', label: 'Autumn' },
  { id: 'winter', label: 'Winter' },
]

export function ThemeStudioWidget() {
  const {
    presetId, customAccent, weatherOverride, animationSpeed,
    respectReducedMotion, reducedMotionActive,
    setPreset, setCustomAccent, setWeatherOverride,
    setAnimationSpeed, setRespectReducedMotion, preset,
  } = useThemeStore()

  const [seasonFilter, setSeasonFilter] = useState<SeasonId>('default')
  const [showCustomHex, setShowCustomHex] = useState(false)
  const [hexInput, setHexInput] = useState(customAccent ?? '')

  const filteredPresets = seasonFilter === 'default'
    ? PRESETS
    : PRESETS.filter((p) => p.season === seasonFilter || p.season === 'default')

  const handleHexSubmit = () => {
    const hex = hexInput.trim()
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      setCustomAccent(hex)
    }
  }

  const container: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: 'var(--space-sm)',
    gap: 'var(--space-md)',
    overflowY: 'auto',
  }

  const section: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-xs)',
  }

  const sectionLabel: CSSProperties = {
    fontSize: 11,
    color: 'var(--color-text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }

  const presetGrid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'var(--space-xs)',
  }

  const presetCard = (active: boolean): CSSProperties => ({
    padding: '8px',
    borderRadius: 'var(--radius-md)',
    background: active ? 'var(--color-accent-glow)' : 'var(--color-bg-overlay)',
    border: `1px solid ${active ? 'var(--color-accent-dim)' : 'var(--color-border)'}`,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  })

  const presetName: CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  }

  const presetPreview = (p: typeof PRESETS[0]): CSSProperties => ({
    height: 24,
    borderRadius: 3,
    background: `linear-gradient(135deg, ${p.scene.wall} 0%, ${p.scene.accent}40 50%, ${p.scene.floor} 100%)`,
    border: '1px solid rgba(255,255,255,0.04)',
  })

  const presetMeta: CSSProperties = {
    fontSize: 10,
    color: 'var(--color-text-muted)',
    display: 'flex',
    gap: 'var(--space-xs)',
  }

  const pillRow: CSSProperties = {
    display: 'flex',
    gap: 2,
    flexWrap: 'wrap',
  }

  const pill = (active: boolean): CSSProperties => ({
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 'var(--radius-xl)',
    background: active ? 'var(--color-accent-glow)' : 'var(--color-bg-overlay)',
    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
    border: `1px solid ${active ? 'var(--color-accent-dim)' : 'var(--color-border)'}`,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    fontWeight: active ? 600 : 400,
  })

  const swatchGrid: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-xs)',
  }

  const swatch = (color: string, active: boolean): CSSProperties => ({
    width: 24,
    height: 24,
    borderRadius: 'var(--radius-sm)',
    background: color,
    border: active ? '2px solid var(--color-text-primary)' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'border-color var(--transition-fast)',
  })

  const sliderRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
  }

  const sliderStyle: CSSProperties = {
    flex: 1,
    appearance: 'auto',
    height: 4,
    borderRadius: 2,
    cursor: 'pointer',
    accentColor: 'var(--color-accent)',
  }

  const checkRow: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-sm)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  }

  const checkbox: CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: 3,
    border: '2px solid var(--color-accent-dim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    cursor: 'pointer',
    flexShrink: 0,
  }

  const hexRow: CSSProperties = {
    display: 'flex',
    gap: 'var(--space-xs)',
    alignItems: 'center',
  }

  const hexInput_: CSSProperties = {
    flex: 1,
    fontSize: 12,
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg-base)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-mono)',
  }

  const activeWeather = weatherOverride ?? preset.weather

  return (
    <div style={container}>
      {/* ── Season filter ── */}
      <div style={section}>
        <div style={sectionLabel}>Season</div>
        <div style={pillRow}>
          {SEASONS.map((s) => (
            <button key={s.id} style={pill(seasonFilter === s.id)} onClick={() => setSeasonFilter(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Presets ── */}
      <div style={section}>
        <div style={sectionLabel}>Presets</div>
        <div style={presetGrid}>
          {filteredPresets.map((p) => (
            <button key={p.id} style={presetCard(presetId === p.id)} onClick={() => setPreset(p.id)}>
              <div style={presetPreview(p)} />
              <div style={presetName}>{p.name}</div>
              <div style={presetMeta}>
                <span>{p.weather === 'rain' ? '🌧' : p.weather === 'snow' ? '❄' : '☀'}</span>
                {p.season !== 'default' && <span>{p.season}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Accent color ── */}
      <div style={section}>
        <div style={sectionLabel}>Accent Color</div>
        <div style={swatchGrid}>
          {ACCENT_SWATCHES.map((c) => (
            <button
              key={c}
              style={swatch(c, customAccent === c)}
              onClick={() => setCustomAccent(customAccent === c ? null : c)}
              title={c}
            />
          ))}
          <button
            style={{
              ...swatch('transparent', false),
              border: '2px dashed var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}
            onClick={() => setShowCustomHex(!showCustomHex)}
            title="Custom hex"
          >
            #
          </button>
        </div>

        {showCustomHex && (
          <div style={hexRow}>
            <input
              style={hexInput_}
              placeholder="#c4b5fd"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleHexSubmit() }}
              maxLength={7}
            />
            <button
              style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 600 }}
              onClick={handleHexSubmit}
            >
              Apply
            </button>
          </div>
        )}

        {customAccent && (
          <button
            style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'left' }}
            onClick={() => { setCustomAccent(null); setHexInput('') }}
          >
            Reset to preset color
          </button>
        )}
      </div>

      {/* ── Weather ── */}
      <div style={section}>
        <div style={sectionLabel}>Weather</div>
        <div style={pillRow}>
          {WEATHER_OPTIONS.map((w) => (
            <button key={w.id} style={pill(activeWeather === w.id)} onClick={() => setWeatherOverride(activeWeather === w.id && weatherOverride !== null ? null : w.id)}>
              {w.icon} {w.label}
            </button>
          ))}
        </div>
        {weatherOverride && (
          <button
            style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'left' }}
            onClick={() => setWeatherOverride(null)}
          >
            Reset to preset weather
          </button>
        )}
      </div>

      {/* ── Animation ── */}
      <div style={section}>
        <div style={sectionLabel}>Animation</div>
        <div style={sliderRow}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', minWidth: 24 }}>Off</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            style={sliderStyle}
          />
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', minWidth: 24, textAlign: 'right' }}>Full</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          {animationSpeed === 0 ? 'Static' : `${Math.round(animationSpeed * 100)}%`}
        </div>
      </div>

      {/* ── Reduced motion ── */}
      <div style={section}>
        <div style={sectionLabel}>Accessibility</div>
        <button style={checkRow} onClick={() => setRespectReducedMotion(!respectReducedMotion)}>
          <span style={{
            ...checkbox,
            background: respectReducedMotion ? 'var(--color-accent)' : 'transparent',
            color: respectReducedMotion ? 'var(--color-bg-base)' : 'transparent',
          }}>
            ✓
          </span>
          <span>Respect reduced-motion preference</span>
        </button>
        {reducedMotionActive && (
          <div style={{ fontSize: 11, color: 'var(--color-warning)', paddingLeft: 24 }}>
            System prefers reduced motion{respectReducedMotion ? ' — animations disabled' : ' — overridden'}
          </div>
        )}
      </div>
    </div>
  )
}
