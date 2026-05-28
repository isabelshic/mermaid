import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import {
  applyEdgeChanges,
  type Edge,
  type EdgeChange,
} from '@xyflow/react'
import { normalizeBidirectionalEdges } from './edges'

function normalizeNext(
  updater: SetStateAction<Edge[]>,
  current: Edge[],
): Edge[] {
  const next = typeof updater === 'function' ? updater(current) : updater
  return normalizeBidirectionalEdges(next)
}

export function useNormalizedEdgesState(
  initialEdges: Edge[],
): [Edge[], Dispatch<SetStateAction<Edge[]>>, (changes: EdgeChange[]) => void] {
  const [edges, setEdgesState] = useState(() =>
    normalizeBidirectionalEdges(initialEdges),
  )

  const setEdges = useCallback((updater: SetStateAction<Edge[]>) => {
    setEdgesState((current) => normalizeNext(updater, current))
  }, [])

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdgesState((current) =>
      normalizeBidirectionalEdges(applyEdgeChanges(changes, current)),
    )
  }, [])

  return [edges, setEdges, onEdgesChange]
}

export function hasReverseEdge(
  edges: Edge[],
  edgeId: string,
  source: string,
  target: string,
): boolean {
  return edges.some(
    (edge) =>
      edge.id !== edgeId &&
      edge.source === target &&
      edge.target === source,
  )
}

export function isEdgeBidirectional(
  edges: Edge[],
  edge: Pick<Edge, 'id' | 'source' | 'target' | 'data'>,
): boolean {
  return (
    (edge.data as { bidirectional?: boolean } | undefined)?.bidirectional ===
      true || hasReverseEdge(edges, edge.id, edge.source, edge.target)
  )
}
