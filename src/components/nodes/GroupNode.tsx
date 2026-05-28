import { NodeResizer, useReactFlow, type NodeProps } from '@xyflow/react'
import type { MouseEvent } from 'react'
import { themes } from '../../tokens/colors'
import type { GroupNodeData } from '../../types/diagram'
import { InlineLabelEditor } from './InlineLabelEditor'

export function GroupNode({ data, selected, id }: NodeProps) {
  const theme = themes[data.theme as GroupNodeData['theme']]
  const label = (data as GroupNodeData).label
  const { setNodes } = useReactFlow()

  const selectGroup = (event: MouseEvent) => {
    event.stopPropagation()

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, selected: true }
        }

        if (event.shiftKey) {
          return node
        }

        return { ...node, selected: false }
      }),
    )
  }

  return (
    <div className="group-node relative h-full w-full">
      <InlineLabelEditor
        nodeId={id}
        label={label}
        color={theme.color}
        className="absolute bottom-full left-0 mb-1 leading-none"
        placeholder="GROUP"
        onSelect={selectGroup}
      />

      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={120}
        handleClassName="group-resize-handle"
        lineClassName="group-resize-line"
        color={theme.color}
        handleStyle={{
          width: 6,
          height: 6,
          border: `1px solid ${theme.color}`,
          background: 'var(--canvas-bg)',
          borderRadius: 0,
        }}
      />

      <div
        className="relative h-full w-full border bg-transparent"
        style={{ borderColor: theme.color }}
        onClick={selectGroup}
        role="presentation"
      >
        {!selected && (
          <>
            <span
              className="pointer-events-none absolute size-[6px] border bg-[var(--canvas-bg)]"
              style={{ borderColor: theme.color, top: -3, left: -3 }}
            />
            <span
              className="pointer-events-none absolute size-[6px] border bg-[var(--canvas-bg)]"
              style={{ borderColor: theme.color, top: -3, right: -3 }}
            />
            <span
              className="pointer-events-none absolute size-[6px] border bg-[var(--canvas-bg)]"
              style={{ borderColor: theme.color, bottom: -3, left: -3 }}
            />
            <span
              className="pointer-events-none absolute size-[6px] border bg-[var(--canvas-bg)]"
              style={{ borderColor: theme.color, bottom: -3, right: -3 }}
            />
          </>
        )}
      </div>
    </div>
  )
}
