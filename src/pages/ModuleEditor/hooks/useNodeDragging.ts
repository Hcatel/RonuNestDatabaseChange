import { useState, useCallback } from 'react';
import type { Node, Point } from '../types';

export function useNodeDragging(nodes: Node[], setNodes: (nodes: Node[]) => void) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button !== 0) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setSelectedNode(nodeId);
    setIsDragging(true);
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent, canvasRect: DOMRect) => {
    if (!isDragging || !selectedNode) return;

    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;

    setNodes(nodes.map(node => 
      node.id === selectedNode
        ? { ...node, position: { x, y } }
        : node
    ));
  }, [isDragging, selectedNode, dragOffset, nodes, setNodes]);

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedNode(null);
  };

  return {
    selectedNode,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}