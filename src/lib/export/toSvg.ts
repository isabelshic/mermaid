import {
  getNodesBounds,
  getViewportForBounds,
  type Node,
} from '@xyflow/react'
import { toSvg } from 'html-to-image'
import { canvas } from '../../tokens/colors'

const EXPORT_PADDING = 40
const LABEL_EXTRA_HEIGHT = 28

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function isExportExcludedElement(node: HTMLElement): boolean {
  return (
    node.classList.contains('react-flow__controls') ||
    node.classList.contains('react-flow__minimap') ||
    node.classList.contains('react-flow__handle') ||
    node.classList.contains('react-flow__selection') ||
    node.classList.contains('group-resize-handle')
  )
}

export async function exportDiagramSvg(
  nodes: Node[],
  filename = 'diagram.svg',
): Promise<void> {
  if (nodes.length === 0) {
    throw new Error('Add at least one block before exporting.')
  }

  const viewportElement = document.querySelector(
    '.react-flow__viewport',
  ) as HTMLElement | null
  const reactFlowElement = document.querySelector(
    '.react-flow',
  ) as HTMLElement | null

  if (!viewportElement || !reactFlowElement) {
    throw new Error('Canvas is not ready yet.')
  }

  reactFlowElement.classList.add('diagram-exporting')

  try {
    const nodesBounds = getNodesBounds(nodes)
    const bounds = {
      ...nodesBounds,
      height: nodesBounds.height + LABEL_EXTRA_HEIGHT,
    }

    const imageWidth = Math.ceil(bounds.width + EXPORT_PADDING * 2)
    const imageHeight = Math.ceil(bounds.height + EXPORT_PADDING * 2)

    const { x, y, zoom } = getViewportForBounds(
      bounds,
      imageWidth,
      imageHeight,
      0.1,
      2,
      EXPORT_PADDING / Math.min(imageWidth, imageHeight),
    )

    const dataUrl = await toSvg(viewportElement, {
      backgroundColor: canvas.bg,
      width: imageWidth,
      height: imageHeight,
      filter: (node) => {
        if (!(node instanceof HTMLElement)) {
          return true
        }

        return !isExportExcludedElement(node)
      },
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
      },
    })

    const response = await fetch(dataUrl)
    const svgText = await response.text()
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    triggerDownload(blob, filename)
  } finally {
    reactFlowElement.classList.remove('diagram-exporting')
  }
}
