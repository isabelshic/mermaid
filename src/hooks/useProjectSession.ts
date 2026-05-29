import { useCallback, useEffect, useRef, useState } from 'react'
import type { Edge, Node } from '@xyflow/react'
import {
  AUTOSAVE_DELAY_MS,
  createProject,
  deleteProject,
  importProjectDocument,
  renameProject,
  saveProjectDiagram,
  setActiveProjectId,
} from '../lib/projects/projectStore'
import { normalizeBidirectionalEdges } from '../lib/edges'
import { fromSchema } from '../lib/import/fromSchema'
import type { DiagramDocument } from '../types/diagram'
import type { ProjectMeta, ProjectSession } from '../types/project'

export type SaveStatus = 'saved' | 'saving'

type UseProjectSessionOptions = {
  initialSession: ProjectSession
  nodes: Node[]
  edges: Edge[]
  replaceDiagram: (nodes: Node[], edges: Edge[]) => void
}

export function useProjectSession({
  initialSession,
  nodes,
  edges,
  replaceDiagram,
}: UseProjectSessionOptions) {
  const [activeProjectId, setActiveProjectIdState] = useState(
    initialSession.activeProjectId,
  )
  const [activeProjectName, setActiveProjectName] = useState(
    initialSession.activeProjectName,
  )
  const [projects, setProjects] = useState<ProjectMeta[]>(initialSession.projects)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')

  const isFirstRender = useRef(true)
  const isSwitchingProject = useRef(false)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (isSwitchingProject.current) {
      isSwitchingProject.current = false
      return
    }

    setSaveStatus('saving')
    const timeoutId = window.setTimeout(() => {
      const updatedProjects = saveProjectDiagram(activeProjectId, nodes, edges)
      setProjects(updatedProjects)
      setSaveStatus('saved')
    }, AUTOSAVE_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [activeProjectId, nodes, edges])

  const applySession = useCallback(
    (session: ProjectSession) => {
      isSwitchingProject.current = true
      const diagram = fromSchema(session.document)
      setActiveProjectIdState(session.activeProjectId)
      setActiveProjectName(session.activeProjectName)
      setProjects(session.projects)
      replaceDiagram(
        diagram.nodes,
        normalizeBidirectionalEdges(diagram.edges),
      )
      setSaveStatus('saved')
    },
    [replaceDiagram],
  )

  const switchToProject = useCallback(
    (projectId: string) => {
      if (projectId === activeProjectId) {
        return
      }
      saveProjectDiagram(activeProjectId, nodes, edges)
      applySession(setActiveProjectId(projectId))
    },
    [activeProjectId, applySession, edges, nodes],
  )

  const createNewProject = useCallback(() => {
    saveProjectDiagram(activeProjectId, nodes, edges)
    applySession(createProject(nodes, edges))
  }, [activeProjectId, applySession, edges, nodes])

  const renameActiveProject = useCallback(
    (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) {
        return
      }
      const updatedProjects = renameProject(activeProjectId, trimmed)
      setActiveProjectName(trimmed)
      setProjects(updatedProjects)
    },
    [activeProjectId],
  )

  const removeProject = useCallback(
    (projectId: string) => {
      saveProjectDiagram(activeProjectId, nodes, edges)
      const session = deleteProject(projectId)
      if (!session) {
        return false
      }
      applySession(session)
      return true
    },
    [activeProjectId, applySession, edges, nodes],
  )

  const importProject = useCallback(
    (document: DiagramDocument, name: string) => {
      saveProjectDiagram(activeProjectId, nodes, edges)
      applySession(importProjectDocument(document, name, nodes, edges))
    },
    [activeProjectId, applySession, edges, nodes],
  )

  return {
    activeProjectId,
    activeProjectName,
    projects,
    saveStatus,
    switchToProject,
    createNewProject,
    renameActiveProject,
    removeProject,
    importProject,
  }
}
