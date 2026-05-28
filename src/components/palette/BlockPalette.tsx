import {
  Square,
  CurveArray,
  CursorPointer,
  SquareDashed,
  NavArrowDown,
} from 'iconoir-react'
import { useState } from 'react'
import { themes, type ThemeName } from '../../tokens/colors'
import { uiTextStyle } from '../../tokens/typography'
import { writePaletteDragPayload } from '../../lib/paletteDrag'
import { panelActiveClass, panelDividerClass, panelHoverClass, panelPillClass } from '../../tokens/panel'
import type { CanvasTool } from '../../types/canvas'
import type { EdgeDirection, EdgeStrokeStyle } from '../../types/diagram'
import {
  EdgeDirectionIcon,
  EdgeStrokeIcon,
  edgeDirectionLabels,
  edgeStrokeLabels,
} from './edgeToolbarIcons'

const DEFAULT_BLOCK_ICON = 'Rhombus' as const
const DEFAULT_BLOCK_LABEL = 'BLOCK'

const DIRECTION_TOOLBAR_OPTIONS = ['none', 'one-way', 'both'] as const

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

function Divider() {
  return <div className={`mx-1 h-6 w-px ${panelDividerClass}`} />
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
          aria-label={edgeStrokeLabels.solid}
          title={edgeStrokeLabels.solid}
        >
          <EdgeStrokeIcon
            strokeStyle="solid"
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
          aria-label={edgeStrokeLabels.dashed}
          title={edgeStrokeLabels.dashed}
        >
          <EdgeStrokeIcon
            strokeStyle="dashed"
            active={lineStrokeStyle === 'dashed'}
            activeColor={theme.color}
          />
        </button>

        <Divider />

        {DIRECTION_TOOLBAR_OPTIONS.map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => onLineDirectionChange(direction)}
            className={`flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors ${
              lineDirection === direction ? panelActiveClass : panelHoverClass
            }`}
            aria-label={edgeDirectionLabels[direction]}
            title={edgeDirectionLabels[direction]}
          >
            <EdgeDirectionIcon
              direction={direction}
              active={lineDirection === direction}
              activeColor={theme.color}
            />
          </button>
        ))}
      </div>

      {canvasTool === 'connect' && (
        <div
          className="pointer-events-none absolute bottom-16 rounded-full border border-[var(--neutral-border)] bg-white px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
          style={uiTextStyle}
        >
          <span className="text-[9px] text-[var(--neutral-text-muted)]">
            Drag between block handles. Use the toolbar to set arrow direction
            and line style before or after connecting.
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
