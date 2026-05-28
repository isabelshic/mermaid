import type { Node } from '@xyflow/react'
import { useState } from 'react'
import { uiLabelStyle, uiTextStyle, uiTitleStyle } from '../../tokens/typography'
import type { AssetNodeData, GroupNodeData } from '../../types/diagram'
import type { ThemeName } from '../../tokens/colors'
import { themes } from '../../tokens/colors'
import {
  formatIconLabel,
  getIcon,
  normalizeIconName,
} from '../../lib/icons'
import { useDiagramUi } from '../../context/DiagramUiContext'
import {
  panelButtonClass,
  panelHoverClass,
  panelInputClass,
} from '../../tokens/panel'

export type SelectedDiagramNode = Node<AssetNodeData | GroupNodeData>

type NodeInspectorProps = {
  selectedNode: SelectedDiagramNode | null
  selectedNodes: Node[]
  onUpdateLabel: (nodeId: string, label: string) => void
  onUpdateUrl: (nodeId: string, url: string) => void
  onUpdateTheme: (nodeId: string, theme: ThemeName) => void
  onGroupSelection: (label: string, theme: ThemeName) => void
}

function getEditableAssets(selectedNodes: Node[]): Node<AssetNodeData>[] {
  return selectedNodes.filter(
    (node): node is Node<AssetNodeData> =>
      node.type === 'asset' && !node.parentId,
  )
}

function getSelectedGroups(selectedNodes: Node[]): Node<GroupNodeData>[] {
  return selectedNodes.filter(
    (node): node is Node<GroupNodeData> => node.type === 'group',
  )
}

export function NodeInspector({
  selectedNode,
  selectedNodes,
  onUpdateLabel,
  onUpdateUrl,
  onUpdateTheme,
  onGroupSelection,
}: NodeInspectorProps) {
  const { openIconPicker } = useDiagramUi()
  const groupableAssets = getEditableAssets(selectedNodes)
  const selectedGroups = getSelectedGroups(selectedNodes)
  const canGroup = groupableAssets.length >= 2
  const singleGroup =
    selectedGroups.length === 1 && selectedNodes.length === 1
      ? selectedGroups[0]
      : null
  const inspectorNode =
    singleGroup ?? (selectedNode?.type === 'group' ? selectedNode : selectedNode)

  if (!inspectorNode && !canGroup) {
    return (
      <div className="p-1">
        <div style={uiTextStyle} className="text-[13px] text-[var(--neutral-text-faint)]">
          Hold Shift and click to multi-select, or Shift-drag on the canvas.
          ⌘Z undo, ⇧⌘Z redo, ⌘C copy, ⌘V paste. Double-click a name to rename.
        </div>
      </div>
    )
  }

  if (!inspectorNode && canGroup) {
    return (
      <GroupSelectionPanel
        count={groupableAssets.length}
        onGroupSelection={onGroupSelection}
      />
    )
  }

  if (!inspectorNode) {
    return null
  }

  const isGroup = inspectorNode.type === 'group'
  const data = inspectorNode.data
  const theme = themes[data.theme]
  const assetData = !isGroup ? (data as AssetNodeData) : null
  const CurrentIcon = assetData ? getIcon(assetData.icon) : null
  const currentIconName = assetData
    ? normalizeIconName(assetData.icon)
    : null

  return (
    <div className="flex flex-col gap-3 p-1">
      <div style={uiTitleStyle} className="text-[13px] text-[var(--neutral-text)]">
        {isGroup ? 'Group Inspector' : 'Block Inspector'}
      </div>

      {selectedNodes.length > 1 && (
        <div style={uiTextStyle} className="text-[9px] text-[var(--neutral-text-subtle)]">
          {selectedNodes.length} elements selected
        </div>
      )}

      {assetData && CurrentIcon && currentIconName && (
        <div className="flex flex-col gap-1">
          <div style={uiLabelStyle} className="text-[10px] text-[var(--neutral-text-subtle)]">
            Icon
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex size-10 shrink-0 items-center justify-center border border-dashed"
              style={{
                borderColor: theme.color,
                backgroundColor: theme.fill,
              }}
            >
              <CurrentIcon
                width={18}
                height={18}
                strokeWidth={1.5}
                color={theme.color}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div style={uiLabelStyle} className="truncate text-[10px] text-[var(--neutral-text-muted)]">
                {formatIconLabel(currentIconName)}
              </div>
              <button
                type="button"
                onClick={() => openIconPicker(inspectorNode.id)}
                className={`mt-1 ${panelButtonClass} w-full px-2 py-1.5 text-[13px] text-[var(--neutral-text)]`}
                style={uiTextStyle}
              >
                Change icon
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label
          htmlFor="node-label"
          style={uiLabelStyle}
          className="text-[10px] text-[var(--neutral-text-subtle)]"
        >
          {isGroup ? 'Group name' : 'Label'}
        </label>
        <input
          id="node-label"
          type="text"
          value={
            isGroup
              ? (data as GroupNodeData).label
              : ((data as AssetNodeData).label ?? '')
          }
          onChange={(event) =>
            onUpdateLabel(inspectorNode.id, event.target.value.toUpperCase())
          }
          className={`${panelInputClass} text-[11px] text-[var(--neutral-text)]`}
          style={{ color: theme.color, ...uiLabelStyle }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div style={uiLabelStyle} className="text-[10px] text-[var(--neutral-text-subtle)]">
          Color
        </div>
        <div className="flex gap-2">
          {(['blue', 'green', 'magenta'] as ThemeName[]).map((themeName) => (
            <button
              key={themeName}
              type="button"
              onClick={() => onUpdateTheme(inspectorNode.id, themeName)}
              className={`cursor-pointer rounded-full p-0.5 ${panelHoverClass} ${
                data.theme === themeName ? 'ring-1 ring-[var(--neutral-text-faint)]' : ''
              }`}
              aria-label={`Use ${themes[themeName].label} color`}
            >
              <span
                className="block size-4 rounded-full"
                style={{ backgroundColor: themes[themeName].color }}
              />
            </button>
          ))}
        </div>
      </div>

      {!isGroup && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="block-url"
            style={uiLabelStyle}
            className="text-[10px] text-[var(--neutral-text-subtle)]"
          >
            Page URL
          </label>
          <input
            id="block-url"
            type="url"
            value={(data as AssetNodeData).url ?? ''}
            onChange={(event) => onUpdateUrl(inspectorNode.id, event.target.value)}
            placeholder="https://example.com/page"
            className={`${panelInputClass} text-[10px] normal-case tracking-normal text-[var(--neutral-text)]`}
          />
        </div>
      )}

      {selectedGroups.length > 1 && (
        <div style={uiTextStyle} className="text-[9px] text-[var(--neutral-text-subtle)]">
          Select a single group to rename it
        </div>
      )}

      {canGroup && (
        <GroupSelectionPanel
          count={groupableAssets.length}
          onGroupSelection={onGroupSelection}
        />
      )}
    </div>
  )
}

function GroupSelectionPanel({
  count,
  onGroupSelection,
}: {
  count: number
  onGroupSelection: (label: string, theme: ThemeName) => void
}) {
  const [groupLabel, setGroupLabel] = useState('GROUP')
  const [groupTheme, setGroupTheme] = useState<ThemeName>('blue')

  return (
    <div className="flex flex-col gap-2 border-t border-[var(--neutral-divider)] pt-3">
      <div style={uiLabelStyle} className="text-[10px] text-[var(--neutral-text-subtle)]">
        {count} blocks selected
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="group-label"
          style={uiLabelStyle}
          className="text-[10px] text-[var(--neutral-text-subtle)]"
        >
          Group label
        </label>
        <input
          id="group-label"
          type="text"
          value={groupLabel}
          onChange={(event) => setGroupLabel(event.target.value.toUpperCase())}
          className={`${panelInputClass} text-[11px] text-[var(--neutral-text)]`}
          style={uiLabelStyle}
        />
      </div>

      <div className="flex gap-2">
        {(['blue', 'green', 'magenta'] as ThemeName[]).map((themeName) => (
          <button
            key={themeName}
            type="button"
            onClick={() => setGroupTheme(themeName)}
            className={`cursor-pointer rounded-full p-0.5 ${panelHoverClass} ${
              groupTheme === themeName ? 'ring-1 ring-[var(--neutral-text-faint)]' : ''
            }`}
            aria-label={`Group with ${themes[themeName].label} theme`}
          >
            <span
              className="block size-4 rounded-full"
              style={{ backgroundColor: themes[themeName].color }}
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onGroupSelection(groupLabel, groupTheme)}
        className={`${panelButtonClass} text-[13px] text-[var(--neutral-text)]`}
        style={uiTextStyle}
      >
        Group blocks
      </button>
    </div>
  )
}
