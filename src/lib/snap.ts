import { applyNodeChanges, type Node, type NodeChange } from '@xyflow/react'

export const GRID_SIZE = 8
export const SNAP_THRESHOLD = 4
export const SPACING_SNAP_THRESHOLD = 6

const ASSET_WIDTH = 68
const ASSET_HEIGHT = 88

export type Bounds = {
  x: number
  y: number
  width: number
  height: number
}

export function getNodeSize(node: Node): { width: number; height: number } {
  if (node.type === 'group') {
    return {
      width: Number(node.style?.width ?? 230),
      height: Number(node.style?.height ?? 130),
    }
  }

  return { width: ASSET_WIDTH, height: ASSET_HEIGHT }
}

export function getAbsolutePosition(
  node: Node,
  nodes: Node[],
): { x: number; y: number } {
  let x = node.position.x
  let y = node.position.y
  let parentId = node.parentId

  while (parentId) {
    const parent = nodes.find((entry) => entry.id === parentId)
    if (!parent) break
    x += parent.position.x
    y += parent.position.y
    parentId = parent.parentId
  }

  return { x, y }
}

export function getNodeBounds(node: Node, nodes: Node[]): Bounds {
  const position = getAbsolutePosition(node, nodes)
  const size = getNodeSize(node)

  return {
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
  }
}

/** React Flow requires parent nodes to appear before their children in the array. */
export function reorderNodesForSubflows(nodes: Node[]): Node[] {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const result: Node[] = []
  const added = new Set<string>()

  const addNode = (node: Node) => {
    if (added.has(node.id)) {
      return
    }

    if (node.parentId) {
      const parent = byId.get(node.parentId)
      if (parent) {
        addNode(parent)
      }
    }

    if (!added.has(node.id)) {
      added.add(node.id)
      result.push(node)
    }
  }

  for (const node of nodes) {
    addNode(node)
  }

  return result
}

export function boundsIntersect(a: Bounds, b: Bounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

function trySnapValue(
  value: number,
  targets: number[],
  threshold = SNAP_THRESHOLD,
): number {
  for (const target of targets) {
    if (Math.abs(value - target) <= threshold) {
      return target
    }
  }
  return value
}

function collectAlignmentTargets(
  node: Node,
  nodes: Node[],
): { x: number[]; y: number[] } {
  const xTargets: number[] = []
  const yTargets: number[] = []

  for (const other of nodes) {
    if (other.id === node.id) continue

    const bounds = getNodeBounds(other, nodes)
    xTargets.push(
      bounds.x,
      bounds.x + bounds.width / 2,
      bounds.x + bounds.width,
    )
    yTargets.push(
      bounds.y,
      bounds.y + bounds.height / 2,
      bounds.y + bounds.height,
    )
  }

  return { x: xTargets, y: yTargets }
}

function collectSpacingTargets(
  node: Node,
  nodes: Node[],
  bounds: Bounds,
): { x: number[]; y: number[] } {
  const xTargets: number[] = []
  const yTargets: number[] = []
  const others = nodes.filter((entry) => entry.id !== node.id)

  for (let i = 0; i < others.length; i += 1) {
    for (let j = i + 1; j < others.length; j += 1) {
      const a = getNodeBounds(others[i], nodes)
      const b = getNodeBounds(others[j], nodes)

      if (Math.abs(a.y - b.y) <= SNAP_THRESHOLD) {
        const left = a.x < b.x ? a : b
        const right = a.x < b.x ? b : a
        const gap = right.x - (left.x + left.width)
        if (gap > 0) {
          xTargets.push(right.x + gap)
          xTargets.push(left.x - bounds.width - gap)
        }
      }

      if (Math.abs(a.x - b.x) <= SNAP_THRESHOLD) {
        const top = a.y < b.y ? a : b
        const bottom = a.y < b.y ? b : a
        const gap = bottom.y - (top.y + top.height)
        if (gap > 0) {
          yTargets.push(bottom.y + gap)
          yTargets.push(top.y - bounds.height - gap)
        }
      }
    }
  }

  return { x: xTargets, y: yTargets }
}

export function snapNodePosition(
  node: Node,
  position: { x: number; y: number },
  nodes: Node[],
): { x: number; y: number } {
  const size = getNodeSize(node)
  const absolute = node.parentId
    ? getAbsolutePosition({ ...node, position }, nodes)
    : position

  let x = snapToGrid(absolute.x)
  let y = snapToGrid(absolute.y)

  const alignment = collectAlignmentTargets(node, nodes)
  const draftBounds: Bounds = { x, y, width: size.width, height: size.height }
  const spacing = collectSpacingTargets(node, nodes, draftBounds)

  x = trySnapValue(x, alignment.x)
  x = trySnapValue(x + size.width, alignment.x) - size.width
  x = trySnapValue(x + size.width / 2, alignment.x) - size.width / 2
  x = trySnapValue(x, spacing.x, SPACING_SNAP_THRESHOLD)

  y = trySnapValue(y, alignment.y)
  y = trySnapValue(y + size.height, alignment.y) - size.height
  y = trySnapValue(y + size.height / 2, alignment.y) - size.height / 2
  y = trySnapValue(y, spacing.y, SPACING_SNAP_THRESHOLD)

  if (node.parentId) {
    const parentAbsolute = getAbsolutePosition(
      nodes.find((entry) => entry.id === node.parentId)!,
      nodes,
    )
    return {
      x: x - parentAbsolute.x,
      y: y - parentAbsolute.y,
    }
  }

  return { x, y }
}

/** Apply React Flow changes, then snap any position updates (drag + release). */
export function applyNodeChangesWithSnap(
  changes: NodeChange[],
  nodes: Node[],
): Node[] {
  const next = applyNodeChanges(changes, nodes)
  const positionIds = new Set(
    changes
      .filter((change) => change.type === 'position')
      .map((change) => change.id),
  )

  if (positionIds.size === 0) {
    return next
  }

  return next.map((node) =>
    positionIds.has(node.id) && !node.parentId
      ? {
          ...node,
          position: snapNodePosition(node, node.position, next),
        }
      : node,
  )
}
