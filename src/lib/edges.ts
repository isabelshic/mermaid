import {
  MarkerType,
  addEdge,
  Position,
  type Connection,
  type Edge,
} from '@xyflow/react'
import { edge as edgeColor } from '../tokens/colors'
import type { EdgeDirection, EdgeStrokeStyle } from '../types/diagram'

type ConnectorEdgeData = {
  strokeStyle?: EdgeStrokeStyle
  direction?: EdgeDirection
  bidirectional?: boolean
}

export const CONNECTOR_ARROW_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 12,
  height: 12,
  color: edgeColor.default,
}

export const EDGE_FAN_OFFSET_PX = 10

const DEFAULT_SLOT_BY_POSITION: Record<Position, string> = {
  [Position.Top]: 'top',
  [Position.Bottom]: 'bottom',
  [Position.Left]: 'left',
  [Position.Right]: 'right',
}

/** One fan-out group per physical slot (e.g. top-left ≠ top). */
export function normalizeSlotId(
  handleId: string | null | undefined,
  position: Position,
): string {
  if (!handleId) {
    return DEFAULT_SLOT_BY_POSITION[position] ?? position
  }

  return handleId
}

export function getEdgeHandleId(
  edge: Edge,
  role: 'source' | 'target',
): string | null | undefined {
  if (role === 'source') {
    return edge.sourceHandle
  }
  return edge.targetHandle
}

export function getFanOffsetForEdge(
  edges: Edge[],
  edgeId: string,
  role: 'source' | 'target',
  nodeId: string,
  handleId: string | null | undefined,
  position: Position,
  spreadPx = EDGE_FAN_OFFSET_PX,
): number {
  const slot = normalizeSlotId(handleId, position)
  const peers = edges
    .filter((edge) => {
      const onNode =
        role === 'source' ? edge.source === nodeId : edge.target === nodeId
      if (!onNode) return false

      const peerHandle = getEdgeHandleId(edge, role)
      return normalizeSlotId(peerHandle, position) === slot
    })
    .sort((a, b) => a.id.localeCompare(b.id))

  if (peers.length <= 1) {
    return 0
  }

  const index = peers.findIndex((edge) => edge.id === edgeId)
  if (index < 0) {
    return 0
  }

  return (index - (peers.length - 1) / 2) * spreadPx
}

export function applyFanOffset(
  x: number,
  y: number,
  position: Position,
  offset: number,
): { x: number; y: number } {
  if (offset === 0) {
    return { x, y }
  }

  switch (position) {
    case Position.Left:
    case Position.Right:
      return { x, y: y + offset }
    case Position.Top:
    case Position.Bottom:
      return { x: x + offset, y }
    default:
      return { x, y }
  }
}

export function getEdgeData(edge: Edge): ConnectorEdgeData {
  return (edge.data as ConnectorEdgeData | undefined) ?? {}
}

function edgeDataWithDirection(
  data: ConnectorEdgeData,
  direction: EdgeDirection,
): ConnectorEdgeData {
  return {
    ...data,
    direction,
    bidirectional: direction === 'both',
  }
}

export function getEdgeDirection(data: Edge['data']): EdgeDirection {
  const edgeData = getEdgeData({ data } as Edge)
  if (edgeData.direction) {
    return edgeData.direction
  }
  return edgeData.bidirectional ? 'both' : 'one-way'
}

export function withConnectorDirection(
  edge: Edge,
  direction: EdgeDirection,
): Edge {
  return {
    ...edge,
    markerEnd: direction !== 'none' ? CONNECTOR_ARROW_MARKER : undefined,
    markerStart: direction === 'both' ? CONNECTOR_ARROW_MARKER : undefined,
    data: edgeDataWithDirection(getEdgeData(edge), direction),
  }
}

export function createConnectorEdge(
  connection: Connection,
  strokeStyle: EdgeStrokeStyle = 'dashed',
  direction: EdgeDirection = 'one-way',
): Edge {
  return withConnectorDirection(
    {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle ?? null,
      targetHandle: connection.targetHandle ?? null,
      type: 'connector',
      data: { strokeStyle, direction },
    },
    direction,
  )
}

function findEdge(
  edges: Edge[],
  source: string,
  target: string,
): Edge | undefined {
  return edges.find((edge) => edge.source === source && edge.target === target)
}

export function normalizeBidirectionalEdges(edges: Edge[]): Edge[] {
  const consumed = new Set<string>()
  const normalized: Edge[] = []

  for (const edge of edges) {
    if (consumed.has(edge.id)) {
      continue
    }

    const reverseEdge = edges.find(
      (candidate) =>
        candidate.id !== edge.id &&
        !consumed.has(candidate.id) &&
        candidate.source === edge.target &&
        candidate.target === edge.source,
    )

    if (reverseEdge) {
      consumed.add(reverseEdge.id)
      normalized.push(
        withConnectorDirection(
          {
            ...edge,
            data: {
              ...getEdgeData(edge),
              strokeStyle:
                getEdgeData(reverseEdge).strokeStyle ??
                getEdgeData(edge).strokeStyle ??
                'dashed',
            },
          },
          'both',
        ),
      )
      continue
    }

    normalized.push(
      withConnectorDirection(edge, getEdgeDirection(edge.data)),
    )
  }

  return normalized
}

export function appendEdge(
  edges: Edge[],
  connection: Connection,
  strokeStyle: EdgeStrokeStyle = 'dashed',
  direction: EdgeDirection = 'one-way',
): Edge[] {
  const source = connection.source!
  const target = connection.target!

  const existingSameDirection = findEdge(edges, source, target)

  if (existingSameDirection) {
    // Dragging "back" along an existing line often produces the same source/target
    // again (e.g. B target → A source still registers as A → B). Treat as bidirectional.
    return normalizeBidirectionalEdges(
      edges.map((edge) =>
        edge.id === existingSameDirection.id
          ? withConnectorDirection(
              {
                ...edge,
                data: {
                  ...getEdgeData(edge),
                  strokeStyle,
                },
              },
              'both',
            )
          : edge,
      ),
    )
  }

  const reverseEdge = findEdge(edges, target, source)

  if (reverseEdge) {
    return normalizeBidirectionalEdges(
      edges.map((edge) =>
        edge.id === reverseEdge.id
          ? withConnectorDirection(
              {
                ...edge,
                data: {
                  ...getEdgeData(edge),
                  strokeStyle,
                },
              },
              'both',
            )
          : edge,
      ),
    )
  }

  return normalizeBidirectionalEdges(
    addEdge(createConnectorEdge(connection, strokeStyle, direction), edges),
  )
}

export function getEdgeStrokeStyle(data: Edge['data']): EdgeStrokeStyle {
  return getEdgeData({ data } as Edge).strokeStyle ?? 'dashed'
}

export function isBidirectionalEdge(data: Edge['data']): boolean {
  return getEdgeDirection(data) === 'both'
}

export function setEdgeDirection(
  edges: Edge[],
  edgeIds: Set<string>,
  direction: EdgeDirection,
): Edge[] {
  return normalizeBidirectionalEdges(
    edges.map((edge) =>
      edgeIds.has(edge.id)
        ? withConnectorDirection(edge, direction)
        : edge,
    ),
  )
}
