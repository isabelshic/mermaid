import { useEffect, useRef } from 'react'
import type { Edge, Node } from '@xyflow/react'
import {
  copySelection,
  pasteClipboard,
  type DiagramClipboard,
} from '../lib/clipboard'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    target.isContentEditable
  )
}

function hasModifier(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey
}

type UseDiagramKeyboardShortcutsOptions = {
  enabled?: boolean
  selectedNodeIds: Set<string>
  nodes: Node[]
  edges: Edge[]
  onCopy?: (clipboard: DiagramClipboard) => void
  onPaste: (nodes: Node[], edges: Edge[]) => void
  onUndo: () => void
  onRedo: () => void
}

export function useDiagramKeyboardShortcuts({
  enabled = true,
  selectedNodeIds,
  nodes,
  edges,
  onCopy,
  onPaste,
  onUndo,
  onRedo,
}: UseDiagramKeyboardShortcutsOptions) {
  const clipboardRef = useRef<DiagramClipboard | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }

      if (!hasModifier(event)) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          onRedo()
        } else {
          onUndo()
        }
        return
      }

      if (key === 'c') {
        const copied = copySelection(nodes, edges, selectedNodeIds)
        if (!copied) {
          return
        }
        event.preventDefault()
        clipboardRef.current = copied
        onCopy?.(copied)
        return
      }

      if (key === 'v') {
        const clipboard = clipboardRef.current
        if (!clipboard) {
          return
        }
        event.preventDefault()
        const pasted = pasteClipboard(clipboard, nodes, edges)
        onPaste(pasted.nodes, pasted.edges)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    enabled,
    edges,
    nodes,
    onCopy,
    onPaste,
    onRedo,
    onUndo,
    selectedNodeIds,
  ])
}
