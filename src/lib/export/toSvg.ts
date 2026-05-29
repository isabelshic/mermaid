import {
  getNodesBounds,
  getViewportForBounds,
  type Node,
  type Rect,
} from '@xyflow/react'
import { toSvg } from 'html-to-image'

const EXPORT_PADDING = 12
const LABEL_EXTRA_HEIGHT = 28
const EDGE_STROKE_BUFFER = 4

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

function unionRects(rect1: Rect, rect2: Rect): Rect {
  const x = Math.min(rect1.x, rect2.x)
  const y = Math.min(rect1.y, rect2.y)
  const right = Math.max(rect1.x + rect1.width, rect2.x + rect2.width)
  const bottom = Math.max(rect1.y + rect1.height, rect2.y + rect2.height)

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
  }
}
function expandRect(rect: Rect, amount: number): Rect {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2,
  }
}

function getDiagramContentBounds(
  viewportElement: HTMLElement,
  nodes: Node[],
): Rect {
  const nodesBounds = getNodesBounds(nodes)
  let bounds: Rect = {
    ...nodesBounds,
    height: nodesBounds.height + LABEL_EXTRA_HEIGHT,
  }

  const edgeElements = viewportElement.querySelectorAll<SVGGraphicsElement>(
    '.react-flow__edges svg *',
  )

  edgeElements.forEach((element) => {
    if (
      element.classList.contains('connector-edge-selection-halo') ||
      element.classList.contains('react-flow__edge-interaction')
    ) {
      return
    }

    try {
      const box = element.getBBox()
      if (box.width === 0 && box.height === 0) {
        return
      }

      bounds = unionRects(bounds, {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      })
    } catch {
      // getBBox throws when the element isn't rendered yet.
    }
  })

  return expandRect(bounds, EDGE_STROKE_BUFFER)
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
    const bounds = getDiagramContentBounds(viewportElement, nodes)

    const imageWidth = Math.ceil(bounds.width + EXPORT_PADDING * 2)
    const imageHeight = Math.ceil(bounds.height + EXPORT_PADDING * 2)

    const { x, y, zoom } = getViewportForBounds(
      bounds,
      imageWidth,
      imageHeight,
      0.1,
      2,
      0,
    )

    const dataUrl = await toSvg(viewportElement, {
      backgroundColor: 'transparent',
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
