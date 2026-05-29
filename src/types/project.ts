import type { DiagramDocument } from './diagram'

export type ProjectMeta = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type StoredProject = {
  meta: ProjectMeta
  document: DiagramDocument
}

export type ProjectStore = {
  version: '1'
  activeProjectId: string
  projects: StoredProject[]
}

export type ProjectSession = {
  activeProjectId: string
  activeProjectName: string
  projects: ProjectMeta[]
  document: DiagramDocument
}
