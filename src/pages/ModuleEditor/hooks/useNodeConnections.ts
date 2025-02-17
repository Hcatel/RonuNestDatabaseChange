import { useState } from 'react';
import type { Node, Point } from '../types';

export function useNodeConnections(
  nodes: Node[], 
  setNodes: (nodes: Node[]) => void,
  updateNodeConfig: (nodeId: string, config: Partial<Node['config']>) => void
) {
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });

  const handleConnectionStart = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectionStart(nodeId);
    setIsDrawingConnection(true);
    
    // Set initial mouse position
    if (e.currentTarget instanceof HTMLElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleConnectionEnd = (nodeId: string) => {
    if (!connectionStart || connectionStart === nodeId) {
      setConnectionStart(null);
      setIsDrawingConnection(false);
      return;
    }

    const sourceNode = nodes.find(n => n.id === connectionStart);
    if (!sourceNode) return;

    // Check if connection already exists
    if (sourceNode.connections.includes(nodeId)) {
      setConnectionStart(null);
      setIsDrawingConnection(false);
      return;
    }

    // Update connections based on node type
    setNodes(nodes.map(node => {
      if (node.id === connectionStart) {
        const newConnections = node.type === 'router' 
          ? [...node.connections, nodeId]  // Router nodes can have multiple connections
          : [nodeId];                      // Other nodes have single connection

        return {
          ...node,
          connections: newConnections
        };
      }
      return node;
    }));

    setConnectionStart(null);
    setIsDrawingConnection(false);
  };

  const updateMousePosition = (rect: DOMRect, e: React.MouseEvent) => {
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    
    setMousePosition({
      x,
      y
    });
  };

  return {
    isDrawingConnection,
    connectionStart,
    mousePosition,
    handleConnectionStart,
    handleConnectionEnd,
    updateMousePosition
  };
}