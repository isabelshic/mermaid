import { useEffect, useRef, useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react'
import { diagramLabelStyle } from '../../tokens/typography'

type InlineLabelEditorProps = {
  nodeId: string
  label: string
  color: string
  className?: string
  inputClassName?: string
  placeholder?: string
  onSelect?: (event: MouseEvent) => void
}

export function InlineLabelEditor({
  nodeId,
  label,
  color,
  className = '',
  inputClassName = '',
  placeholder = 'NAME',
  onSelect,
}: InlineLabelEditorProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)
  const { updateNodeData } = useReactFlow()

  const textStyle: CSSProperties = {
    ...diagramLabelStyle,
    color,
  }

  useEffect(() => {
    setDraft(label)
  }, [label])

  useEffect(() => {
    if (!editing) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editing])

  const commit = () => {
    const next = draft.trim().toUpperCase() || label
    updateNodeData(nodeId, { label: next })
    setDraft(next)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(label)
    setEditing(false)
  }

  const startEditing = (event: MouseEvent) => {
    event.stopPropagation()
    setEditing(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()

    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      cancel()
    }
  }

  return (
    <div className={className} style={textStyle}>
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          placeholder={placeholder}
          size={Math.max(draft.length || placeholder.length, 4)}
          className={`nodrag nopan m-0 block min-w-0 border-0 bg-transparent p-0 outline-none ${inputClassName}`}
          style={{
            ...textStyle,
            width: `${Math.max(draft.length, placeholder.length, 4)}ch`,
          }}
        />
      ) : (
        <button
          type="button"
          onClick={onSelect}
          onDoubleClick={startEditing}
          className={`m-0 block cursor-text border-0 bg-transparent p-0 text-left ${inputClassName}`}
          style={textStyle}
          title="Double-click to rename"
        >
          {label || placeholder}
        </button>
      )}
    </div>
  )
}
