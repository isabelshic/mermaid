export const diagramTypography = {
  family: "'DM Mono', monospace",
  weight: 400,
  transform: 'uppercase' as const,
  labelSize: '11px',
  letterSpacing: '0.06em',
} as const

export const uiTypography = {
  family: "'Inter', system-ui, -apple-system, sans-serif",
  weight: 400,
  titleWeight: 600,
  transform: 'none' as const,
  letterSpacing: 'normal',
} as const

export const diagramLabelStyle = {
  fontFamily: diagramTypography.family,
  fontWeight: diagramTypography.weight,
  textTransform: diagramTypography.transform,
  fontSize: diagramTypography.labelSize,
  letterSpacing: diagramTypography.letterSpacing,
} as const

export const uiLabelStyle = {
  fontFamily: diagramTypography.family,
  fontWeight: diagramTypography.weight,
  textTransform: diagramTypography.transform,
  letterSpacing: diagramTypography.letterSpacing,
} as const

export const uiTextStyle = {
  fontFamily: uiTypography.family,
  fontWeight: uiTypography.weight,
  textTransform: uiTypography.transform,
  letterSpacing: uiTypography.letterSpacing,
} as const

export const uiTitleStyle = {
  fontFamily: uiTypography.family,
  fontWeight: uiTypography.titleWeight,
  textTransform: uiTypography.transform,
  letterSpacing: '-0.01em',
} as const

/** @deprecated Use uiLabelStyle, uiTextStyle, or diagramLabelStyle */
export const labelStyle = uiLabelStyle

export const typography = diagramTypography
