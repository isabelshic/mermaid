import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { exportDiagramSvg } from '../lib/export/toSvg'

export function useDiagramSvgExport() {
  const { getNodes } = useReactFlow()

  return useCallback(
    (filename = 'diagram.svg') => exportDiagramSvg(getNodes(), filename),
    [getNodes],
  )
}
