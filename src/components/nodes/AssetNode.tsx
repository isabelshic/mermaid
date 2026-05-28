import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { MouseEvent } from 'react'
import { themes } from '../../tokens/colors'
import { getIcon } from '../../lib/icons'
import type { AssetNodeData } from '../../types/diagram'
import { InlineLabelEditor } from './InlineLabelEditor'
import { useDiagramUi } from '../../context/DiagramUiContext'

export function AssetNode({ data, selected, id }: NodeProps) {
  const nodeData = data as AssetNodeData
  const theme = themes[nodeData.theme]
  const Icon = getIcon(nodeData.icon)
  const { openIconPicker } = useDiagramUi()

  const handleIconPickerOpen = (event: MouseEvent) => {
    event.stopPropagation()
    openIconPicker(id)
  }

  return (
    <div className="asset-node relative">
      <div
        className="flex size-[68px] cursor-grab items-center justify-center border border-dashed active:cursor-grabbing"
        style={{
          borderColor: theme.color,
          backgroundColor: theme.fill,
          outline: selected ? `1px solid ${theme.color}` : undefined,
          outlineOffset: 2,
        }}
        onDoubleClick={handleIconPickerOpen}
        title="Drag to move. Double-click to change icon."
      >
        <Icon
          width={22}
          height={22}
          strokeWidth={1.5}
          color={theme.color}
          aria-hidden="true"
        />
      </div>

      <div className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 whitespace-nowrap">
        <InlineLabelEditor
          nodeId={id}
          label={nodeData.label ?? ''}
          color={theme.color}
          inputClassName="text-[9px] tracking-[0.08em]"
          className="text-[9px] tracking-[0.08em]"
          placeholder="BLOCK"
        />
      </div>

      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  )
}
