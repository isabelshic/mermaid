import { useEffect, useRef, useState, type ChangeEvent, type RefObject } from 'react'
import { NavArrowDown, Plus, Trash } from 'iconoir-react'
import type { Edge, Node } from '@xyflow/react'
import { DiagramParseError } from '../../lib/import/fromSchema'
import { fromMermaid } from '../../lib/import/fromMermaid'
import { parseDiagramJson } from '../../lib/import/fromSchema'
import type { SaveStatus } from '../../hooks/useProjectSession'
import type { ProjectMeta } from '../../types/project'
import { uiLabelStyle, uiTextStyle, uiTitleStyle } from '../../tokens/typography'
import {
  panelButtonClass,
  panelCardClass,
  panelHoverClass,
  panelSelectedClass,
  panelShadowClass,
} from '../../tokens/panel'

type ProjectMenuProps = {
  activeProjectId: string
  activeProjectName: string
  projects: ProjectMeta[]
  saveStatus: SaveStatus
  onSwitchProject: (projectId: string) => void
  onCreateProject: () => void
  onRenameProject: (name: string) => void
  onDeleteProject: (projectId: string) => void
  onImportDiagram: (nodes: Node[], edges: Edge[], name: string) => void
  jsonInputRef?: RefObject<HTMLInputElement | null>
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)

  if (diffMinutes < 1) {
    return 'Just now'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function ProjectMenu({
  activeProjectId,
  activeProjectName,
  projects,
  saveStatus,
  onSwitchProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onImportDiagram,
  jsonInputRef: externalJsonInputRef,
}: ProjectMenuProps) {
  const [expanded, setExpanded] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [draftName, setDraftName] = useState(activeProjectName)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const internalJsonInputRef = useRef<HTMLInputElement>(null)
  const mermaidInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = externalJsonInputRef ?? internalJsonInputRef

  useEffect(() => {
    setDraftName(activeProjectName)
    setIsEditingName(false)
  }, [activeProjectName])

  useEffect(() => {
    if (!isEditingName) {
      return
    }
    nameInputRef.current?.focus()
    nameInputRef.current?.select()
  }, [isEditingName])

  const commitRename = () => {
    setIsEditingName(false)
    const trimmed = draftName.trim()
    if (!trimmed) {
      setDraftName(activeProjectName)
      return
    }
    if (trimmed !== activeProjectName) {
      onRenameProject(trimmed)
    }
  }

  const cancelRename = () => {
    setIsEditingName(false)
    setDraftName(activeProjectName)
  }

  const startEditingName = () => {
    setDraftName(activeProjectName)
    setIsEditingName(true)
  }

  const handleOpenJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    try {
      const text = await readFileAsText(file)
      const diagram = parseDiagramJson(JSON.parse(text))
      const name = file.name.replace(/\.json$/i, '') || 'Imported'
      onImportDiagram(diagram.nodes, diagram.edges, name)
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(
        error instanceof DiagramParseError
          ? error.message
          : 'Could not open JSON file.',
      )
    }
  }

  const handleOpenMermaid = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    try {
      const text = await readFileAsText(file)
      const diagram = fromMermaid(text)
      const name = file.name.replace(/\.mmd$/i, '') || 'Imported'
      onImportDiagram(diagram.nodes, diagram.edges, name)
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(
        error instanceof DiagramParseError
          ? error.message
          : 'Could not open Mermaid file.',
      )
    }
  }

  const handleDeleteActive = () => {
    if (projects.length <= 1) {
      return
    }
    if (
      !window.confirm(`Delete "${activeProjectName}"? This cannot be undone.`)
    ) {
      return
    }
    onDeleteProject(activeProjectId)
  }

  return (
    <div
      className={`pointer-events-auto flex w-[min(100vw-2rem,18rem)] flex-col ${panelCardClass} ${panelShadowClass}`}
    >
      <div className="flex w-full items-center gap-2 px-1 py-0.5">
        <div className="min-w-0 flex-1 text-left">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={commitRename}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitRename()
                }
                if (event.key === 'Escape') {
                  event.preventDefault()
                  cancelRename()
                }
              }}
              className="w-full rounded-sm border border-[var(--neutral-border)] bg-white px-1 py-0.5 text-[13px] text-[var(--neutral-text)] outline-none focus:border-[#0066ff]"
              style={{ ...uiTitleStyle, fontWeight: 500 }}
              aria-label="Project name"
            />
          ) : (
            <div
              style={{ ...uiTitleStyle, fontWeight: 500 }}
              className="cursor-text truncate text-[13px] text-[var(--neutral-text)]"
              onDoubleClick={startEditingName}
              title="Double-click to rename"
            >
              {activeProjectName}
            </div>
          )}
          <div
            style={uiTextStyle}
            className="text-[11px] text-[var(--neutral-text-faint)]"
          >
            {saveStatus === 'saving' ? 'Saving…' : 'Saved automatically'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={`flex shrink-0 cursor-pointer items-center justify-center rounded-md p-1 ${panelHoverClass}`}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse projects' : 'Expand projects'}
        >
          <NavArrowDown
            width={14}
            height={14}
            strokeWidth={1.5}
            color="var(--neutral-text-subtle)"
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3 pt-3">
          <div className="flex flex-col gap-1">
            <div
              style={uiLabelStyle}
              className="text-[10px] text-[var(--neutral-textSubtle)]"
            >
              Recent projects
            </div>
            <ul className="max-h-48 overflow-y-auto rounded-md">
              {projects.map((project) => {
                const isActive = project.id === activeProjectId
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => onSwitchProject(project.id)}
                      className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left transition-colors outline-none ${
                        isActive ? panelSelectedClass : panelHoverClass
                      }`}
                    >
                      <span
                        style={{ ...uiTextStyle, fontWeight: 500 }}
                        className="truncate text-[13px] text-[var(--neutral-text)]"
                      >
                        {project.name}
                      </span>
                      <span
                        className="shrink-0 text-[9px] text-[var(--neutral-text-faint)]"
                        style={{
                          fontFamily: 'var(--font-diagram)',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {formatRelativeTime(project.updatedAt)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onCreateProject}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent bg-[var(--theme-blue)] px-3 py-2 text-[10px] text-white transition-colors hover:bg-[#0052cc]"
              style={uiLabelStyle}
            >
              <Plus width={14} height={14} strokeWidth={1.5} color="currentColor" />
              New project
            </button>
            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              className={`${panelButtonClass} rounded-md text-[10px] text-[var(--neutral-text)]`}
              style={uiLabelStyle}
            >
              Open JSON…
            </button>
            <button
              type="button"
              onClick={() => mermaidInputRef.current?.click()}
              className={`${panelButtonClass} rounded-md text-[10px] text-[var(--neutral-text)]`}
              style={uiLabelStyle}
            >
              Open Mermaid…
            </button>
            {projects.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteActive}
                className={`${panelButtonClass} flex items-center justify-center gap-1.5 rounded-md text-[10px] text-[var(--danger-text,#b42318)]`}
                style={uiLabelStyle}
              >
                <Trash width={14} height={14} strokeWidth={1.5} />
                Delete project
              </button>
            )}
          </div>

          {errorMessage && (
            <p
              className="text-[10px] leading-snug text-[var(--danger-text,#b42318)]"
              style={uiLabelStyle}
            >
              {errorMessage}
            </p>
          )}

          <input
            ref={jsonInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleOpenJson}
          />
          <input
            ref={mermaidInputRef}
            type="file"
            accept=".mmd,text/plain"
            className="hidden"
            onChange={handleOpenMermaid}
          />
        </div>
      )}
    </div>
  )
}
