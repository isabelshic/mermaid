import { useState } from 'react'
import type { Edge, Node } from '@xyflow/react'
import { NavArrowLeft, NavArrowRight } from 'iconoir-react'
import { ExportPanel } from '../export/ExportPanel'
import { NodeInspector } from './NodeInspector'
import { IconPickerPanel } from './IconPickerPanel'
import type { SelectedDiagramNode } from './NodeInspector'
import type { AssetNodeData } from '../../types/diagram'
import type { IconName } from '../../lib/icons'
import type { ThemeName } from '../../tokens/colors'
import { uiLabelStyle } from '../../tokens/typography'
import {
  panelBorderClass,
  panelHoverClass,
  panelShadowClass,
  panelSurfaceClass,
} from '../../tokens/panel'

type SidebarProps = {
  nodes: Node[]
  edges: Edge[]
  selectedNode: SelectedDiagramNode | null
  selectedNodes: Node[]
  iconPickerNodeId: string | null
  onUpdateLabel: (nodeId: string, label: string) => void
  onUpdateUrl: (nodeId: string, url: string) => void
  onUpdateIcon: (nodeId: string, icon: IconName) => void
  onUpdateTheme: (nodeId: string, theme: ThemeName) => void
  onGroupSelection: (label: string, theme: ThemeName) => void
  onCloseIconPicker: () => void
  onExportSvg?: () => Promise<void>
}

export function Sidebar({
  nodes,
  edges,
  selectedNode,
  selectedNodes,
  iconPickerNodeId,
  onUpdateLabel,
  onUpdateUrl,
  onUpdateIcon,
  onUpdateTheme,
  onGroupSelection,
  onCloseIconPicker,
  onExportSvg,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const iconPickerNode = iconPickerNodeId
    ? (nodes.find(
        (node) => node.id === iconPickerNodeId && node.type === 'asset',
      ) as Node<AssetNodeData> | undefined)
    : undefined

  if (collapsed) {
    return (
      <aside className="flex h-full shrink-0 p-2">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className={`flex cursor-pointer items-center justify-center rounded-lg p-2 ${panelBorderClass} ${panelSurfaceClass} ${panelShadowClass} ${panelHoverClass}`}
          aria-label="Expand sidebar"
        >
          <NavArrowLeft
            width={14}
            height={14}
            strokeWidth={1.5}
            color="var(--neutral-text-subtle)"
          />
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex h-full min-h-0 w-72 shrink-0 overflow-hidden p-2">
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden ${panelBorderClass} ${panelSurfaceClass} rounded-lg px-3 py-3`}
      >
        <div className="mb-3 flex shrink-0 items-center gap-2 px-1">
          <span
            style={uiLabelStyle}
            className="min-w-0 flex-1 text-[10px] text-[var(--neutral-text-subtle)]"
          >
            Inspector
          </span>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className={`flex shrink-0 cursor-pointer items-center justify-center rounded-md p-1 ${panelHoverClass}`}
            aria-label="Collapse sidebar"
          >
            <NavArrowRight
              width={14}
              height={14}
              strokeWidth={1.5}
              color="var(--neutral-text-subtle)"
            />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {iconPickerNode ? (
            <IconPickerPanel
              node={iconPickerNode}
              onUpdateIcon={onUpdateIcon}
              onUpdateTheme={onUpdateTheme}
              onClose={onCloseIconPicker}
            />
          ) : (
            <NodeInspector
              selectedNode={selectedNode}
              selectedNodes={selectedNodes}
              onUpdateLabel={onUpdateLabel}
              onUpdateUrl={onUpdateUrl}
              onUpdateTheme={onUpdateTheme}
              onGroupSelection={onGroupSelection}
            />
          )}
        </div>

        <div className="mt-3 shrink-0 pt-3">
          <ExportPanel
            nodes={nodes}
            edges={edges}
            onExportSvg={onExportSvg}
          />
        </div>
      </div>
    </aside>
  )
}
