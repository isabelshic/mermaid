import type { Edge, Node } from '@xyflow/react'
import { ExportPanel } from '../export/ExportPanel'
import { NodeInspector } from './NodeInspector'
import { IconPickerPanel } from './IconPickerPanel'
import type { SelectedDiagramNode } from './NodeInspector'
import type { AssetNodeData } from '../../types/diagram'
import type { IconName } from '../../lib/icons'
import type { ThemeName } from '../../tokens/colors'
import { panelBorderClass, panelSurfaceClass } from '../../tokens/panel'

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
}: SidebarProps) {
  const iconPickerNode = iconPickerNodeId
    ? (nodes.find(
        (node) => node.id === iconPickerNodeId && node.type === 'asset',
      ) as Node<AssetNodeData> | undefined)
    : undefined

  return (
    <aside className="flex h-full min-h-0 w-72 shrink-0 overflow-hidden p-2">
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden ${panelBorderClass} ${panelSurfaceClass} rounded-lg px-3 py-3`}
      >
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

        <div className="mt-3 shrink-0 border-t border-[var(--neutral-divider)] pt-3">
          <ExportPanel nodes={nodes} edges={edges} />
        </div>
      </div>
    </aside>
  )
}
