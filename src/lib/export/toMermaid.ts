import type { Edge, Node } from '@xyflow/react'
import { getEdgeDirection } from '../edges'
import type { AssetNodeData, GroupNodeData } from '../../types/diagram'

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_')
}

function formatNodeLabel(label: string): string {
  return label.replace(/"/g, '\\"')
}

function isGroupNode(node: Node): node is Node<GroupNodeData> {
  return node.type === 'group'
}

function isAssetNode(node: Node): node is Node<AssetNodeData> {
  return node.type === 'asset'
}

export function toMermaid(nodes: Node[], edges: Edge[]): string {
  const groups = nodes.filter(isGroupNode)
  const assets = nodes.filter(isAssetNode)
  const lines: string[] = ['flowchart LR']

  for (const group of groups) {
    const safeId = sanitizeId(group.id)
    const children = assets.filter((asset) => asset.parentId === group.id)

    lines.push(`  subgraph ${safeId} ["${formatNodeLabel(group.data.label)}"]`)
    lines.push('    direction LR')

    for (const child of children) {
      const childId = sanitizeId(child.id)
      const childLabel = child.data.label ?? child.id
      lines.push(`    ${childId}["${formatNodeLabel(childLabel)}"]`)
    }

    lines.push('  end')
  }

  const orphanAssets = assets.filter(
    (asset) => !asset.parentId || !groups.some((group) => group.id === asset.parentId),
  )

  for (const asset of orphanAssets) {
    const assetId = sanitizeId(asset.id)
    const assetLabel = asset.data.label ?? asset.id
    lines.push(`  ${assetId}["${formatNodeLabel(assetLabel)}"]`)
  }

  lines.push('')

  for (const edge of edges) {
    const direction = getEdgeDirection(edge.data)
    const arrow =
      direction === 'both' ? '<-->' : direction === 'one-way' ? '-->' : '---'
    lines.push(`  ${sanitizeId(edge.source)} ${arrow} ${sanitizeId(edge.target)}`)
  }

  const assetsWithUrls = assets.filter((asset) => asset.data.url)
  if (assetsWithUrls.length > 0) {
    lines.push('')
  }

  for (const asset of assetsWithUrls) {
    const assetId = sanitizeId(asset.id)
    const url = asset.data.url!
    const tooltip = formatNodeLabel(asset.data.label ?? asset.id)
    lines.push(`  click ${assetId} "${url}" "${tooltip}"`)
  }

  return `${lines.join('\n')}\n`
}

export function downloadMermaid(content: string, filename = 'diagram.mmd') {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
