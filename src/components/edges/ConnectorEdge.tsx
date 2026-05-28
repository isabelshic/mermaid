import {
  BaseEdge,
  getBezierPath,
  Position,
  useStore,
  type EdgeProps,
} from '@xyflow/react'
import { edge } from '../../tokens/colors'
import {
  applyFanOffset,
  getEdgeDirection,
  getEdgeStrokeStyle,
  getFanOffsetForEdge,
} from '../../lib/edges'

const ARROW_TIP_NUDGE = 3
const BEZIER_CURVATURE = 0.25

function calculateControlOffset(distance: number, curvature: number) {
  if (distance >= 0) {
    return 0.5 * distance
  }
  return curvature * 25 * Math.sqrt(-distance)
}

function getControlWithCurvature({
  pos,
  x1,
  y1,
  x2,
  y2,
  c = BEZIER_CURVATURE,
}: {
  pos: Position
  x1: number
  y1: number
  x2: number
  y2: number
  c?: number
}) {
  switch (pos) {
    case Position.Left:
      return [x1 - calculateControlOffset(x1 - x2, c), y1]
    case Position.Right:
      return [x1 + calculateControlOffset(x2 - x1, c), y1]
    case Position.Top:
      return [x1, y1 - calculateControlOffset(y1 - y2, c)]
    case Position.Bottom:
      return [x1, y1 + calculateControlOffset(y2 - y1, c)]
  }
}

/** Tip on the path at the handle, pointing into the node. */
function getArrowAtHandle(
  handleX: number,
  handleY: number,
  controlX: number,
  controlY: number,
) {
  const dx = handleX - controlX
  const dy = handleY - controlY
  const length = Math.hypot(dx, dy) || 1

  return {
    x: handleX - (dx / length) * ARROW_TIP_NUDGE,
    y: handleY - (dy / length) * ARROW_TIP_NUDGE,
    angle: Math.atan2(dy, dx),
  }
}

function ChevronArrowhead({
  x,
  y,
  angle,
  stroke,
}: {
  x: number
  y: number
  angle: number
  stroke: string
}) {
  const degrees = (angle * 180) / Math.PI

  return (
    <g transform={`translate(${x}, ${y}) rotate(${degrees})`}>
      <path
        d="M -5 -3 L 0 0 L -5 3"
        fill="none"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}

export function ConnectorEdge({
  id,
  data,
  source,
  target,
  sourceHandleId,
  targetHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  style,
}: EdgeProps) {
  const edges = useStore((state) => state.edges)

  const sourceFan = getFanOffsetForEdge(
    edges,
    id,
    'source',
    source,
    sourceHandleId,
    sourcePosition,
  )
  const targetFan = getFanOffsetForEdge(
    edges,
    id,
    'target',
    target,
    targetHandleId,
    targetPosition,
  )

  const fannedSource = applyFanOffset(sourceX, sourceY, sourcePosition, sourceFan)
  const fannedTarget = applyFanOffset(targetX, targetY, targetPosition, targetFan)

  const [sourceControlX, sourceControlY] = getControlWithCurvature({
    pos: sourcePosition,
    x1: fannedSource.x,
    y1: fannedSource.y,
    x2: fannedTarget.x,
    y2: fannedTarget.y,
  })
  const [targetControlX, targetControlY] = getControlWithCurvature({
    pos: targetPosition,
    x1: fannedTarget.x,
    y1: fannedTarget.y,
    x2: fannedSource.x,
    y2: fannedSource.y,
  })

  const strokeStyle = getEdgeStrokeStyle(data)
  const direction = getEdgeDirection(data)
  const strokeColor = selected ? edge.selected : edge.default
  const strokeWidth = selected ? 2 : 1
  const showTargetArrow = direction !== 'none'
  const showSourceArrow = direction === 'both'

  const targetArrow = showTargetArrow
    ? getArrowAtHandle(
        fannedTarget.x,
        fannedTarget.y,
        targetControlX,
        targetControlY,
      )
    : null

  const sourceArrow = showSourceArrow
    ? getArrowAtHandle(
        fannedSource.x,
        fannedSource.y,
        sourceControlX,
        sourceControlY,
      )
    : null

  const pathSourceX = sourceArrow?.x ?? fannedSource.x
  const pathSourceY = sourceArrow?.y ?? fannedSource.y
  const pathTargetX = targetArrow?.x ?? fannedTarget.x
  const pathTargetY = targetArrow?.y ?? fannedTarget.y

  const [edgePath] = getBezierPath({
    sourceX: pathSourceX,
    sourceY: pathSourceY,
    targetX: pathTargetX,
    targetY: pathTargetY,
    sourcePosition,
    targetPosition,
    curvature: BEZIER_CURVATURE,
  })

  return (
    <>
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke={edge.selected}
          strokeWidth={8}
          strokeOpacity={0.2}
          strokeLinecap="round"
        />
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: strokeStyle === 'dashed' ? '6 4' : undefined,
          ...style,
        }}
      />
      {sourceArrow && (
        <ChevronArrowhead
          x={sourceArrow.x}
          y={sourceArrow.y}
          angle={sourceArrow.angle}
          stroke={strokeColor}
        />
      )}
      {targetArrow && (
        <ChevronArrowhead
          x={targetArrow.x}
          y={targetArrow.y}
          angle={targetArrow.angle}
          stroke={strokeColor}
        />
      )}
    </>
  )
}
