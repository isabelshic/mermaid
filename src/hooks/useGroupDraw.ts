import { useCallback, useEffect, useRef, useState } from 'react'
import { useReactFlow, type Node } from '@xyflow/react'
import type { ThemeName } from '../tokens/colors'
import { boundsFromDragCorners } from '../lib/groupBounds'
import { isPaneTarget } from '../lib/isPaneTarget'
import { snapNodePosition } from '../lib/snap'

type GroupPreview = {
  anchor: { x: number; y: number }
  current: { x: number; y: number }
  theme: ThemeName
}

type UseGroupDrawOptions = {
  active: boolean
  theme: ThemeName
  nodes: Node[]
  onCreateGroup: (
    position: { x: number; y: number },
    size: { width: number; height: number },
  ) => void
}

export function useGroupDraw({
  active,
  theme,
  nodes,
  onCreateGroup,
}: UseGroupDrawOptions) {
  const { screenToFlowPosition } = useReactFlow()
  const isDrawingRef = useRef(false)
  const anchorRef = useRef<{ x: number; y: number } | null>(null)
  const nodesRef = useRef(nodes)
  const [preview, setPreview] = useState<GroupPreview | null>(null)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  const clearPreview = useCallback(() => {
    isDrawingRef.current = false
    anchorRef.current = null
    setPreview(null)
  }, [])

  useEffect(() => {
    if (!active) {
      clearPreview()
    }
  }, [active, clearPreview])

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!active || event.button !== 0 || !isPaneTarget(event.target)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const anchor = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      isDrawingRef.current = true
      anchorRef.current = anchor
      setPreview({ anchor, current: anchor, theme })
    },
    [active, screenToFlowPosition, theme],
  )

  useEffect(() => {
    if (!active) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDrawingRef.current) {
        return
      }

      const current = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      setPreview((state) =>
        state ? { ...state, current } : null,
      )
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (!isDrawingRef.current) {
        return
      }

      const end = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const anchor = anchorRef.current ?? end
      const bounds = boundsFromDragCorners(anchor, end)
      const draft = {
        id: 'group-draft',
        type: 'group' as const,
        position: bounds.position,
        data: { label: 'GROUP', theme },
        style: { width: bounds.size.width, height: bounds.size.height },
      }
      const snapped = snapNodePosition(draft, bounds.position, nodesRef.current)

      onCreateGroup(snapped, bounds.size)
      clearPreview()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [active, clearPreview, onCreateGroup, screenToFlowPosition, theme])

  return { preview, handleMouseDown }
}
