import type { Edge, Node } from '@xyflow/react'
import { createSampleDiagram } from '../demo/sampleDiagram'
import { toSchema } from '../export/toSchema'
import { parseDiagramDocument } from '../import/fromSchema'
import type { DiagramDocument } from '../../types/diagram'
import type {
  ProjectMeta,
  ProjectSession,
  ProjectStore,
  StoredProject,
} from '../../types/project'

export const PROJECTS_STORAGE_KEY = 'mermaid-chart-creator:v1:projects'
export const LEGACY_DIAGRAM_STORAGE_KEY = 'mermaid-chart-creator:v1:diagram'

const AUTOSAVE_DELAY_MS = 500

function generateProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function nowIso(): string {
  return new Date().toISOString()
}

function readStoreRaw(): ProjectStore | null {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as ProjectStore
    if (parsed.version !== '1' || !Array.isArray(parsed.projects)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeStore(store: ProjectStore): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Ignore storage errors
  }
}

function createEmptyDocument(): DiagramDocument {
  return {
    version: '1',
    meta: {
      createdAt: nowIso(),
      font: 'DM Mono',
    },
    nodes: [],
    edges: [],
  }
}

function documentFromSample(): DiagramDocument {
  const sample = createSampleDiagram()
  return toSchema(sample.nodes, sample.edges)
}

function readLegacyDocument(): DiagramDocument | null {
  try {
    const raw = localStorage.getItem(LEGACY_DIAGRAM_STORAGE_KEY)
    if (!raw) {
      return null
    }
    return parseDiagramDocument(JSON.parse(raw))
  } catch {
    return null
  }
}

function nextUntitledName(projects: StoredProject[]): string {
  const names = new Set(projects.map((project) => project.meta.name))
  if (!names.has('Untitled')) {
    return 'Untitled'
  }
  let index = 1
  while (names.has(`Untitled ${index}`)) {
    index += 1
  }
  return `Untitled ${index}`
}

function createStoredProject(
  name: string,
  document: DiagramDocument,
): StoredProject {
  const timestamp = nowIso()
  return {
    meta: {
      id: generateProjectId(),
      name,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    document,
  }
}

function buildDefaultStore(): ProjectStore {
  const project = createStoredProject('Untitled', documentFromSample())
  return {
    version: '1',
    activeProjectId: project.meta.id,
    projects: [project],
  }
}

function migrateLegacyStore(): ProjectStore | null {
  const legacy = readLegacyDocument()
  if (!legacy) {
    return null
  }

  const name =
    legacy.nodes.length === 0 && legacy.edges.length === 0
      ? 'Untitled'
      : 'Recovered diagram'
  const project = createStoredProject(name, legacy)
  const store: ProjectStore = {
    version: '1',
    activeProjectId: project.meta.id,
    projects: [project],
  }

  writeStore(store)
  try {
    localStorage.removeItem(LEGACY_DIAGRAM_STORAGE_KEY)
  } catch {
    // Ignore
  }

  return store
}

export function loadProjectStore(): ProjectStore {
  const existing = readStoreRaw()
  if (existing && existing.projects.length > 0) {
    if (!existing.projects.some((p) => p.meta.id === existing.activeProjectId)) {
      existing.activeProjectId = existing.projects[0].meta.id
    }
    return existing
  }

  const migrated = migrateLegacyStore()
  if (migrated) {
    return migrated
  }

  const store = buildDefaultStore()
  writeStore(store)
  return store
}

export function initProjectSession(): ProjectSession {
  const store = loadProjectStore()
  const active =
    store.projects.find((project) => project.meta.id === store.activeProjectId) ??
    store.projects[0]

  return {
    activeProjectId: active.meta.id,
    activeProjectName: active.meta.name,
    projects: store.projects
      .map((project) => project.meta)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    document: active.document,
  }
}

function getStoreProject(store: ProjectStore, projectId: string): StoredProject {
  const project = store.projects.find((entry) => entry.meta.id === projectId)
  if (!project) {
    throw new Error(`Project not found: ${projectId}`)
  }
  return project
}

export function saveProjectDiagram(
  projectId: string,
  nodes: Node[],
  edges: Edge[],
): ProjectMeta[] {
  const store = loadProjectStore()
  const project = getStoreProject(store, projectId)
  const timestamp = nowIso()

  project.document = toSchema(nodes, edges)
  project.meta.updatedAt = timestamp
  store.activeProjectId = projectId

  writeStore(store)

  return store.projects
    .map((entry) => entry.meta)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
}

export function setActiveProjectId(projectId: string): ProjectSession {
  const store = loadProjectStore()
  const project = getStoreProject(store, projectId)
  store.activeProjectId = projectId
  writeStore(store)

  return {
    activeProjectId: project.meta.id,
    activeProjectName: project.meta.name,
    projects: store.projects
      .map((entry) => entry.meta)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    document: project.document,
  }
}

export function createProject(
  nodes: Node[],
  edges: Edge[],
  name?: string,
): ProjectSession {
  const store = loadProjectStore()
  saveProjectDiagram(store.activeProjectId, nodes, edges)

  const refreshed = loadProjectStore()
  const project = createStoredProject(
    name ?? nextUntitledName(refreshed.projects),
    createEmptyDocument(),
  )

  refreshed.projects.unshift(project)
  refreshed.activeProjectId = project.meta.id
  writeStore(refreshed)

  return {
    activeProjectId: project.meta.id,
    activeProjectName: project.meta.name,
    projects: refreshed.projects
      .map((entry) => entry.meta)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    document: project.document,
  }
}

export function renameProject(projectId: string, name: string): ProjectMeta[] {
  const trimmed = name.trim()
  if (!trimmed) {
    return loadProjectStore().projects.map((entry) => entry.meta)
  }

  const store = loadProjectStore()
  const project = getStoreProject(store, projectId)
  project.meta.name = trimmed
  project.meta.updatedAt = nowIso()
  writeStore(store)

  return store.projects
    .map((entry) => entry.meta)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
}

export function deleteProject(projectId: string): ProjectSession | null {
  const store = loadProjectStore()
  if (store.projects.length <= 1) {
    return null
  }

  store.projects = store.projects.filter(
    (project) => project.meta.id !== projectId,
  )

  if (store.activeProjectId === projectId) {
    store.activeProjectId = store.projects[0].meta.id
  }

  writeStore(store)

  const active = getStoreProject(store, store.activeProjectId)
  return {
    activeProjectId: active.meta.id,
    activeProjectName: active.meta.name,
    projects: store.projects
      .map((entry) => entry.meta)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    document: active.document,
  }
}

export function importProjectDocument(
  document: DiagramDocument,
  name: string,
  nodes: Node[],
  edges: Edge[],
): ProjectSession {
  const store = loadProjectStore()
  saveProjectDiagram(store.activeProjectId, nodes, edges)

  const refreshed = loadProjectStore()
  const project = createStoredProject(name, document)
  refreshed.projects.unshift(project)
  refreshed.activeProjectId = project.meta.id
  writeStore(refreshed)

  return {
    activeProjectId: project.meta.id,
    activeProjectName: project.meta.name,
    projects: refreshed.projects
      .map((entry) => entry.meta)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    document: project.document,
  }
}

export { AUTOSAVE_DELAY_MS }
