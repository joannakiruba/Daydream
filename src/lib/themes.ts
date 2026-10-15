export interface ScenePalette {
  wall: string
  wallHi: string
  floor: string
  floorHi: string
  wood: string
  woodLt: string
  accent: string
  accentDim: string
  blanket: string
  pillow: string
  sky: string
  skyRain: string
  rug1: string
  rug2: string
}

export interface UITokens {
  bgBase: string
  bgRaised: string
  bgOverlay: string
  bgHover: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  accent: string
  accentDim: string
  accentGlow: string
  success: string
  warning: string
  danger: string
  border: string
  borderFocus: string
}

export type WeatherId = 'clear' | 'rain' | 'snow'
export type SeasonId = 'default' | 'spring' | 'summer' | 'autumn' | 'winter'

export interface ThemePreset {
  id: string
  name: string
  season: SeasonId
  scene: ScenePalette
  ui: UITokens
  weather: WeatherId
  animationSpeed: number
}

/* ── Scene palettes ── */

const bedroomScene: ScenePalette = {
  wall: '#252038', wallHi: '#2d2842',
  floor: '#2e2848', floorHi: '#362f52',
  wood: '#3a3450', woodLt: '#4a4065',
  accent: '#c4b5fd', accentDim: '#8b7cc8',
  blanket: '#c4b5fd', pillow: '#ddd6fe',
  sky: '#1e2540', skyRain: '#283050',
  rug1: 'rgba(196,181,253,0.08)', rug2: 'rgba(196,181,253,0.04)',
}

const sunsetScene: ScenePalette = {
  wall: '#2a2030', wallHi: '#352838',
  floor: '#302028', floorHi: '#3d2830',
  wood: '#3e2e38', woodLt: '#504050',
  accent: '#f0a878', accentDim: '#c87850',
  blanket: '#f0a878', pillow: '#fcd8b8',
  sky: '#c06030', skyRain: '#704030',
  rug1: 'rgba(240,168,120,0.08)', rug2: 'rgba(240,168,120,0.04)',
}

const midnightScene: ScenePalette = {
  wall: '#10101e', wallHi: '#181828',
  floor: '#141420', floorHi: '#1c1c30',
  wood: '#1e1e32', woodLt: '#2a2a42',
  accent: '#7888c0', accentDim: '#506090',
  blanket: '#7888c0', pillow: '#a0b0d8',
  sky: '#080818', skyRain: '#101028',
  rug1: 'rgba(120,136,192,0.08)', rug2: 'rgba(120,136,192,0.04)',
}

/* ── Spring / Summer / Autumn / Winter palettes ── */

const springScene: ScenePalette = {
  wall: '#202830', wallHi: '#283038',
  floor: '#243028', floorHi: '#2c3830',
  wood: '#304028', woodLt: '#405030',
  accent: '#90d890', accentDim: '#60a060',
  blanket: '#b8e8b0', pillow: '#d0f0c8',
  sky: '#304060', skyRain: '#283848',
  rug1: 'rgba(144,216,144,0.08)', rug2: 'rgba(144,216,144,0.04)',
}

const summerScene: ScenePalette = {
  wall: '#282030', wallHi: '#302838',
  floor: '#302838', floorHi: '#383040',
  wood: '#3a3040', woodLt: '#4a4050',
  accent: '#e8a0d0', accentDim: '#b870a0',
  blanket: '#e8a0d0', pillow: '#f0c8e0',
  sky: '#283058', skyRain: '#202848',
  rug1: 'rgba(232,160,208,0.08)', rug2: 'rgba(232,160,208,0.04)',
}

const autumnScene: ScenePalette = {
  wall: '#282018', wallHi: '#302820',
  floor: '#2a2018', floorHi: '#342820',
  wood: '#3c3020', woodLt: '#4e4030',
  accent: '#e0a050', accentDim: '#b07830',
  blanket: '#e0a050', pillow: '#f0c888',
  sky: '#302018', skyRain: '#282018',
  rug1: 'rgba(224,160,80,0.08)', rug2: 'rgba(224,160,80,0.04)',
}

const winterScene: ScenePalette = {
  wall: '#181828', wallHi: '#202030',
  floor: '#1c1c30', floorHi: '#242438',
  wood: '#282840', woodLt: '#383850',
  accent: '#a0c8e8', accentDim: '#6898c0',
  blanket: '#a0c8e8', pillow: '#c8e0f0',
  sky: '#101020', skyRain: '#181830',
  rug1: 'rgba(160,200,232,0.08)', rug2: 'rgba(160,200,232,0.04)',
}

/* ── UI token sets ── */

const defaultUI: UITokens = {
  bgBase: '#1e1a2a', bgRaised: '#262233', bgOverlay: '#2e2940', bgHover: '#36304d',
  textPrimary: '#e2dff0', textSecondary: '#9e97b8', textMuted: '#6b6484',
  accent: '#c4b5fd', accentDim: '#8b7cc8', accentGlow: 'rgba(196,181,253,0.15)',
  success: '#86d9a0', warning: '#f0d08c', danger: '#f0918c',
  border: 'rgba(255,255,255,0.06)', borderFocus: 'rgba(196,181,253,0.4)',
}

function uiFromAccent(hex: string, dim: string, glow: string): UITokens {
  return { ...defaultUI, accent: hex, accentDim: dim, accentGlow: glow, borderFocus: `${hex}66` }
}

const sunsetUI = uiFromAccent('#f0a878', '#c87850', 'rgba(240,168,120,0.15)')
const midnightUI: UITokens = {
  bgBase: '#0c0c18', bgRaised: '#141420', bgOverlay: '#1c1c2e', bgHover: '#242440',
  textPrimary: '#c8c8e0', textSecondary: '#8888a8', textMuted: '#505070',
  accent: '#7888c0', accentDim: '#506090', accentGlow: 'rgba(120,136,192,0.15)',
  success: '#68b080', warning: '#c8a868', danger: '#c87070',
  border: 'rgba(255,255,255,0.04)', borderFocus: 'rgba(120,136,192,0.4)',
}

const springUI = uiFromAccent('#90d890', '#60a060', 'rgba(144,216,144,0.15)')
const summerUI = uiFromAccent('#e8a0d0', '#b870a0', 'rgba(232,160,208,0.15)')
const autumnUI: UITokens = {
  bgBase: '#1c1810', bgRaised: '#242018', bgOverlay: '#2e2820', bgHover: '#382e28',
  textPrimary: '#e8e0d0', textSecondary: '#b0a890', textMuted: '#706848',
  accent: '#e0a050', accentDim: '#b07830', accentGlow: 'rgba(224,160,80,0.15)',
  success: '#90c870', warning: '#e0c060', danger: '#d08060',
  border: 'rgba(255,255,255,0.05)', borderFocus: 'rgba(224,160,80,0.4)',
}
const winterUI: UITokens = {
  bgBase: '#101018', bgRaised: '#181820', bgOverlay: '#20202e', bgHover: '#282840',
  textPrimary: '#d8e0f0', textSecondary: '#90a0b8', textMuted: '#506078',
  accent: '#a0c8e8', accentDim: '#6898c0', accentGlow: 'rgba(160,200,232,0.15)',
  success: '#70c0a0', warning: '#c8b870', danger: '#c88080',
  border: 'rgba(255,255,255,0.04)', borderFocus: 'rgba(160,200,232,0.4)',
}

/* ── Presets ── */

export const PRESETS: ThemePreset[] = [
  { id: 'rainy-bedroom', name: 'Rainy Bedroom', season: 'default', scene: bedroomScene, ui: defaultUI, weather: 'rain', animationSpeed: 1 },
  { id: 'sunset-room', name: 'Warm Sunset', season: 'default', scene: sunsetScene, ui: sunsetUI, weather: 'clear', animationSpeed: 1 },
  { id: 'midnight-study', name: 'Midnight Study', season: 'default', scene: midnightScene, ui: midnightUI, weather: 'clear', animationSpeed: 0.6 },
  { id: 'spring-morning', name: 'Spring Morning', season: 'spring', scene: springScene, ui: springUI, weather: 'rain', animationSpeed: 1 },
  { id: 'summer-dusk', name: 'Summer Dusk', season: 'summer', scene: summerScene, ui: summerUI, weather: 'clear', animationSpeed: 1 },
  { id: 'autumn-cozy', name: 'Autumn Cozy', season: 'autumn', scene: autumnScene, ui: autumnUI, weather: 'clear', animationSpeed: 0.8 },
  { id: 'winter-frost', name: 'Winter Frost', season: 'winter', scene: winterScene, ui: winterUI, weather: 'snow', animationSpeed: 0.7 },
]

export function getPreset(id: string): ThemePreset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0]
}

/* ── Apply UI tokens to :root CSS custom properties ── */

export function applyUITokens(tokens: UITokens) {
  const root = document.documentElement.style
  root.setProperty('--color-bg-base', tokens.bgBase)
  root.setProperty('--color-bg-raised', tokens.bgRaised)
  root.setProperty('--color-bg-overlay', tokens.bgOverlay)
  root.setProperty('--color-bg-hover', tokens.bgHover)
  root.setProperty('--color-text-primary', tokens.textPrimary)
  root.setProperty('--color-text-secondary', tokens.textSecondary)
  root.setProperty('--color-text-muted', tokens.textMuted)
  root.setProperty('--color-accent', tokens.accent)
  root.setProperty('--color-accent-dim', tokens.accentDim)
  root.setProperty('--color-accent-glow', tokens.accentGlow)
  root.setProperty('--color-success', tokens.success)
  root.setProperty('--color-warning', tokens.warning)
  root.setProperty('--color-danger', tokens.danger)
  root.setProperty('--color-border', tokens.border)
  root.setProperty('--color-border-focus', tokens.borderFocus)
}

export function buildUIOverrides(base: UITokens, customAccent: string | null): UITokens {
  if (!customAccent) return base
  const dim = blendColor(customAccent, '#000000', 0.35)
  const glow = hexToRgba(customAccent, 0.15)
  return { ...base, accent: customAccent, accentDim: dim, accentGlow: glow, borderFocus: hexToRgba(customAccent, 0.4) }
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function blendColor(hex1: string, hex2: string, ratio: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16)
  const b1 = parseInt(hex1.slice(5, 7), 16)
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)
  const r = Math.round(r1 + (r2 - r1) * ratio)
  const g = Math.round(g1 + (g2 - g1) * ratio)
  const b = Math.round(b1 + (b2 - b1) * ratio)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
