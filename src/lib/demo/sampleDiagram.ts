import type { Edge, Node } from '@xyflow/react'

export const sampleNodes: Node[] = [
  {
    id: 'workflow',
    type: 'group',
    position: { x: 60, y: 160 },
    data: { label: 'WORKFLOW', theme: 'blue' },
    style: { width: 230, height: 130 },
    zIndex: -1,
  },
  {
    id: 'cron',
    type: 'asset',
    parentId: 'workflow',
    extent: 'parent',
    position: { x: 35, y: 48 },
    data: {
      icon: 'Globe',
      theme: 'blue',
      label: 'CRON TRIGGERS',
      url: 'https://example.com/cron-triggers',
    },
  },
  {
    id: 'api',
    type: 'asset',
    parentId: 'workflow',
    extent: 'parent',
    position: { x: 130, y: 48 },
    data: {
      icon: 'Rhombus',
      theme: 'blue',
      label: 'API',
      url: 'https://example.com/api',
    },
  },
  {
    id: 'compute',
    type: 'group',
    position: { x: 60, y: 380 },
    data: { label: 'COMPUTE', theme: 'blue' },
    style: { width: 230, height: 130 },
    zIndex: -1,
  },
  {
    id: 'workers',
    type: 'asset',
    parentId: 'compute',
    extent: 'parent',
    position: { x: 35, y: 48 },
    data: {
      icon: 'Cpu',
      theme: 'blue',
      label: 'WORKERS',
      url: 'https://example.com/workers',
    },
  },
  {
    id: 'pages',
    type: 'asset',
    parentId: 'compute',
    extent: 'parent',
    position: { x: 130, y: 48 },
    data: {
      icon: 'Page',
      theme: 'blue',
      label: 'PAGES',
      url: 'https://example.com/pages',
    },
  },
  {
    id: 'workers-ai',
    type: 'group',
    position: { x: 380, y: 270 },
    data: { label: 'WORKERS AI', theme: 'green' },
    style: { width: 230, height: 130 },
    zIndex: -1,
  },
  {
    id: 'ai-models',
    type: 'asset',
    parentId: 'workers-ai',
    extent: 'parent',
    position: { x: 35, y: 48 },
    data: {
      icon: 'Sparks',
      theme: 'green',
      label: 'MODELS',
      url: 'https://example.com/ai-models',
    },
  },
  {
    id: 'ai-inference',
    type: 'asset',
    parentId: 'workers-ai',
    extent: 'parent',
    position: { x: 130, y: 48 },
    data: {
      icon: 'Sparks',
      theme: 'green',
      label: 'INFERENCE',
      url: 'https://example.com/ai-inference',
    },
  },
  {
    id: 'storage',
    type: 'group',
    position: { x: 700, y: 270 },
    data: { label: 'STORAGE', theme: 'magenta' },
    style: { width: 230, height: 130 },
    zIndex: -1,
  },
  {
    id: 'r2',
    type: 'asset',
    parentId: 'storage',
    extent: 'parent',
    position: { x: 35, y: 48 },
    data: {
      icon: 'Database',
      theme: 'magenta',
      label: 'R2',
      url: 'https://example.com/r2',
    },
  },
  {
    id: 'd1',
    type: 'asset',
    parentId: 'storage',
    extent: 'parent',
    position: { x: 130, y: 48 },
    data: {
      icon: 'Database',
      theme: 'magenta',
      label: 'D1',
      url: 'https://example.com/d1',
    },
  },
]

export const sampleEdges: Edge[] = [
  {
    id: 'e-cron-workers',
    source: 'cron',
    target: 'workers',
    type: 'connector',
    data: { strokeStyle: 'dashed' },
  },
  {
    id: 'e-api-pages',
    source: 'api',
    target: 'pages',
    type: 'connector',
    data: { strokeStyle: 'dashed' },
  },
  {
    id: 'e-workers-ai-models',
    source: 'workers',
    target: 'ai-models',
    type: 'connector',
    data: { strokeStyle: 'dashed' },
  },
  {
    id: 'e-pages-ai-inference',
    source: 'pages',
    target: 'ai-inference',
    type: 'connector',
    data: { strokeStyle: 'dashed' },
  },
  {
    id: 'e-ai-models-r2',
    source: 'ai-models',
    target: 'r2',
    type: 'connector',
    data: { strokeStyle: 'dashed' },
  },
  {
    id: 'e-ai-inference-d1',
    source: 'ai-inference',
    target: 'd1',
    type: 'connector',
    data: { strokeStyle: 'solid' },
  },
]

export function createSampleDiagram() {
  return {
    nodes: structuredClone(sampleNodes),
    edges: structuredClone(sampleEdges),
  }
}
