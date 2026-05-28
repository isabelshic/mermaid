import type { Edge, Node } from '@xyflow/react'
import { downloadMermaid, toMermaid } from '../../lib/export/toMermaid'
import { downloadJson, toSchema } from '../../lib/export/toSchema'
import { uiTextStyle, uiTitleStyle } from '../../tokens/typography'
import { panelButtonClass } from '../../tokens/panel'

type ExportPanelProps = {
  nodes: Node[]
  edges: Edge[]
}

export function ExportPanel({ nodes, edges }: ExportPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <div style={uiTitleStyle} className="text-[13px] text-[var(--neutral-text)]">
        Export
      </div>
      <button
        type="button"
        onClick={() => downloadMermaid(toMermaid(nodes, edges))}
        className={`${panelButtonClass} text-[13px] text-[var(--neutral-text)]`}
        style={uiTextStyle}
      >
        Download Mermaid (.mmd)
      </button>
      <button
        type="button"
        onClick={() => downloadJson(toSchema(nodes, edges))}
        className={`${panelButtonClass} text-[13px] text-[var(--neutral-text)]`}
        style={uiTextStyle}
      >
        Download JSON (.json)
      </button>
    </div>
  )
}
