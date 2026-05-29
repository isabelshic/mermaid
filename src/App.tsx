import { useCallback, useMemo, useRef, useState } from 'react'
import type { Connection, Edge, Node } from '@xyflow/react'
import { DiagramCanvas } from './components/canvas/DiagramCanvas'
import { ProjectMenu } from './components/projects/ProjectMenu'
import { useDiagramHistory } from './hooks/useDiagramHistory'
import { useDiagramKeyboardShortcuts } from './hooks/useDiagramKeyboardShortcuts'
import { useProjectSession } from './hooks/useProjectSession'
import {
  appendEdge,
  getEdgeDirection,
  getEdgeStrokeStyle,
  normalizeBidirectionalEdges,
  setEdgeDirection,
} from './lib/edges'
import { downloadJson, toSchema } from './lib/export/toSchema'
import { fromSchema } from './lib/import/fromSchema'
import { initProjectSession } from './lib/projects/projectStore'
import { Sidebar } from './components/inspector/Sidebar'
import type { SelectedDiagramNode } from './components/inspector/NodeInspector'
import { DiagramUiContext } from './context/DiagramUiContext'
import {
  createGroupFromSelection,
  absorbAssetsIntoGroup,
  addGroupAtPosition,
  syncAssetGroupAfterDrag,
} from './lib/createNode'
import type { IconName } from './lib/icons'
import type { ThemeName } from './tokens/colors'
import type { CanvasTool } from './types/canvas'
import type { EdgeDirection, EdgeStrokeStyle } from './types/diagram'

function App() {
  const jsonInputRef = useRef<HTMLInputElement>(null)

  const initialSession = useMemo(() => initProjectSession(), [])

  const initialDiagram = useMemo(() => {
    const diagram = fromSchema(initialSession.document)
    return {
      nodes: diagram.nodes,
      edges: normalizeBidirectionalEdges(diagram.edges),
    }
  }, [initialSession])

  const {
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    mutateNodes,
    mutateEdges,
    replaceDiagram,
    undo,
    redo,
  } = useDiagramHistory(initialDiagram.nodes, initialDiagram.edges)

  const {
    activeProjectId,
    activeProjectName,
    projects,
    saveStatus,
    switchToProject,
    createNewProject,
    renameActiveProject,
    removeProject,
    importProject,
  } = useProjectSession({
    initialSession,
    nodes,
    edges,
    replaceDiagram,
  })

  const [selectedNode, setSelectedNode] = useState<SelectedDiagramNode | null>(
    null,
  )
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([])
  const [activeTheme, setActiveTheme] = useState<ThemeName>('blue')
  const [canvasTool, setCanvasTool] = useState<CanvasTool>('select')
  const [lineStrokeStyle, setLineStrokeStyle] = useState<EdgeStrokeStyle>('dashed')
  const [lineDirection, setLineDirection] = useState<EdgeDirection>('one-way')
  const [iconPickerNodeId, setIconPickerNodeId] = useState<string | null>(null)

  const clearSelection = useCallback(() => {
    setSelectedNode(null)
    setSelectedNodes([])
    setSelectedEdges([])
    setIconPickerNodeId(null)
  }, [])

  const selectedNodeIds = useMemo(() => {
    const ids = new Set<string>()
    for (const node of selectedNodes) {
      ids.add(node.id)
    }
    for (const node of nodes) {
      if (node.selected) {
        ids.add(node.id)
      }
    }
    return ids
  }, [nodes, selectedNodes])

  useDiagramKeyboardShortcuts({
    selectedNodeIds,
    nodes,
    edges,
    onPaste: replaceDiagram,
    onUndo: undo,
    onRedo: redo,
    onSave: () => downloadJson(toSchema(nodes, edges)),
    onOpen: () => jsonInputRef.current?.click(),
  })

  const handleImportDiagram = useCallback(
    (nextNodes: Node[], nextEdges: Edge[], name: string) => {
      const document = toSchema(nextNodes, nextEdges)
      importProject(document, name)
      clearSelection()
    },
    [clearSelection, importProject],
  )

  const handleSwitchProject = useCallback(
    (projectId: string) => {
      switchToProject(projectId)
      clearSelection()
    },
    [clearSelection, switchToProject],
  )

  const handleCreateProject = useCallback(() => {
    createNewProject()
    clearSelection()
  }, [clearSelection, createNewProject])

  const handleDeleteProject = useCallback(
    (projectId: string) => {
      removeProject(projectId)
      clearSelection()
    },
    [clearSelection, removeProject],
  )

  const handleConnect = useCallback(
    (connection: Connection) => {
      mutateEdges((current) =>
        appendEdge(current, connection, lineStrokeStyle, lineDirection),
      )
    },
    [lineDirection, lineStrokeStyle, mutateEdges],
  )

  const handleSelectionChange = useCallback(
    (selection: {
      primary: SelectedDiagramNode | null
      all: Node[]
      edges: Edge[]
    }) => {
      setSelectedNode(selection.primary)
      setSelectedNodes(selection.all)
      setSelectedEdges(selection.edges)

      if (selection.edges.length > 0) {
        const primaryEdge = selection.edges[0]
        setLineStrokeStyle(getEdgeStrokeStyle(primaryEdge.data))
        setLineDirection(getEdgeDirection(primaryEdge.data))
      }

      if (
        iconPickerNodeId &&
        !selection.all.some((node) => node.id === iconPickerNodeId)
      ) {
        setIconPickerNodeId(null)
      }
    },
    [iconPickerNodeId],
  )

  const handleUpdateNodeData = useCallback(
    (nodeId: string, patch: Record<string, unknown>) => {
      mutateNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...patch } }
            : node,
        ),
      )
      setSelectedNode((current) =>
        current?.id === nodeId
          ? { ...current, data: { ...current.data, ...patch } }
          : current,
      )
      setSelectedNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...patch } }
            : node,
        ),
      )
    },
    [mutateNodes],
  )

  const handleUpdateLabel = useCallback(
    (nodeId: string, label: string) => {
      handleUpdateNodeData(nodeId, { label })
    },
    [handleUpdateNodeData],
  )

  const handleUpdateUrl = useCallback(
    (nodeId: string, url: string) => {
      handleUpdateNodeData(nodeId, { url })
    },
    [handleUpdateNodeData],
  )

  const handleUpdateIcon = useCallback(
    (nodeId: string, icon: IconName) => {
      handleUpdateNodeData(nodeId, { icon })
    },
    [handleUpdateNodeData],
  )

  const handleUpdateTheme = useCallback(
    (nodeId: string, theme: ThemeName) => {
      handleUpdateNodeData(nodeId, { theme })
    },
    [handleUpdateNodeData],
  )

  const applyStrokeStyleToSelectedEdges = useCallback(
    (strokeStyle: EdgeStrokeStyle) => {
      const selectedIds = new Set(selectedEdges.map((edge) => edge.id))
      if (selectedIds.size === 0) {
        return
      }

      mutateEdges((current) =>
        normalizeBidirectionalEdges(
          current.map((edge) =>
            selectedIds.has(edge.id)
              ? {
                  ...edge,
                  data: { ...edge.data, strokeStyle },
                }
              : edge,
          ),
        ),
      )
      setSelectedEdges((current) =>
        current.map((edge) => ({
          ...edge,
          data: { ...edge.data, strokeStyle },
        })),
      )
    },
    [mutateEdges, selectedEdges],
  )

  const applyDirectionToSelectedEdges = useCallback(
    (direction: EdgeDirection) => {
      const selectedIds = new Set(selectedEdges.map((edge) => edge.id))
      if (selectedIds.size === 0) {
        return
      }

      mutateEdges((current) => setEdgeDirection(current, selectedIds, direction))
      setSelectedEdges((current) =>
        current.map((edge) => ({
          ...edge,
          data: {
            ...edge.data,
            direction,
            bidirectional: direction === 'both',
          },
        })),
      )
    },
    [mutateEdges, selectedEdges],
  )

  const handleLineStrokeStyleChange = useCallback(
    (strokeStyle: EdgeStrokeStyle) => {
      setLineStrokeStyle(strokeStyle)
      applyStrokeStyleToSelectedEdges(strokeStyle)
    },
    [applyStrokeStyleToSelectedEdges],
  )

  const handleLineDirectionChange = useCallback(
    (direction: EdgeDirection) => {
      setLineDirection(direction)
      applyDirectionToSelectedEdges(direction)
    },
    [applyDirectionToSelectedEdges],
  )

  const handleGroupSelection = useCallback(
    (label: string, theme: ThemeName) => {
      const selectedIds = selectedNodes.map((node) => node.id)
      mutateNodes((current) =>
        createGroupFromSelection(current, selectedIds, theme, label),
      )
      setSelectedNodes([])
      setSelectedNode(null)
      setIconPickerNodeId(null)
    },
    [mutateNodes, selectedNodes],
  )

  const handleNodeDragStop = useCallback(
    (node: Node) => {
      mutateNodes((current) => {
        if (node.type === 'group') {
          return absorbAssetsIntoGroup(current, node.id)
        }

        if (node.type === 'asset') {
          return syncAssetGroupAfterDrag(current, node.id)
        }

        return current
      })
    },
    [mutateNodes],
  )

  const handleAddNode = useCallback(
    (node: Node) => {
      mutateNodes((current) => [...current, node])
    },
    [mutateNodes],
  )

  const handleAddGroupAtPosition = useCallback(
    (
      position: { x: number; y: number },
      size: { width: number; height: number },
      theme: ThemeName,
      label: string,
    ) => {
      mutateNodes((current) =>
        addGroupAtPosition(current, position, theme, label, size),
      )
    },
    [mutateNodes],
  )

  const openIconPicker = useCallback(
    (nodeId: string) => {
      setIconPickerNodeId(nodeId)
      setNodes((current) => {
        const target = current.find((node) => node.id === nodeId)
        if (target) {
          setSelectedNode(target as SelectedDiagramNode)
          setSelectedNodes([target])
        }
        return current.map((node) => ({
          ...node,
          selected: node.id === nodeId,
        }))
      })
    },
    [setNodes],
  )

  const closeIconPicker = useCallback(() => {
    setIconPickerNodeId(null)
  }, [])

  const resolvedSelectedNode = selectedNode
    ? ((nodes.find((node) => node.id === selectedNode.id) as
        | SelectedDiagramNode
        | undefined) ?? selectedNode)
    : null

  const resolvedSelectedNodes = selectedNodes.map(
    (node) => nodes.find((entry) => entry.id === node.id) ?? node,
  )

  const diagramUiValue = useMemo(
    () => ({
      openIconPicker,
      closeIconPicker,
      iconPickerNodeId,
      canvasTool,
    }),
    [openIconPicker, closeIconPicker, iconPickerNodeId, canvasTool],
  )

  return (
    <DiagramUiContext.Provider value={diagramUiValue}>
      <div className="flex h-full w-full">
        <main className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute left-4 top-4 z-20">
            <ProjectMenu
              activeProjectId={activeProjectId}
              activeProjectName={activeProjectName}
              projects={projects}
              saveStatus={saveStatus}
              onSwitchProject={handleSwitchProject}
              onCreateProject={handleCreateProject}
              onRenameProject={renameActiveProject}
              onDeleteProject={handleDeleteProject}
              onImportDiagram={handleImportDiagram}
              jsonInputRef={jsonInputRef}
            />
          </div>

          <DiagramCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onSelectionChange={handleSelectionChange}
            onNodeDragStop={handleNodeDragStop}
            onAddNode={handleAddNode}
            onAddGroupAtPosition={handleAddGroupAtPosition}
            activeTheme={activeTheme}
            onThemeChange={setActiveTheme}
            canvasTool={canvasTool}
            onCanvasToolChange={setCanvasTool}
            lineStrokeStyle={lineStrokeStyle}
            onLineStrokeStyleChange={handleLineStrokeStyleChange}
            lineDirection={lineDirection}
            onLineDirectionChange={handleLineDirectionChange}
          />
        </main>

        <Sidebar
          nodes={nodes}
          edges={edges}
          selectedNode={resolvedSelectedNode}
          selectedNodes={resolvedSelectedNodes}
          iconPickerNodeId={iconPickerNodeId}
          onUpdateLabel={handleUpdateLabel}
          onUpdateUrl={handleUpdateUrl}
          onUpdateIcon={handleUpdateIcon}
          onUpdateTheme={handleUpdateTheme}
          onGroupSelection={handleGroupSelection}
          onCloseIconPicker={closeIconPicker}
        />
      </div>
    </DiagramUiContext.Provider>
  )
}

export default App
