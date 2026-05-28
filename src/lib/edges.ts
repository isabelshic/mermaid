import {
  MarkerType,
  addEdge,
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
