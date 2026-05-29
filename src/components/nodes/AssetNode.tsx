import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { CSSProperties, MouseEvent } from 'react'
import type { AssetConnectionSlotId } from '../../lib/connectionSlots'
import { themes } from '../../tokens/colors'
import { getIcon } from '../../lib/icons'
import type { AssetNodeData } from '../../types/diagram'
import { InlineLabelEditor } from './InlineLabelEditor'
import { useDiagramUi } from '../../context/DiagramUiContext'

type SlotConfig = {
  id: AssetConnectionSlotId
  position: Position
  style: CSSProperties
}

const connectionSlots: SlotConfig[] = [
  { id: 'left-top', position: Position.Left, style: { top: '25%' } },
  { id: 'left', position: Position.Left, style: { top: '50%' } },
  { id: 'left-bottom', position: Position.Left, style: { top: '75%' } },
  { id: 'right-top', position: Position.Right, style: { top: '25%' } },
  { id: 'right', position: Position.Right, style: { top: '50%' } },
  { id: 'right-bottom', position: Position.Right, style: { top: '75%' } },
  { id: 'top-left', position: Position.Top, style: { left: '25%' } },
  { id: 'top', position: Position.Top, style: { left: '50%' } },
  { id: 'top-right', position: Position.Top, style: { left: '75%' } },
  { id: 'bottom-left', position: Position.Bottom, style: { left: '25%' } },
  { id: 'bottom', position: Position.Bottom, style: { left: '50%' } },
  { id: 'bottom-right', position: Position.Bottom, style: { left: '75%' } },
]

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
    <div
      className="asset-node group/asset-node relative"
      style={{ '--slot-color': theme.color } as CSSProperties}
    >
      <div
        className="relative z-[2] flex size-[68px] cursor-grab items-center justify-center border border-dashed active:cursor-grabbing"
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

      <div className="absolute top-full left-1/2 z-[2] mt-1.5 -translate-x-1/2 whitespace-nowrap">
        <InlineLabelEditor
          nodeId={id}
          label={nodeData.label ?? ''}
          color={theme.color}
          inputClassName="text-[9px] tracking-[0.08em]"
          className="text-[9px] tracking-[0.08em]"
          placeholder="BLOCK"
        />
      </div>

      {connectionSlots.map((slot) => (
        <Handle
          key={slot.id}
          type="source"
          position={slot.position}
          id={slot.id}
          className="asset-slot-handle"
          style={slot.style}
          isConnectableStart
          isConnectableEnd
        />
      ))}
    </div>
  )
}
