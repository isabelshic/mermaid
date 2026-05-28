import { useCallback, useEffect, useRef } from 'react'
import {
  useNodesState,
  type Edge,
  type EdgeChange,
  type Node,
  type OnNodesChange,
} from '@xyflow/react'
import { applyNodeChangesWithSnap } from '../lib/snap'
import { useNormalizedEdgesState } from '../lib/useNormalizedEdgesState'

type DiagramSnapshot = {
  nodes: Node[]
  edges: Edge[]
}

const MAX_HISTORY = 50

function cloneSnapshot(nodes: Node[], edges: Edge[]): DiagramSnapshot {
  return {
    nodes: nodes.map((node) => ({
      ...node,
      data: { ...node.data },
      position: { ...node.position },
      style: node.style ? { ...node.style } : undefined,
    })),
    edges: edges.map((edge) => ({
      ...edge,
      data: edge.data ? { ...edge.data } : undefined,
    })),
  }
}

function shouldRecordNodeChanges(changes: Parameters<OnNodesChange>[0]): boolean {
  return changes.some((change) => {
    if (change.type === 'select') {
      return false
    }
    if (change.type === 'position') {
      return !change.dragging
    }
    return true
  })
}

function shouldRecordEdgeChanges(changes: EdgeChange[]): boolean {
  return changes.some((change) => change.type !== 'select')
}

export function useDiagramHistory(
  initialNodes: Node[],
  initialEdges: Edge[],
) {
  const [nodes, setNodes] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeBase] =
    useNormalizedEdgesState(initialEdges)

  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  const pastRef = useRef<DiagramSnapshot[]>([])
  const futureRef = useRef<DiagramSnapshot[]>([])
  const isUndoRedoRef = useRef(false)

  useEffect(() => {
    nodesRef.current = nodes
    edgesRef.current = edges
  }, [nodes, edges])

  const pushHistory = useCallback(() => {
    if (isUndoRedoRef.current) {
      return
    }

    const snapshot = cloneSnapshot(nodesRef.current, edgesRef.current)
    pastRef.current.push(snapshot)
    if (pastRef.current.length > MAX_HISTORY) {
      pastRef.current.shift()
    }
    futureRef.current = []
  }, [])

  const restoreSnapshot = useCallback(
    (snapshot: DiagramSnapshot) => {
      isUndoRedoRef.current = true
      setNodes(snapshot.nodes)
      setEdges(snapshot.edges)
      queueMicrotask(() => {
        isUndoRedoRef.current = false
      })
    },
    [setNodes, setEdges],
  )

  const undo = useCallback(() => {
    const past = pastRef.current
    if (past.length === 0) {
      return false
    }

    futureRef.current.push(
      cloneSnapshot(nodesRef.current, edgesRef.current),
    )
    restoreSnapshot(past.pop()!)
    return true
  }, [restoreSnapshot])

  const redo = useCallback(() => {
    const future = futureRef.current
    if (future.length === 0) {
      return false
    }

    pastRef.current.push(cloneSnapshot(nodesRef.current, edgesRef.current))
    restoreSnapshot(future.pop()!)
    return true
  }, [restoreSnapshot])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (shouldRecordNodeChanges(changes)) {
        pushHistory()
      }
      setNodes((current) => applyNodeChangesWithSnap(changes, current))
    },
    [pushHistory, setNodes],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (shouldRecordEdgeChanges(changes)) {
        pushHistory()
      }
      onEdgesChangeBase(changes)
    },
    [onEdgesChangeBase, pushHistory],
  )

  const mutateNodes = useCallback(
    (updater: (current: Node[]) => Node[]) => {
      pushHistory()
      setNodes(updater)
    },
    [pushHistory, setNodes],
  )

  const mutateEdges = useCallback(
    (updater: (current: Edge[]) => Edge[]) => {
      pushHistory()
      setEdges(updater)
    },
    [pushHistory, setEdges],
  )

  const replaceDiagram = useCallback(
    (nextNodes: Node[], nextEdges: Edge[]) => {
      pushHistory()
      setNodes(nextNodes)
      setEdges(nextEdges)
    },
    [pushHistory, setNodes, setEdges],
  )

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    pushHistory,
    mutateNodes,
    mutateEdges,
    replaceDiagram,
    undo,
    redo,
  }
}
