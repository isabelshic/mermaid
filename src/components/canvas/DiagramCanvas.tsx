import { useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  ReactFlowProvider,
  ConnectionMode,
  PanOnScrollMode,
  SelectionMode,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  type OnSelectionChangeParams,
} from '@xyflow/react'
import { GroupNode } from '../nodes/GroupNode'
import { AssetNode } from '../nodes/AssetNode'
import { ConnectorEdge } from '../edges/ConnectorEdge'
import { DotGridBackground } from './DotGridBackground'
import { BlockPalette } from '../palette/BlockPalette'
import type { SelectedDiagramNode } from '../inspector/NodeInspector'
import type { ThemeName } from '../../tokens/colors'
import { readPaletteDragPayload } from '../../lib/paletteDrag'
import { createAssetNode } from '../../lib/createNode'
import { GroupPlacementPreview } from './GroupPlacementPreview'
import { useGroupDraw } from '../../hooks/useGroupDraw'
import type { IconName } from '../../lib/icons'
import type { CanvasTool } from '../../types/canvas'
import type { EdgeDirection, EdgeStrokeStyle } from '../../types/diagram'
import { CONNECTOR_ARROW_MARKER } from '../../lib/edges'
import { snapNodePosition } from '../../lib/snap'

const nodeTypes = {
  group: GroupNode,
  asset: AssetNode,
}

const edgeTypes = {
  connector: ConnectorEdge,
  dashed: ConnectorEdge,
}

type DiagramCanvasProps = {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: (connection: Connection) => void
  onSelectionChange: (selection: {
    primary: SelectedDiagramNode | null
    all: Node[]
    edges: Edge[]
  }) => void
  onNodeDragStop: (node: Node) => void
  onAddNode: (node: Node) => void
  onAddGroupAtPosition: (
    position: { x: number; y: number },
    size: { width: number; height: number },
    theme: ThemeName,
    label: string,
  ) => void
  activeTheme: ThemeName
  onThemeChange: (theme: ThemeName) => void
  canvasTool: CanvasTool
  onCanvasToolChange: (tool: CanvasTool) => void
  lineStrokeStyle: EdgeStrokeStyle
  onLineStrokeStyleChange: (strokeStyle: EdgeStrokeStyle) => void
  lineDirection: EdgeDirection
  onLineDirectionChange: (direction: EdgeDirection) => void
}

function DiagramCanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
  onNodeDragStop,
  onAddNode,
  onAddGroupAtPosition,
  activeTheme,
  onThemeChange,
  canvasTool,
  onCanvasToolChange,
  lineStrokeStyle,
  onLineStrokeStyleChange,
  lineDirection,
  onLineDirectionChange,
}: DiagramCanvasProps) {
  const { screenToFlowPosition } = useReactFlow()
  const canvasRef = useRef<HTMLDivElement>(null)

  const focusCanvas = useCallback(() => {
    canvasRef.current?.focus()
  }, [])

  const handleCreateGroup = useCallback(
    (
      position: { x: number; y: number },
      size: { width: number; height: number },
    ) => {
      onAddGroupAtPosition(position, size, activeTheme, 'GROUP')
    },
    [activeTheme, onAddGroupAtPosition],
  )

  const connectMode = canvasTool === 'connect'
  const groupMode = canvasTool === 'group'

  const { preview: groupPreview, handleMouseDown: handleGroupDrawStart } =
    useGroupDraw({
      active: groupMode,
      theme: activeTheme,
      nodes,
      onCreateGroup: handleCreateGroup,
    })

  const handleConnect = useCallback(
    (connection: Connection) => {
      onConnect(connection)
    },
    [onConnect],
  )

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      const primary =
        selectedNodes.length === 1
          ? (selectedNodes[0] as SelectedDiagramNode)
          : ((selectedNodes.find((node) => node.type === 'group') as
              | SelectedDiagramNode
              | undefined) ??
            (selectedNodes.find((node) => node.type === 'asset') as
              | SelectedDiagramNode
              | undefined) ??
            null)

      onSelectionChange({
        primary,
        all: selectedNodes,
        edges: selectedEdges,
      })
    },
    [onSelectionChange],
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const payload = readPaletteDragPayload(event.dataTransfer)
      if (!payload) return

      const dropPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const draft = createAssetNode(
        dropPosition,
        payload.icon as IconName,
        payload.theme as ThemeName,
        payload.label,
      )
      onAddNode({
        ...draft,
        position: snapNodePosition(draft, dropPosition, nodes),
      })
    },
    [nodes, onAddNode, screenToFlowPosition],
  )

  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeDragStop(node)
    },
    [onNodeDragStop],
  )

  const canvasClassName = useMemo(() => {
    if (connectMode) return 'connect-mode bg-transparent!'
    if (groupMode) return 'group-mode bg-transparent!'
    return 'bg-transparent!'
  }, [connectMode, groupMode])

  const toolModeActive = connectMode || groupMode

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full outline-none"
      tabIndex={0}
      onMouseDown={(event) => {
        focusCanvas()
        handleGroupDrawStart(event)
      }}
    >
      <DotGridBackground />
      {groupPreview && (
        <GroupPlacementPreview
          anchor={groupPreview.anchor}
          current={groupPreview.current}
          theme={groupPreview.theme}
        />
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        connectionMode={ConnectionMode.Loose}
        isValidConnection={() => true}
        onSelectionChange={handleSelectionChange}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={!groupMode}
        nodesConnectable={!groupMode}
        elementsSelectable={!groupMode}
        selectionOnDrag={!toolModeActive}
        selectionMode={SelectionMode.Partial}
        panOnDrag={groupMode ? [1, 2] : [1, 2]}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        zoomOnScroll={false}
        zoomOnPinch
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Shift"
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'connector',
          markerEnd: CONNECTOR_ARROW_MARKER,
        }}
        proOptions={{ hideAttribution: true }}
        className={canvasClassName}
      >
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>

      <BlockPalette
        activeTheme={activeTheme}
        onThemeChange={onThemeChange}
        canvasTool={canvasTool}
        onCanvasToolChange={onCanvasToolChange}
        lineStrokeStyle={lineStrokeStyle}
        onLineStrokeStyleChange={onLineStrokeStyleChange}
        lineDirection={lineDirection}
        onLineDirectionChange={onLineDirectionChange}
      />
    </div>
  )
}

export function DiagramCanvas(props: DiagramCanvasProps) {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner {...props} />
    </ReactFlowProvider>
  )
}

export {
  appendEdge,
  createConnectorEdge,
  normalizeBidirectionalEdges,
  CONNECTOR_ARROW_MARKER,
} from '../../lib/edges'
