import type { Node } from '@xyflow/react'
import type { ThemeName } from '../tokens/colors'
import type { IconName } from './icons'
import {
  DEFAULT_GROUP_HEIGHT,
  DEFAULT_GROUP_WIDTH,
  type GroupSize,
} from './groupBounds'
import {
  boundsIntersect,
  getAbsolutePosition,
  getNodeBounds,
  reorderNodesForSubflows,
} from './snap'

const GROUP_PADDING_X = 35
const GROUP_PADDING_Y = 48

export function createGroupFromSelection(
  nodes: Node[],
  selectedIds: string[],
  theme: ThemeName,
  label = 'GROUP',
): Node[] {
  const selectedAssets = nodes.filter(
    (node) =>
      selectedIds.includes(node.id) &&
      node.type === 'asset' &&
      !node.parentId,
  )

  if (selectedAssets.length === 0) {
    return nodes
  }

  const boundsList = selectedAssets.map((node) => getNodeBounds(node, nodes))
  const minX = Math.min(...boundsList.map((bounds) => bounds.x))
  const minY = Math.min(...boundsList.map((bounds) => bounds.y))
  const maxX = Math.max(...boundsList.map((bounds) => bounds.x + bounds.width))
  const maxY = Math.max(
    ...boundsList.map((bounds) => bounds.y + bounds.height),
  )

  const groupId = `group-${Date.now()}`
  const groupPosition = {
    x: minX - GROUP_PADDING_X,
    y: minY - GROUP_PADDING_Y,
  }

  const groupNode: Node = {
    id: groupId,
    type: 'group',
    position: groupPosition,
    data: { label, theme },
    style: {
      width: maxX - minX + GROUP_PADDING_X * 2,
      height: maxY - minY + GROUP_PADDING_Y * 2,
    },
    zIndex: -1,
  }

  const updatedNodes = nodes.map((node) => {
    if (!selectedIds.includes(node.id) || node.type !== 'asset') {
      return node
    }

    const absolute = getNodeBounds(node, nodes)

    return {
      ...node,
      parentId: groupId,
      position: {
        x: absolute.x - groupPosition.x,
        y: absolute.y - groupPosition.y,
      },
    }
  })

  return reorderNodesForSubflows([...updatedNodes, groupNode])
}

export function createAssetNode(
  position: { x: number; y: number },
  icon: IconName,
  theme: ThemeName,
  label = 'BLOCK',
): Node {
  return {
    id: `asset-${Date.now()}`,
    type: 'asset',
    position,
    data: { icon, theme, label },
  }
}

export function createGroupNode(
  position: { x: number; y: number },
  theme: ThemeName,
  label = 'GROUP',
  size: GroupSize = {
    width: DEFAULT_GROUP_WIDTH,
    height: DEFAULT_GROUP_HEIGHT,
  },
): Node {
  return {
    id: `group-${Date.now()}`,
    type: 'group',
    position,
    data: { label, theme },
    style: { width: size.width, height: size.height },
    zIndex: -1,
  }
}

export function absorbAssetsIntoGroup(nodes: Node[], groupId: string): Node[] {
  const groupNode = nodes.find(
    (node) => node.id === groupId && node.type === 'group',
  )

  if (!groupNode) {
    return nodes
  }

  const groupBounds = getNodeBounds(groupNode, nodes)

  const next = nodes.map((node) => {
    if (node.type !== 'asset' || node.parentId || node.id === groupId) {
      return node
    }

    const assetBounds = getNodeBounds(node, nodes)

    if (!boundsIntersect(assetBounds, groupBounds)) {
      return node
    }

    const absolute = getAbsolutePosition(node, nodes)

    return {
      ...node,
      parentId: groupId,
      position: {
        x: absolute.x - groupNode.position.x,
        y: absolute.y - groupNode.position.y,
      },
    }
  })

  return reorderNodesForSubflows(next)
}

export function syncAssetGroupAfterDrag(nodes: Node[], assetId: string): Node[] {
  const asset = nodes.find((node) => node.id === assetId && node.type === 'asset')

  if (!asset) {
    return nodes
  }

  let next = nodes

  if (asset.parentId) {
    const parent = nodes.find((node) => node.id === asset.parentId)

    if (
      !parent ||
      !boundsIntersect(getNodeBounds(asset, nodes), getNodeBounds(parent, nodes))
    ) {
      const absolute = getAbsolutePosition(asset, nodes)
      next = nodes.map((node) =>
        node.id === assetId
          ? { ...node, parentId: undefined, position: absolute }
          : node,
      )
    }
  } else {
    for (const group of nodes.filter((node) => node.type === 'group')) {
      next = absorbAssetsIntoGroup(next, group.id)
    }
  }

  return reorderNodesForSubflows(next)
}

export function addGroupAtPosition(
  nodes: Node[],
  position: { x: number; y: number },
  theme: ThemeName,
  label = 'GROUP',
  size?: GroupSize,
): Node[] {
  const groupNode = createGroupNode(position, theme, label, size)
  return absorbAssetsIntoGroup([...nodes, groupNode], groupNode.id)
}
