import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node as FlowNode,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeChange,
  EdgeChange,
  ConnectionMode,
  Panel,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Node } from '../types';
import { getNodeColor } from '../utils';
import { CustomNode } from './nodes/CustomNode';

const nodeTypes = {
  custom: CustomNode
};

const minimapNodeColor = (node: FlowNode) => {
  return node.data.color || '#333333';
};

interface NodeCanvasProps {
  zoom: number;
  nodes: Node[];
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeDelete: (nodeId: string) => void;
  onConfigChange: (nodeId: string, config: Partial<Node['config']>) => void;
  onConnect: (params: { source: string; target: string; sourceHandle?: string }) => void;
  onEdgeDelete: (edgeId: string) => void;
}

export function NodeCanvas({
  zoom,
  nodes: moduleNodes,
  selectedNode,
  onNodeClick,
  onNodeDelete,
  onConfigChange,
  onConnect,
  onEdgeDelete
}: NodeCanvasProps) {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert module nodes to React Flow nodes
  useEffect(() => {
    const nodes: FlowNode[] = moduleNodes.map(node => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      draggable: true,
      selectable: true,
      data: {
        ...node,
        type: node.type,
        color: node.color,
        onDelete: () => onNodeDelete(node.id),
        onConfigChange: (config: Partial<Node['config']>) => onConfigChange(node.id, config),
        isSelected: selectedNode === node.id,
        onClick: () => onNodeClick(node.id)
      }
    }));

    setFlowNodes(nodes);
  }, [moduleNodes, selectedNode, onNodeDelete, onConfigChange, onNodeClick]);

  // Convert module connections to React Flow edges
  useEffect(() => {
    const newEdges: Edge[] = [];

    moduleNodes.forEach(node => {
      if (node.type === 'router' && node.config.choices) {
        // For router nodes, create edges for each choice's connection
        node.config.choices.forEach(choice => {
          if (choice.connection) {
            newEdges.push({
              id: `${node.id}-${choice.connection}`,
              source: node.id,
              target: choice.connection,
              sourceHandle: `choice-${choice.id}`,
              type: 'default',
              animated: true,
              style: { 
                stroke: node.color,
                strokeWidth: 2
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: node.color,
                width: 20,
                height: 20
              }
            });
          }
        });
      } else if (node.connection) {
        // For non-router nodes, create a single edge
        newEdges.push({
          id: `${node.id}-${node.connection}`,
          source: node.id,
          target: node.connection,
          type: 'default',
          animated: true,
          style: { 
            stroke: node.color,
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: node.color,
            width: 20,
            height: 20
          }
        });
      }
    });

    setEdges(newEdges);
  }, [moduleNodes]);

  const handleConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      onConnect({
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle
      });
    },
    [onConnect]
  );

  const handleEdgesDelete = useCallback(
    (edges: Edge[]) => {
      console.log('=== Edges Delete Handler ===');
      console.log('Edges to delete:', edges);

      edges.forEach(edge => {
        console.log('Processing edge:', edge);
        onEdgeDelete(edge.id);
      });
    },
    [onEdgeDelete]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Update module nodes with new positions
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          const nodeId = change.id;
          const newPosition = change.position;
          
          moduleNodes.forEach(node => {
            if (node.id === nodeId) {
              node.position = newPosition;
            }
          });
        }
      });
    },
    [onNodesChange, moduleNodes]
  );

  return (
    <div className="flex-1 h-[calc(100vh-4rem)]">
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onEdgesDelete={handleEdgesDelete}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={{ x: 0, y: 0, zoom }}
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{
          type: 'default',
          animated: true,
          style: { strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20
          }
        }}
        fitView={false}
        snapToGrid
        snapGrid={[15, 15]}
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={minimapNodeColor}
          nodeStrokeWidth={3}
          nodeStrokeColor="#fff"
        />
      </ReactFlow>
    </div>
  );
}