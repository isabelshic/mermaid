import type { Edge, Node } from '@xyflow/react'
import { getAbsolutePosition } from './snap'

export type DiagramClipboard = {
  nodes: Node[]
  edges: Edge[]
}

const PASTE_OFFSET = { x: 24, y: 24 }

function cloneNode(node: Node): Node {
  return {
    ...node,
    data: { ...node.data },
    position: { ...node.position },
    style: node.style ? { ...node.style } : undefined,
    selected: false,
  }
}

function cloneEdge(edge: Edge): Edge {
  return {
    ...edge,
    data: edge.data ? { ...edge.data } : undefined,
    selected: false,
  }
}

function collectNodesForCopy(nodes: Node[], selectedIds: Set<string>): Node[] {
  const included = new Set<string>()

  for (const node of nodes) {
    if (selectedIds.has(node.id)) {
      included.add(node.id)
    }
  }

  let expanded = true
  while (expanded) {
    expanded = false
    for (const node of nodes) {
      if (node.parentId && included.has(node.parentId) && !included.has(node.id)) {
        included.add(node.id)
        expanded = true
      }
    }
  }

  return nodes.filter((node) => included.has(node.id)).map(cloneNode)
}

export function copySelection(
  nodes: Node[],
  edges: Edge[],
  selectedIds: Set<string>,
): DiagramClipboard | null {
  const copiedNodes = collectNodesForCopy(nodes, selectedIds)
  if (copiedNodes.length === 0) {
    return null
  }

  const copiedIds = new Set(copiedNodes.map((node) => node.id))
  const copiedEdges = edges
    .filter(
      (edge) => copiedIds.has(edge.source) && copiedIds.has(edge.target),
    )
    .map(cloneEdge)

  return { nodes: copiedNodes, edges: copiedEdges }
}

function resolvePasteParentId(
  node: Node,
  idMap: Map<string, string>,
  existingNodeIds: Set<string>,
): string | undefined {
  if (!node.parentId) {
    return undefined
  }

  if (idMap.has(node.parentId)) {
    return idMap.get(node.parentId)
  }

  if (existingNodeIds.has(node.parentId)) {
    return node.parentId
  }

  return undefined
}

function resolvePastePosition(
  node: Node,
  parentId: string | undefined,
  canvasNodes: Node[],
): { x: number; y: number } {
  const offset = PASTE_OFFSET

  if (node.parentId && !parentId) {
    const absolute = getAbsolutePosition(node, canvasNodes)
    return {
      x: absolute.x + offset.x,
      y: absolute.y + offset.y,
    }
  }

  return {
    x: node.position.x + offset.x,
    y: node.position.y + offset.y,
  }
}

export function pasteClipboard(
  clipboard: DiagramClipboard,
  nodes: Node[],
  edges: Edge[],
): { nodes: Node[]; edges: Edge[] } {
  const stamp = Date.now()
  const idMap = new Map<string, string>()
  const existingNodeIds = new Set(nodes.map((node) => node.id))

  clipboard.nodes.forEach((node, index) => {
    idMap.set(node.id, `${node.type}-${stamp}-${index}`)
  })

  const pastedNodes = clipboard.nodes.map((node) => {
    const parentId = resolvePasteParentId(node, idMap, existingNodeIds)
    const position = resolvePastePosition(node, parentId, nodes)

    return {
      ...cloneNode(node),
      id: idMap.get(node.id)!,
      parentId,
      extent: parentId ? ('parent' as const) : undefined,
      position,
      selected: true,
    }
  })

  const pastedEdges = clipboard.edges.map((edge, index) => ({
    ...cloneEdge(edge),
    id: `e-${idMap.get(edge.source)}-${idMap.get(edge.target)}-${stamp}-${index}`,
    source: idMap.get(edge.source)!,
    target: idMap.get(edge.target)!,
    selected: true,
  }))

  return {
    nodes: [
      ...nodes.map((node) => ({ ...node, selected: false })),
      ...pastedNodes,
    ],
    edges: [...edges, ...pastedEdges],
  }
}
