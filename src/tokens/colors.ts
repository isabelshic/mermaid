export type ThemeName = 'blue' | 'green' | 'magenta'

export const neutral = {
  canvas: '#F6F7F9',
  grid: '#C4C9D0',
  hover: '#EBEDF0',
  active: '#E4E7EB',
  border: '#DFE2E7',
  divider: '#D5D9DF',
  edge: '#A8ADB5',
  text: '#2E3238',
  textMuted: '#5C6370',
  textSubtle: '#7A818C',
  textFaint: '#949AA3',
  textDisabled: '#A3A9B2',
} as const

export const canvas = {
  bg: neutral.canvas,
  grid: neutral.grid,
} as const

export const themes: Record<
  ThemeName,
  { color: string; fill: string; label: string }
> = {
  blue: {
    color: '#0066FF',
    fill: 'rgba(0, 102, 255, 0.1)',
    label: 'Blue',
  },
  green: {
    color: '#00D084',
    fill: 'rgba(0, 208, 132, 0.1)',
    label: 'Green',
  },
  magenta: {
    color: '#E6007A',
    fill: 'rgba(230, 0, 122, 0.1)',
    label: 'Magenta',
  },
}

export const edge = {
  default: neutral.edge,
  selected: themes.blue.color,
} as const

export const cssVariables = {
  '--canvas-bg': canvas.bg,
  '--canvas-grid': canvas.grid,
  '--neutral-hover': neutral.hover,
  '--neutral-active': neutral.active,
  '--neutral-border': neutral.border,
  '--neutral-divider': neutral.divider,
  '--neutral-text': neutral.text,
  '--neutral-text-muted': neutral.textMuted,
  '--neutral-text-subtle': neutral.textSubtle,
  '--neutral-text-faint': neutral.textFaint,
  '--theme-blue': themes.blue.color,
  '--theme-blue-fill': themes.blue.fill,
  '--theme-green': themes.green.color,
  '--theme-green-fill': themes.green.fill,
  '--theme-magenta': themes.magenta.color,
  '--theme-magenta-fill': themes.magenta.fill,
  '--edge-default': edge.default,
} as const
