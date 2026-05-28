import type { Edge, Node } from '@xyflow/react'
import type { ThemeName } from '../tokens/colors'
import type { IconName } from '../lib/icons'

export type GroupNodeData = {
  label: string
  theme: ThemeName
}

export type AssetNodeData = {
  icon: IconName
  theme: ThemeName
  label?: string
  url?: string
}

export type EdgeStrokeStyle = 'dashed' | 'solid'

export type EdgeDirection = 'none' | 'one-way' | 'both'

export type ConnectorEdgeData = {
  strokeStyle: EdgeStrokeStyle
  direction?: EdgeDirection
  bidirectional?: boolean
}

export type DiagramNode = Node<GroupNodeData | AssetNodeData>
export type DiagramEdge = Edge

export type SchemaNode = {
  id: string
  type: 'group' | 'asset'
  label?: string
  theme: ThemeName
  icon?: IconName
  url?: string
  parentId?: string
  position: { x: number; y: number }
  size?: { width: number; height: number }
}

export type SchemaEdge = {
  id: string
  source: string
  target: string
  strokeStyle?: EdgeStrokeStyle
  direction?: EdgeDirection
  bidirectional?: boolean
}

export type DiagramDocument = {
  version: '1'
  meta: {
    createdAt: string
    font: string
  }
  nodes: SchemaNode[]
  edges: SchemaEdge[]
}
