import type { Edge, Node } from '@xyflow/react'
import { isAssetConnectionSlotId } from '../connectionSlots'
import { withConnectorDirection } from '../edges'
import { iconNames, type IconName } from '../icons'
import {
  DEFAULT_GROUP_HEIGHT,
  DEFAULT_GROUP_WIDTH,
} from '../groupBounds'
import type { ThemeName } from '../../tokens/colors'
import type {
  DiagramDocument,
  EdgeDirection,
  EdgeStrokeStyle,
  SchemaEdge,
  SchemaNode,
} from '../../types/diagram'

export class DiagramParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DiagramParseError'
  }
}

const THEME_NAMES: ThemeName[] = ['blue', 'green', 'magenta']
const EDGE_DIRECTIONS: EdgeDirection[] = ['none', 'one-way', 'both']
const EDGE_STROKE_STYLES: EdgeStrokeStyle[] = ['dashed', 'solid']
const ICON_NAME_SET = new Set<string>(iconNames)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new DiagramParseError(`Invalid or missing ${field}`)
  }
  return value
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new DiagramParseError(`Invalid or missing ${field}`)
  }
  return value
}

function requireTheme(value: unknown, field: string): ThemeName {
  const theme = requireString(value, field)
  if (!THEME_NAMES.includes(theme as ThemeName)) {
    throw new DiagramParseError(`Invalid theme in ${field}: ${theme}`)
  }
  return theme as ThemeName
}

function requireIcon(value: unknown, field: string): IconName {
  const icon = requireString(value, field)
  if (!ICON_NAME_SET.has(icon)) {
    throw new DiagramParseError(`Invalid icon in ${field}: ${icon}`)
  }
  return icon as IconName
}

function parsePosition(value: unknown, field: string): { x: number; y: number } {
  if (!isRecord(value)) {
    throw new DiagramParseError(`Invalid or missing ${field}`)
  }
  return {
    x: requireNumber(value.x, `${field}.x`),
    y: requireNumber(value.y, `${field}.y`),
  }
}

function parseSize(value: unknown): { width: number; height: number } | undefined {
  if (value === undefined) {
    return undefined
  }
  if (!isRecord(value)) {
    throw new DiagramParseError('Invalid node size')
  }
  return {
    width: requireNumber(value.width, 'size.width'),
    height: requireNumber(value.height, 'size.height'),
  }
}

function parseSchemaNode(value: unknown, index: number): SchemaNode {
  if (!isRecord(value)) {
    throw new DiagramParseError(`Invalid node at index ${index}`)
  }

  const type = requireString(value.type, `nodes[${index}].type`)
  if (type !== 'group' && type !== 'asset') {
    throw new DiagramParseError(`Unsupported node type at index ${index}: ${type}`)
  }

  const node: SchemaNode = {
    id: requireString(value.id, `nodes[${index}].id`),
    type,
    theme: requireTheme(value.theme, `nodes[${index}].theme`),
    position: parsePosition(value.position, `nodes[${index}].position`),
  }

  if (value.label !== undefined) {
    node.label = requireString(value.label, `nodes[${index}].label`)
  }

  if (type === 'group') {
    node.size = parseSize(value.size) ?? {
      width: DEFAULT_GROUP_WIDTH,
      height: DEFAULT_GROUP_HEIGHT,
    }
  }

  if (type === 'asset') {
    if (value.icon !== undefined) {
      node.icon = requireIcon(value.icon, `nodes[${index}].icon`)
    }
    if (value.url !== undefined) {
      node.url = requireString(value.url, `nodes[${index}].url`)
    }
    if (value.parentId !== undefined) {
      node.parentId = requireString(value.parentId, `nodes[${index}].parentId`)
    }
  }

  return node
}

function parseSchemaEdge(value: unknown, index: number): SchemaEdge {
  if (!isRecord(value)) {
    throw new DiagramParseError(`Invalid edge at index ${index}`)
  }

  const edge: SchemaEdge = {
    id: requireString(value.id, `edges[${index}].id`),
    source: requireString(value.source, `edges[${index}].source`),
    target: requireString(value.target, `edges[${index}].target`),
  }

  if (value.strokeStyle !== undefined) {
    const strokeStyle = requireString(
      value.strokeStyle,
      `edges[${index}].strokeStyle`,
    )
    if (!EDGE_STROKE_STYLES.includes(strokeStyle as EdgeStrokeStyle)) {
      throw new DiagramParseError(
        `Invalid strokeStyle at edges[${index}]: ${strokeStyle}`,
      )
    }
    edge.strokeStyle = strokeStyle as EdgeStrokeStyle
  }

  if (value.direction !== undefined) {
    const direction = requireString(value.direction, `edges[${index}].direction`)
    if (!EDGE_DIRECTIONS.includes(direction as EdgeDirection)) {
      throw new DiagramParseError(
        `Invalid direction at edges[${index}]: ${direction}`,
      )
    }
    edge.direction = direction as EdgeDirection
  }

  if (value.bidirectional !== undefined) {
    if (typeof value.bidirectional !== 'boolean') {
      throw new DiagramParseError(`Invalid bidirectional at edges[${index}]`)
    }
    edge.bidirectional = value.bidirectional
  }

  if (value.sourceHandle !== undefined) {
    const sourceHandle = requireString(
      value.sourceHandle,
      `edges[${index}].sourceHandle`,
    )
    if (!isAssetConnectionSlotId(sourceHandle)) {
      throw new DiagramParseError(
        `Invalid sourceHandle at edges[${index}]: ${sourceHandle}`,
      )
    }
    edge.sourceHandle = sourceHandle
  }

  if (value.targetHandle !== undefined) {
    const targetHandle = requireString(
      value.targetHandle,
      `edges[${index}].targetHandle`,
    )
    if (!isAssetConnectionSlotId(targetHandle)) {
      throw new DiagramParseError(
        `Invalid targetHandle at edges[${index}]: ${targetHandle}`,
      )
    }
    edge.targetHandle = targetHandle
  }

  return edge
}

export function parseDiagramDocument(json: unknown): DiagramDocument {
  if (!isRecord(json)) {
    throw new DiagramParseError('Diagram file must be a JSON object')
  }

  if (json.version !== '1') {
    throw new DiagramParseError(
      `Unsupported diagram version: ${String(json.version)}`,
    )
  }

  if (!isRecord(json.meta)) {
    throw new DiagramParseError('Invalid or missing meta')
  }

  if (!Array.isArray(json.nodes)) {
    throw new DiagramParseError('Invalid or missing nodes array')
  }

  if (!Array.isArray(json.edges)) {
    throw new DiagramParseError('Invalid or missing edges array')
  }

  return {
    version: '1',
    meta: {
      createdAt: requireString(json.meta.createdAt, 'meta.createdAt'),
      font: requireString(json.meta.font, 'meta.font'),
    },
    nodes: json.nodes.map((node, index) => parseSchemaNode(node, index)),
    edges: json.edges.map((edge, index) => parseSchemaEdge(edge, index)),
  }
}

function resolveEdgeDirection(edge: SchemaEdge): EdgeDirection {
  if (edge.direction) {
    return edge.direction
  }
  return edge.bidirectional ? 'both' : 'one-way'
}

function schemaNodeToReactFlow(node: SchemaNode): Node {
  if (node.type === 'group') {
    const size = node.size ?? {
      width: DEFAULT_GROUP_WIDTH,
      height: DEFAULT_GROUP_HEIGHT,
    }
    return {
      id: node.id,
      type: 'group',
      position: { ...node.position },
      data: {
        label: node.label ?? 'GROUP',
        theme: node.theme,
      },
      style: {
        width: size.width,
        height: size.height,
      },
      zIndex: -1,
    }
  }

  return {
    id: node.id,
    type: 'asset',
    position: { ...node.position },
    parentId: node.parentId,
    data: {
      icon: node.icon ?? 'Globe',
      theme: node.theme,
      label: node.label,
      url: node.url,
    },
  }
}

function schemaEdgeToReactFlow(edge: SchemaEdge): Edge {
  const direction = resolveEdgeDirection(edge)
  const strokeStyle = edge.strokeStyle ?? 'dashed'

  return withConnectorDirection(
    {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
      type: 'connector',
      data: {
        strokeStyle,
        direction,
        bidirectional: direction === 'both',
      },
    },
    direction,
  )
}

export function fromSchema(
  document: DiagramDocument,
): { nodes: Node[]; edges: Edge[] } {
  const nodes = document.nodes.map(schemaNodeToReactFlow)
  const edges = document.edges.map(schemaEdgeToReactFlow)
  return { nodes, edges }
}

export function parseDiagramJson(json: unknown): { nodes: Node[]; edges: Edge[] } {
  return fromSchema(parseDiagramDocument(json))
}
