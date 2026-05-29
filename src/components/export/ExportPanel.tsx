import type { Edge, Node } from '@xyflow/react'
import { downloadMermaid, toMermaid } from '../../lib/export/toMermaid'
import { downloadJson, toSchema } from '../../lib/export/toSchema'
import { uiLabelStyle } from '../../tokens/typography'
import { panelButtonClass } from '../../tokens/panel'
import { CollapsibleSection } from './CollapsibleSection'

type ExportPanelProps = {
  nodes: Node[]
  edges: Edge[]
}

export function ExportPanel({ nodes, edges }: ExportPanelProps) {
  return (
    <CollapsibleSection title="Export" defaultOpen={false}>
      <button
        type="button"
        onClick={() => downloadMermaid(toMermaid(nodes, edges))}
        className={`${panelButtonClass} text-[10px] text-[var(--neutral-text)]`}
        style={uiLabelStyle}
      >
        Download Mermaid (.mmd)
      </button>
      <button
        type="button"
        onClick={() => downloadJson(toSchema(nodes, edges))}
        className={`${panelButtonClass} text-[10px] text-[var(--neutral-text)]`}
        style={uiLabelStyle}
      >
        Download JSON (.json)
      </button>
    </CollapsibleSection>
  )
}
