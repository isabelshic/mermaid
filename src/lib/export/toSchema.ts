import type { Edge, Node } from '@xyflow/react'
import { getEdgeDirection } from '../edges'
import type {
  AssetNodeData,
  DiagramDocument,
  GroupNodeData,
  SchemaEdge,
  SchemaNode,
} from '../../types/diagram'

function isGroupNode(node: Node): node is Node<GroupNodeData> {
  return node.type === 'group'
}

function isAssetNode(node: Node): node is Node<AssetNodeData> {
  return node.type === 'asset'
}

export function toSchema(nodes: Node[], edges: Edge[]): DiagramDocument {
  const schemaNodes: SchemaNode[] = nodes.map((node) => {
    if (isGroupNode(node)) {
      return {
        id: node.id,
        type: 'group',
        label: node.data.label,
        theme: node.data.theme,
        position: node.position,
        size: {
          width: Number(node.style?.width ?? 230),
          height: Number(node.style?.height ?? 130),
        },
      }
    }

    if (isAssetNode(node)) {
      return {
        id: node.id,
        type: 'asset',
        label: node.data.label,
        theme: node.data.theme,
        icon: node.data.icon,
        url: node.data.url,
        parentId: node.parentId,
        position: node.position,
      }
    }

    throw new Error(`Unsupported node type: ${node.type}`)
  })

  const schemaEdges: SchemaEdge[] = edges.map((edge) => {
    const direction = getEdgeDirection(edge.data)
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      strokeStyle:
        (edge.data as { strokeStyle?: SchemaEdge['strokeStyle'] } | undefined)
          ?.strokeStyle ?? 'dashed',
      direction,
      bidirectional: direction === 'both',
    }
  })

  return {
    version: '1',
    meta: {
      createdAt: new Date().toISOString(),
      font: 'DM Mono',
    },
    nodes: schemaNodes,
    edges: schemaEdges,
  }
}

export function downloadJson(diagram: DiagramDocument, filename = 'diagram.json') {
  const blob = new Blob([JSON.stringify(diagram, null, 2)], {
    type: 'application/json',
  })
  triggerDownload(blob, filename)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
