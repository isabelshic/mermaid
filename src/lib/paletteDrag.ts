import type { DragEvent } from 'react'

export const PALETTE_DRAG_TYPE = 'application/reactflow'

export type PaletteDragPayload = {
  kind: 'asset'
  icon: string
  theme: string
  label: string
}

export function readPaletteDragPayload(
  dataTransfer: DataTransfer,
): PaletteDragPayload | null {
  const raw = dataTransfer.getData(PALETTE_DRAG_TYPE)
  if (!raw) return null

  try {
    const payload = JSON.parse(raw) as PaletteDragPayload
    return payload.kind === 'asset' ? payload : null
  } catch {
    return null
  }
}

export function writePaletteDragPayload(
  event: DragEvent,
  payload: PaletteDragPayload,
) {
  event.dataTransfer.setData(PALETTE_DRAG_TYPE, JSON.stringify(payload))
  event.dataTransfer.effectAllowed = 'move'
}
