import type { Edge } from '@xyflow/react'
import { normalizeBidirectionalEdges } from '../edges'
import { DiagramParseError } from './fromSchema'
import {
  layoutParsedDiagram,
  type ParsedAsset,
  type ParsedEdge,
  type ParsedGroup,
} from './autoLayout'

function unescapeLabel(value: string): string {
  return value.replace(/\\"/g, '"')
}

function parseNodeLabel(line: string): { id: string; label: string } | null {
  const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*\[\s*"((?:\\.|[^"\\])*)"\s*\]\s*$/)
  if (!match) {
    return null
  }
  return {
    id: match[1],
    label: unescapeLabel(match[2]),
  }
}

function parseSubgraphHeader(line: string): { id: string; label: string } | null {
  const match = line.match(
    /^\s*subgraph\s+([a-zA-Z0-9_]+)\s*\[\s*"((?:\\.|[^"\\])*)"\s*\]\s*$/,
  )
  if (!match) {
    return null
  }
  return {
    id: match[1],
    label: unescapeLabel(match[2]),
  }
}

function parseEdgeLine(line: string): ParsedEdge | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('flowchart') || trimmed.startsWith('click')) {
    return null
  }

  const bothMatch = trimmed.match(
    /^([a-zA-Z0-9_]+)\s*<-->\s*([a-zA-Z0-9_]+)$/,
  )
  if (bothMatch) {
    return {
      id: `e-${bothMatch[1]}-${bothMatch[2]}`,
      source: bothMatch[1],
      target: bothMatch[2],
      direction: 'both',
    }
  }

  const oneWayMatch = trimmed.match(
    /^([a-zA-Z0-9_]+)\s*-->\s*([a-zA-Z0-9_]+)$/,
  )
  if (oneWayMatch) {
    return {
      id: `e-${oneWayMatch[1]}-${oneWayMatch[2]}`,
      source: oneWayMatch[1],
      target: oneWayMatch[2],
      direction: 'one-way',
    }
  }

  const noneMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*---\s*([a-zA-Z0-9_]+)$/)
  if (noneMatch) {
    return {
      id: `e-${noneMatch[1]}-${noneMatch[2]}`,
      source: noneMatch[1],
      target: noneMatch[2],
      direction: 'none',
    }
  }

  return null
}

function parseClickLine(line: string): { id: string; url: string } | null {
  const match = line.trim().match(
    /^click\s+([a-zA-Z0-9_]+)\s+"((?:\\.|[^"\\])*)"\s+"((?:\\.|[^"\\])*)"\s*$/,
  )
  if (!match) {
    return null
  }
  return {
    id: match[1],
    url: unescapeLabel(match[2]),
  }
}

export function fromMermaid(content: string): { nodes: import('@xyflow/react').Node[]; edges: Edge[] } {
  const lines = content.split('\n')
  const groups: ParsedGroup[] = []
  const assets: ParsedAsset[] = []
  const edges: ParsedEdge[] = []
  const assetUrls = new Map<string, string>()

  let currentGroup: ParsedGroup | null = null
  let sawFlowchart = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      continue
    }

    if (trimmed.startsWith('flowchart')) {
      sawFlowchart = true
      continue
    }

    const click = parseClickLine(line)
    if (click) {
      assetUrls.set(click.id, click.url)
      continue
    }

    const subgraph = parseSubgraphHeader(line)
    if (subgraph) {
      currentGroup = { id: subgraph.id, label: subgraph.label, assetIds: [] }
      groups.push(currentGroup)
      continue
    }

    if (trimmed === 'end') {
      currentGroup = null
      continue
    }

    if (trimmed === 'direction LR' || trimmed === 'direction TB') {
      continue
    }

    const edge = parseEdgeLine(line)
    if (edge) {
      edges.push(edge)
      continue
    }

    const node = parseNodeLabel(line)
    if (node) {
      const asset: ParsedAsset = {
        id: node.id,
        label: node.label,
        parentId: currentGroup?.id,
      }
      assets.push(asset)
      if (currentGroup) {
        currentGroup.assetIds.push(node.id)
      }
    }
  }

  if (!sawFlowchart) {
    throw new DiagramParseError('Not a valid Mermaid flowchart file')
  }

  if (groups.length === 0 && assets.length === 0) {
    throw new DiagramParseError('No nodes found in Mermaid file')
  }

  for (const asset of assets) {
    const url = assetUrls.get(asset.id)
    if (url) {
      asset.url = url
    }
  }

  const laidOut = layoutParsedDiagram({ groups, assets, edges })

  return {
    nodes: laidOut.nodes,
    edges: normalizeBidirectionalEdges(laidOut.edges),
  }
}
