import { GRID_SIZE } from './snap'

export const MIN_GROUP_WIDTH = 160
export const MIN_GROUP_HEIGHT = 120

export const DEFAULT_GROUP_WIDTH = 230
export const DEFAULT_GROUP_HEIGHT = 130

export type GroupSize = {
  width: number
  height: number
}

export type GroupBounds = {
  position: { x: number; y: number }
  size: GroupSize
}

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

/** Build group position + size from two drag corners in flow coordinates. */
export function boundsFromDragCorners(
  start: { x: number; y: number },
  end: { x: number; y: number },
): GroupBounds {
  const minX = Math.min(start.x, end.x)
  const minY = Math.min(start.y, end.y)
  const maxX = Math.max(start.x, end.x)
  const maxY = Math.max(start.y, end.y)

  const rawWidth = maxX - minX
  const rawHeight = maxY - minY

  if (rawWidth < GRID_SIZE * 2 && rawHeight < GRID_SIZE * 2) {
    const width = DEFAULT_GROUP_WIDTH
    const height = DEFAULT_GROUP_HEIGHT
    return {
      position: {
        x: snapToGrid(end.x - width / 2),
        y: snapToGrid(end.y - height / 2),
      },
      size: { width, height },
    }
  }

  return {
    position: {
      x: snapToGrid(minX),
      y: snapToGrid(minY),
    },
    size: {
      width: Math.max(MIN_GROUP_WIDTH, snapToGrid(rawWidth)),
      height: Math.max(MIN_GROUP_HEIGHT, snapToGrid(rawHeight)),
    },
  }
}
