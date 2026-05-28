import { createContext, useContext } from 'react'

type DiagramUiContextValue = {
  openIconPicker: (nodeId: string) => void
  closeIconPicker: () => void
  iconPickerNodeId: string | null
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
