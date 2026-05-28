import {
  Square,
  CurveArray,
  CursorPointer,
  Minus,
  SquareDashed,
  ArrowRight,
  NavArrowDown,
} from 'iconoir-react'
import { useState } from 'react'
import { themes, type ThemeName } from '../../tokens/colors'
import { uiTextStyle } from '../../tokens/typography'
import { writePaletteDragPayload } from '../../lib/paletteDrag'
import { panelActiveClass, panelDividerClass, panelHoverClass, panelPillClass } from '../../tokens/panel'
import type { CanvasTool } from '../../types/canvas'
import type { EdgeDirection, EdgeStrokeStyle } from '../../types/diagram'
import { BidirectionalArrowIcon } from './icons/BidirectionalArrowIcon'
import { GroupToolIcon } from './icons/GroupToolIcon'

type PaletteIcon = typeof Minus

const DEFAULT_BLOCK_ICON = 'Rhombus' as const
const DEFAULT_BLOCK_LABEL = 'BLOCK'

const ARROW_TOOLBAR_OPTIONS = ['one-way', 'both'] as const
type ArrowToolbarOption = (typeof ARROW_TOOLBAR_OPTIONS)[number]

type BlockPaletteProps = {
  activeTheme: ThemeName
  onThemeChange: (theme: ThemeName) => void
  canvasTool: CanvasTool
  onCanvasToolChange: (tool: CanvasTool) => void
  lineStrokeStyle: EdgeStrokeStyle
  onLineStrokeStyleChange: (strokeStyle: EdgeStrokeStyle) => void
  lineDirection: EdgeDirection
  onLineDirectionChange: (direction: EdgeDirection) => void
}

const themeOptions: ThemeName[] = ['blue', 'green', 'magenta']

const lineStyleIcons: Record<'solid', PaletteIcon> = {
  solid: Minus,
}

const lineStyleLabels: Record<EdgeStrokeStyle, string> = {
  solid: 'Solid line',
  dashed: 'Dashed line',
}

const directionIcons: Record<'one-way', PaletteIcon> = {
  'one-way': ArrowRight,
}

const directionLabels: Record<ArrowToolbarOption, string> = {
  'one-way': 'One-way arrow',
  both: 'Both ways',
}

function Divider() {
  return <div className={`mx-1 h-6 w-px ${panelDividerClass}`} />
}

function ToolbarIcon({
  icon: Icon,
  active,
  activeColor,
}: {
  icon: PaletteIcon
  active: boolean
  activeColor: string
}) {
  return (
    <Icon
      width={16}
      height={16}
      strokeWidth={1.5}
      color={active ? activeColor : 'var(--neutral-text-muted)'}
    />
  )
}

export function BlockPalette({
  activeTheme,
  onThemeChange,
  canvasTool,
  onCanvasToolChange,
  lineStrokeStyle,
  onLineStrokeStyleChange,
  lineDirection,
  onLineDirectionChange,
}: BlockPaletteProps) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const theme = themes[activeTheme]

  const toggleArrowDirection = (direction: ArrowToolbarOption) => {
    onLineDirectionChange(lineDirection === direction ? 'none' : direction)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4">
      <div className={`pointer-events-auto flex items-center gap-1 ${panelPillClass}`}>
        <div className="relative flex items-center gap-1 pr-1">
          <button
            type="button"
            onClick={() => setThemeMenuOpen((open) => !open)}
            className={`flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 ${panelHoverClass}`}
            aria-label="Choose theme color"
          >
            <span
              className="size-3.5 rounded-full"
              style={{ backgroundColor: theme.color }}
            />
            <NavArrowDown width={12} height={12} strokeWidth={1.5} color="var(--neutral-text-subtle)" />
          </button>

          {themeMenuOpen && (
            <div className={`absolute bottom-full left-0 mb-2 flex gap-2 rounded-full border border-[var(--neutral-border)] bg-white px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]`}>
              {themeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onThemeChange(option)
                    setThemeMenuOpen(false)
                  }}
                  className={`cursor-pointer rounded-full p-0.5 ${panelHoverClass}`}
                  aria-label={`Use ${themes[option].label} theme`}
                >
                  <span
                    className="block size-4 rounded-full"
                    style={{ backgroundColor: themes[option].color }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        <button
          type="button"
          onClick={() => onCanvasToolChange('select')}
          className={`flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors ${
            canvasTool === 'select' ? panelActiveClass : panelHoverClass
          }`}
          aria-label="Select tool"
          title="Select and move blocks"
        >
          <CursorPointer
            width={16}
            height={16}
            strokeWidth={1.5}
            color={
              canvasTool === 'select' ? theme.color : 'var(--neutral-text-muted)'
            }
          />
        </button>

        <button
          type="button"
          onClick={() => onCanvasToolChange('connect')}
          className={`flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors ${
            canvasTool === 'connect' ? panelActiveClass : panelHoverClass
          }`}
          aria-label="Connect tool"
          title="Connect blocks — drag from one handle to another"
        >
          <CurveArray
            width={16}
            height={16}
            strokeWidth={1.5}
            color={
              canvasTool === 'connect' ? theme.color : 'var(--neutral-text-muted)'
            }
          />
        </button>

        <button
          type="button"
          onClick={() => onCanvasToolChange('group')}
          className={`flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors ${
            canvasTool === 'group' ? panelActiveClass : panelHoverClass
          }`}
          aria-label="Group tool"
          title="Draw group regions on the canvas"
        >
          <SquareDashed
            width={16}
            height={16}
            strokeWidth={1.5}
            color={
              canvasTool === 'group' ? theme.color : 'var(--neutral-text-muted)'
            }
          />
        </button>

        <Divider />

        <button
          type="button"
          draggable
          onDragStart={(event) =>
            writePaletteDragPayload(event, {
              kind: 'asset',
              icon: DEFAULT_BLOCK_ICON,
              theme: activeTheme,
              label: DEFAULT_BLOCK_LABEL,
            })
          }
          className={`flex cursor-grab items-center justify-center rounded-md p-2 active:cursor-grabbing ${panelHoverClass}`}
          aria-label="Drag block"
          title="Drag block onto canvas (diamond icon)"
        >
          <Square
            width={16}
            height={16}
            strokeWidth={1.5}
            color="var(--neutral-text-muted)"
          />
        </button>

        <Divider />

        <button
          type="button"
          onClick={() => onLineStrokeStyleChange('solid')}
          className={`flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors ${
            lineStrokeStyle === 'solid' ? panelActiveClass : panelHoverClass
          }`}
          aria-label={lineStyleLabels.solid}
          title={`${lineStyleLabels.solid} for new connections`}
        >
          <ToolbarIcon
            icon={lineStyleIcons.solid}
            active={lineStrokeStyle === 'solid'}
            activeColor={theme.color}
          />
        </button>

        <button
          type="button"
          onClick={() => onLineStrokeStyleChange('dashed')}
          className={`flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors ${
            lineStrokeStyle === 'dashed' ? panelActiveClass : panelHoverClass
          }`}
          aria-label={lineStyleLabels.dashed}
          title={`${lineStyleLabels.dashed} for new connections`}
        >
          <GroupToolIcon
            color={
              lineStrokeStyle === 'dashed'
                ? theme.color
                : 'var(--neutral-text-muted)'
            }
          />
        </button>

        <Divider />

        <button
          type="button"
          onClick={() => toggleArrowDirection('one-way')}
          className={`flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors ${
            lineDirection === 'one-way' ? panelActiveClass : panelHoverClass
          }`}
          aria-label={directionLabels['one-way']}
          title={`${directionLabels['one-way']} for new connections (click again to clear)`}
        >
          <ToolbarIcon
            icon={directionIcons['one-way']}
            active={lineDirection === 'one-way'}
            activeColor={theme.color}
          />
        </button>

        <button
          type="button"
          onClick={() => toggleArrowDirection('both')}
          className={`flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors ${
            lineDirection === 'both' ? panelActiveClass : panelHoverClass
          }`}
          aria-label={directionLabels.both}
          title={`${directionLabels.both} for new connections (click again to clear)`}
        >
          <BidirectionalArrowIcon
            color={
              lineDirection === 'both'
                ? theme.color
                : 'var(--neutral-text-muted)'
            }
          />
        </button>
      </div>

      {canvasTool === 'connect' && (
        <div
          className="pointer-events-none absolute bottom-16 rounded-full border border-[var(--neutral-border)] bg-white px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
          style={uiTextStyle}
        >
          <span className="text-[9px] text-[var(--neutral-text-muted)]">
            Drag between block handles. Draw the return line on the same path to
            make it both ways, or use the line inspector.
          </span>
        </div>
      )}

      {canvasTool === 'group' && (
        <div
          className="pointer-events-none absolute bottom-16 rounded-full border border-[var(--neutral-border)] bg-white px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
          style={uiTextStyle}
        >
          <span className="text-[9px] text-[var(--neutral-text-muted)]">
            Drag on the canvas to draw a group. Blocks inside are added
            automatically. Middle-click or right-click to pan.
          </span>
        </div>
      )}
    </div>
  )
}
