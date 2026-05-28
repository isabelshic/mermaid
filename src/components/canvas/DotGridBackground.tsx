import { GRID_SIZE } from '../../lib/snap'

export function DotGridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundColor: 'var(--canvas-bg)',
        backgroundImage:
          'radial-gradient(circle, color-mix(in srgb, var(--canvas-grid) var(--canvas-grid-dot-opacity), transparent) var(--canvas-grid-dot-size), transparent var(--canvas-grid-dot-size))',
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
    />
  )
}
