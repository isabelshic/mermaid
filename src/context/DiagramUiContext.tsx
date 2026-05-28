import { createContext, useContext } from 'react'
import type { CanvasTool } from '../types/canvas'

type DiagramUiContextValue = {
  openIconPicker: (nodeId: string) => void
  closeIconPicker: () => void
  iconPickerNodeId: string | null
  canvasTool: CanvasTool
}

export const DiagramUiContext = createContext<DiagramUiContextValue | null>(
  null,
)

export function useDiagramUi() {
  const context = useContext(DiagramUiContext)

  if (!context) {
    throw new Error('useDiagramUi must be used within DiagramUiProvider')
  }

  return context
}
