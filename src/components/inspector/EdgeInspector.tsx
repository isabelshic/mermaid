import type { Edge } from '@xyflow/react'
import { uiLabelStyle, uiTextStyle, uiTitleStyle } from '../../tokens/typography'
import type { EdgeDirection, EdgeStrokeStyle } from '../../types/diagram'
import { panelBorderClass, panelHoverClass, panelSelectedClass } from '../../tokens/panel'
import { getEdgeDirection } from '../../lib/edges'

type EdgeInspectorProps = {
  selectedEdges: Edge[]
  onUpdateStrokeStyle: (strokeStyle: EdgeStrokeStyle) => void
  onUpdateDirection: (direction: EdgeDirection) => void
}

function LinePreview({
  strokeStyle,
  active,
  direction,
}: {
  strokeStyle: EdgeStrokeStyle
  active: boolean
  direction: EdgeDirection
}) {
  const color = active ? '#0066ff' : 'var(--neutral-text-muted)'
  const hasStartArrow = direction === 'both'
  const hasEndArrow = direction !== 'none'

  return (
    <svg width="28" height="12" aria-hidden="true">
      <line
        x1={hasStartArrow ? 4 : 2}
        y1="6"
        x2={hasEndArrow ? 24 : 26}
        y2="6"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={strokeStyle === 'dashed' ? '4 3' : undefined}
      />
      {hasStartArrow && (
        <polyline
          points="4,6 7,4 7,8"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
        />
      )}
      {hasEndArrow && (
        <polyline
          points="24,6 21,4 21,8"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
        />
      )}
    </svg>
  )
}

const directionOptions = [
  { direction: 'none' as const, label: 'None' },
  { direction: 'one-way' as const, label: 'One-way' },
  { direction: 'both' as const, label: 'Both ways' },
]

export function EdgeInspector({
  selectedEdges,
  onUpdateStrokeStyle,
  onUpdateDirection,
}: EdgeInspectorProps) {
  const currentStyle =
    (selectedEdges[0]?.data as { strokeStyle?: EdgeStrokeStyle } | undefined)
      ?.strokeStyle ?? 'dashed'
  const currentDirection = selectedEdges[0]
    ? getEdgeDirection(selectedEdges[0].data)
    : 'one-way'

  return (
    <div className="flex flex-col gap-3 p-1">
      <div style={uiTitleStyle} className="text-[13px] text-[var(--neutral-text)]">
        Line Inspector
      </div>

      {selectedEdges.length > 1 && (
        <div style={uiTextStyle} className="text-[9px] text-[var(--neutral-text-subtle)]">
          {selectedEdges.length} lines selected
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div style={uiLabelStyle} className="text-[10px] text-[var(--neutral-text-subtle)]">
          Direction
        </div>
        <div className="flex gap-2">
          {directionOptions.map(({ direction, label }) => (
            <button
              key={direction}
              type="button"
              onClick={() => onUpdateDirection(direction)}
              className={`flex cursor-pointer flex-1 flex-col items-center gap-1 rounded-md border px-2 py-2 transition-colors ${
                currentDirection === direction
                  ? 'border-[#0066ff] ' + panelSelectedClass
                  : `${panelBorderClass} bg-transparent ${panelHoverClass}`
              }`}
              aria-label={label}
            >
              <LinePreview
                strokeStyle={currentStyle}
                active={currentDirection === direction}
                direction={direction}
              />
              <span style={uiLabelStyle} className="text-[9px] text-[var(--neutral-text-subtle)]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div style={uiLabelStyle} className="text-[10px] text-[var(--neutral-text-subtle)]">
          Line style
        </div>
        <div className="flex gap-2">
          {(['dashed', 'solid'] as EdgeStrokeStyle[]).map((strokeStyle) => (
            <button
              key={strokeStyle}
              type="button"
              onClick={() => onUpdateStrokeStyle(strokeStyle)}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border px-2 py-2 transition-colors ${
                currentStyle === strokeStyle
                  ? 'border-[#0066ff] ' + panelSelectedClass
                  : `${panelBorderClass} bg-transparent ${panelHoverClass}`
              }`}
              aria-label={`${strokeStyle} line`}
            >
              <LinePreview
                strokeStyle={strokeStyle}
                active={currentStyle === strokeStyle}
                direction={currentDirection}
              />
              <span style={uiLabelStyle} className="text-[9px] text-[var(--neutral-text-subtle)]">
                {strokeStyle}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
