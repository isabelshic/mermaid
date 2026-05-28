import { useMemo, useState } from 'react'
import { NavArrowLeft } from 'iconoir-react'
import { uiLabelStyle, uiTextStyle, uiTitleStyle } from '../../tokens/typography'
import { themes, type ThemeName } from '../../tokens/colors'
import type { AssetNodeData } from '../../types/diagram'
import type { Node } from '@xyflow/react'
import {
  formatIconLabel,
  getIcon,
  iconNames,
  normalizeIconName,
  searchIcons,
  type IconName,
} from '../../lib/icons'
import { panelBorderClass, panelHoverClass, panelInputClass, panelSelectedClass } from '../../tokens/panel'

type IconPickerPanelProps = {
  node: Node<AssetNodeData>
  onUpdateIcon: (nodeId: string, icon: IconName) => void
  onUpdateTheme: (nodeId: string, theme: ThemeName) => void
  onClose: () => void
}

export function IconPickerPanel({
  node,
  onUpdateIcon,
  onUpdateTheme,
  onClose,
}: IconPickerPanelProps) {
  const [query, setQuery] = useState('')
  const theme = themes[node.data.theme]
  const filteredIcons = useMemo(() => searchIcons(query), [query])
  const CurrentIcon = getIcon(node.data.icon)
  const currentIconName = normalizeIconName(node.data.icon)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--neutral-divider)] pb-3">
        <button
          type="button"
          onClick={onClose}
          className={`flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1 text-[var(--neutral-text-muted)] ${panelHoverClass}`}
          aria-label="Back to inspector"
        >
          <NavArrowLeft width={14} height={14} strokeWidth={1.5} />
        </button>
        <div style={uiTitleStyle} className="text-[13px] text-[var(--neutral-text)]">
          Block style
        </div>
      </div>

      <div className="flex flex-col gap-3 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex size-[52px] items-center justify-center border border-dashed"
            style={{
              borderColor: theme.color,
              backgroundColor: theme.fill,
            }}
          >
            <CurrentIcon
              width={22}
              height={22}
              strokeWidth={1.5}
              color={theme.color}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div style={uiLabelStyle} className="truncate text-[11px] text-[var(--neutral-text)]">
              {node.data.label ?? node.id}
            </div>
            <div style={uiLabelStyle} className="text-[10px] text-[var(--neutral-text-subtle)]">
              {formatIconLabel(currentIconName)}
            </div>
          </div>
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
                onClick={() => onUpdateTheme(node.id, themeName)}
                className={`cursor-pointer rounded-full p-0.5 ${panelHoverClass} ${
                  node.data.theme === themeName ? 'ring-1 ring-[var(--neutral-text-faint)]' : ''
                }`}
                aria-label={`Use ${themes[themeName].label} color`}
              >
                <span
                  className="block size-5 rounded-full"
                  style={{ backgroundColor: themes[themeName].color }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="icon-search"
            style={uiLabelStyle}
            className="text-[10px] text-[var(--neutral-text-subtle)]"
          >
            Search icons
          </label>
          <input
            id="icon-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="hospital, heart, lab, cloud..."
            className={`${panelInputClass} text-[10px] normal-case tracking-normal text-[var(--neutral-text)]`}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-1">
        <div className="grid grid-cols-4 gap-2">
          {filteredIcons.map((iconName) => {
            const Icon = getIcon(iconName)
            const isActive = currentIconName === iconName

            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onUpdateIcon(node.id, iconName)}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border px-1 py-2 transition-colors ${
                  isActive
                    ? 'border-[#0066ff] ' + panelSelectedClass
                    : `${panelBorderClass} bg-transparent ${panelHoverClass}`
                }`}
                title={formatIconLabel(iconName)}
              >
                <Icon
                  width={18}
                  height={18}
                  strokeWidth={1.5}
                  color={isActive ? theme.color : 'var(--neutral-text-muted)'}
                />
                <span
                  style={uiLabelStyle}
                  className="w-full truncate text-center text-[8px] text-[var(--neutral-text-subtle)]"
                >
                  {formatIconLabel(iconName).split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>

        {filteredIcons.length === 0 && (
          <div style={uiTextStyle} className="py-6 text-center text-[9px] text-[var(--neutral-text-faint)]">
            No icons match &quot;{query}&quot;
          </div>
        )}

        {!query && (
          <div style={uiTextStyle} className="pt-3 text-[8px] text-[var(--neutral-text-disabled)]">
            {iconNames.length} iconoir icons
          </div>
        )}
      </div>
    </div>
  )
}
