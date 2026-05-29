import { useState } from 'react'
import type { Edge, Node } from '@xyflow/react'
import { downloadMermaid, toMermaid } from '../../lib/export/toMermaid'
import { downloadJson, toSchema } from '../../lib/export/toSchema'
import { uiLabelStyle } from '../../tokens/typography'
import { panelButtonClass } from '../../tokens/panel'
import { CollapsibleSection } from './CollapsibleSection'

type ExportPanelProps = {
  nodes: Node[]
  edges: Edge[]
  onExportSvg?: () => Promise<void>
}

export function ExportPanel({ nodes, edges, onExportSvg }: ExportPanelProps) {
  const [exportingSvg, setExportingSvg] = useState(false)

  const handleExportSvg = async () => {
    if (!onExportSvg || exportingSvg) {
      return
    }

    setExportingSvg(true)
    try {
      await onExportSvg()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'SVG export failed.'
      window.alert(message)
    } finally {
      setExportingSvg(false)
    }
  }

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
      <button
        type="button"
        onClick={handleExportSvg}
        disabled={!onExportSvg || exportingSvg || nodes.length === 0}
        className={`${panelButtonClass} text-[10px] text-[var(--neutral-text)] disabled:cursor-not-allowed disabled:opacity-50`}
        style={uiLabelStyle}
      >
        {exportingSvg ? 'Exporting SVG…' : 'Download SVG (.svg)'}
      </button>
    </CollapsibleSection>
  )
}
