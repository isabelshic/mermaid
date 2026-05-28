import {
  BaseEdge,
  getBezierPath,
  Position,
  type EdgeProps,
} from '@xyflow/react'
import { edge } from '../../tokens/colors'
import { getEdgeDirection, getEdgeStrokeStyle } from '../../lib/edges'

const ARROW_INSET = 8
const BEZIER_CURVATURE = 0.25

function calculateControlOffset(distance: number, curvature: number) {
  if (distance >= 0) {
    return 0.5 * distance
  }
  return curvature * 25 * Math.sqrt(-distance)
}

function getBezierControlPoint({
  position,
  x,
  y,
  towardX,
  towardY,
  curvature = BEZIER_CURVATURE,
}: {
  position: Position
  x: number
  y: number
  towardX: number
  towardY: number
  curvature?: number
}) {
  switch (position) {
    case Position.Left:
      return {
        x: x - calculateControlOffset(x - towardX, curvature),
        y,
      }
    case Position.Right:
      return {
        x: x + calculateControlOffset(towardX - x, curvature),
        y,
      }
    case Position.Top:
      return {
        x,
        y: y - calculateControlOffset(y - towardY, curvature),
      }
    case Position.Bottom:
      return {
        x,
        y: y + calculateControlOffset(towardY - y, curvature),
      }
  }
}

function offsetToward(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  distance: number,
) {
  const dx = toX - fromX
  const dy = toY - fromY
  const length = Math.hypot(dx, dy) || 1

  return {
    x: fromX + (dx / length) * distance,
    y: fromY + (dy / length) * distance,
  }
}

function getArrowInset(sourceX: number, sourceY: number, targetX: number, targetY: number) {
  const length = Math.hypot(targetX - sourceX, targetY - sourceY)
  return Math.min(ARROW_INSET, Math.max(0, length / 2 - 2))
}

function ChevronArrowhead({
  x,
  y,
  angle,
}: {
  x: number
  y: number
  angle: number
}) {
  const degrees = (angle * 180) / Math.PI

  return (
    <g transform={`translate(${x}, ${y}) rotate(${degrees})`}>
      <path
        d="M -5 -3 L 0 0 L -5 3"
        fill="none"
        stroke={edge.default}
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
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
}: EdgeProps) {
  const strokeStyle = getEdgeStrokeStyle(data)
  const direction = getEdgeDirection(data)
  const showTargetArrow = direction !== 'none'
  const showSourceArrow = direction === 'both'

  const endInset = showTargetArrow
    ? getArrowInset(sourceX, sourceY, targetX, targetY)
    : 0
  const startInset = showSourceArrow
    ? getArrowInset(sourceX, sourceY, targetX, targetY)
    : 0

  const lineStart = offsetToward(
    sourceX,
    sourceY,
    targetX,
    targetY,
    startInset,
  )
  const lineEnd = offsetToward(
    targetX,
    targetY,
    sourceX,
    sourceY,
    endInset,
  )

  const [edgePath] = getBezierPath({
    sourceX: lineStart.x,
    sourceY: lineStart.y,
    targetX: lineEnd.x,
    targetY: lineEnd.y,
    sourcePosition,
    targetPosition,
    curvature: BEZIER_CURVATURE,
  })

  const sourceControl = getBezierControlPoint({
    position: sourcePosition,
    x: lineStart.x,
    y: lineStart.y,
    towardX: lineEnd.x,
    towardY: lineEnd.y,
  })
  const targetControl = getBezierControlPoint({
    position: targetPosition,
    x: lineEnd.x,
    y: lineEnd.y,
    towardX: lineStart.x,
    towardY: lineStart.y,
  })

  const targetArrowAngle = Math.atan2(
    lineEnd.y - targetControl.y,
    lineEnd.x - targetControl.x,
  )
  const sourceArrowAngle = Math.atan2(
    lineStart.y - sourceControl.y,
    lineStart.x - sourceControl.x,
  )

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edge.default,
          strokeWidth: 1,
          strokeDasharray: strokeStyle === 'dashed' ? '6 4' : undefined,
          ...style,
        }}
      />
      {showSourceArrow && (
        <ChevronArrowhead
          x={lineStart.x}
          y={lineStart.y}
          angle={sourceArrowAngle}
        />
      )}
      {showTargetArrow && (
        <ChevronArrowhead
          x={lineEnd.x}
          y={lineEnd.y}
          angle={targetArrowAngle}
        />
      )}
    </>
  )
}
