export const panelBorderClass = 'border border-[var(--neutral-border)]'
export const panelShadowClass = 'shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
export const panelSurfaceClass = 'bg-white'

export const panelPillClass = [
  panelBorderClass,
  panelSurfaceClass,
  panelShadowClass,
  'rounded-full px-3 py-2',
].join(' ')

export const panelCardClass = [
  panelBorderClass,
  panelSurfaceClass,
  panelShadowClass,
  'rounded-lg px-3 py-3',
].join(' ')

export const panelDividerClass = 'bg-[var(--neutral-divider)]'
export const panelHoverClass = 'hover:bg-[var(--neutral-hover)]'
export const panelActiveClass = 'bg-[var(--theme-blue-fill)]'
export const panelSelectedClass = 'bg-[var(--theme-blue-fill)]'
export const panelInputClass =
  'border border-[var(--neutral-border)] bg-white px-2 py-1.5 font-[family-name:var(--font-ui)] outline-none focus:border-[#0066ff]'

export const panelButtonClass = [
  'cursor-pointer border border-[var(--neutral-border)] bg-transparent px-3 py-2 font-[family-name:var(--font-ui)] transition-colors',
  panelHoverClass,
].join(' ')
