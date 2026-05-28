import { useReactFlow } from '@xyflow/react'
import { themes, type ThemeName } from '../../tokens/colors'
import { boundsFromDragCorners } from '../../lib/groupBounds'

type GroupPlacementPreviewProps = {
  anchor: { x: number; y: number }
  current: { x: number; y: number }
  theme: ThemeName
}

export function GroupPlacementPreview({
  anchor,
  current,
  theme,
}: GroupPlacementPreviewProps) {
  const { flowToScreenPosition } = useReactFlow()
  const palette = themes[theme]
  const bounds = boundsFromDragCorners(anchor, current)

  const topLeft = flowToScreenPosition(bounds.position)
  const bottomRight = flowToScreenPosition({
    x: bounds.position.x + bounds.size.width,
    y: bounds.position.y + bounds.size.height,
  })

  const width = Math.max(0, bottomRight.x - topLeft.x)
  const height = Math.max(0, bottomRight.y - topLeft.y)

  return (
    <div
      className="pointer-events-none absolute z-30 border border-dashed"
      style={{
        left: topLeft.x,
        top: topLeft.y,
        width,
        height,
        borderColor: palette.color,
        backgroundColor: palette.fill,
      }}
      aria-hidden="true"
    />
  )
}
