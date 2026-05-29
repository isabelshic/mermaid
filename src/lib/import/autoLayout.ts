import type { Edge, Node } from '@xyflow/react'
import { withConnectorDirection } from '../edges'
import {
  DEFAULT_GROUP_HEIGHT,
  DEFAULT_GROUP_WIDTH,
} from '../groupBounds'
import type { ThemeName } from '../../tokens/colors'
import type { IconName } from '../icons'

const GROUP_GAP_Y = 160
const GROUP_START_X = 60
const GROUP_START_Y = 60
const ASSET_OFFSETS = [
  { x: 35, y: 48 },
  { x: 130, y: 48 },
]

export type ParsedGroup = {
  id: string
  label: string
  assetIds: string[]
}

export type ParsedAsset = {
  id: string
  label: string
  parentId?: string
  url?: string
}

export type ParsedEdge = {
  id: string
  source: string
  target: string
  direction: 'none' | 'one-way' | 'both'
}

type LayoutInput = {
  groups: ParsedGroup[]
  assets: ParsedAsset[]
  edges: ParsedEdge[]
  defaultTheme?: ThemeName
  defaultIcon?: IconName
}

export function layoutParsedDiagram({
  groups,
  assets,
  edges,
  defaultTheme = 'blue',
  defaultIcon = 'Globe',
}: LayoutInput): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const idMap = new Map<string, string>()

  groups.forEach((group, groupIndex) => {
    const position = {
      x: GROUP_START_X,
      y: GROUP_START_Y + groupIndex * GROUP_GAP_Y,
    }

    nodes.push({
      id: group.id,
      type: 'group',
      position,
      data: { label: group.label, theme: defaultTheme },
      style: {
        width: DEFAULT_GROUP_WIDTH,
        height: DEFAULT_GROUP_HEIGHT,
      },
      zIndex: -1,
    })

    group.assetIds.forEach((assetId, assetIndex) => {
      const asset = assets.find((entry) => entry.id === assetId)
      if (!asset) {
        return
      }

      const offset = ASSET_OFFSETS[assetIndex % ASSET_OFFSETS.length]
      nodes.push({
        id: asset.id,
        type: 'asset',
        parentId: group.id,
        position: { ...offset },
        data: {
          icon: defaultIcon,
          theme: defaultTheme,
          label: asset.label,
          url: asset.url,
        },
      })
      idMap.set(asset.id, asset.id)
    })
  })

  const orphanAssets = assets.filter(
    (asset) =>
      !asset.parentId ||
      !groups.some((group) => group.id === asset.parentId),
  )

  orphanAssets.forEach((asset, index) => {
    nodes.push({
      id: asset.id,
      type: 'asset',
      position: {
        x: GROUP_START_X + 320 + (index % 2) * 120,
        y: GROUP_START_Y + Math.floor(index / 2) * 100,
      },
      data: {
        icon: defaultIcon,
        theme: defaultTheme,
        label: asset.label,
        url: asset.url,
      },
    })
    idMap.set(asset.id, asset.id)
  })

  const layoutEdges: Edge[] = edges.map((edge) =>
    withConnectorDirection(
      {
        id: edge.id,
        source: idMap.get(edge.source) ?? edge.source,
        target: idMap.get(edge.target) ?? edge.target,
        type: 'connector',
        data: {
          strokeStyle: 'dashed' as const,
          direction: edge.direction,
          bidirectional: edge.direction === 'both',
        },
      },
      edge.direction,
    ),
  )

  return { nodes, edges: layoutEdges }
}
