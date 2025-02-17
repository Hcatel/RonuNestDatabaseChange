import { useState, useCallback } from 'react';
import type { Node } from '../types';
import { getNodeColor, getDefaultConfig } from '../utils';

export function useNodes() {
  const [nodes, setNodes] = useState<Node[]>([]);

  const addNode = useCallback((type: Node['type']) => {
    // Calculate position for new node
    const offset = nodes.length * 50; // Offset each new node to avoid stacking
    
    // Calculate position to be visible in the viewport
    const position = {
      x: window.innerWidth / 4 + offset,
      y: window.innerHeight / 4 + offset
    };

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position,
      title: getDefaultConfig(type).title,
      connection: undefined,
      color: getNodeColor(type),
      config: getDefaultConfig(type)
    };

    setNodes(prevNodes => [...prevNodes, newNode]);
  }, [nodes]);

  const deleteNode = useCallback((nodeId: string) => {
    console.log('=== Delete Node ===');
    console.log('Node ID:', nodeId);

    setNodes(prevNodes => {
      // First remove any connections to this node
      const updatedNodes = prevNodes.map(node => {
        if (node.type === 'router' && node.config.choices) {
          // Update router node choices
          const updatedChoices = node.config.choices.map(choice => ({
            ...choice,
            connection: choice.connection === nodeId ? undefined : choice.connection
          }));
          return {
            ...node,
            config: { ...node.config, choices: updatedChoices }
          };
        } else {
          // Update regular node connection
          return {
            ...node,
            connection: node.connection === nodeId ? undefined : node.connection
          };
        }
      });

      // Then remove the node itself
      return updatedNodes.filter(node => node.id !== nodeId);
    });
  }, []);

  const updateNodeConfig = useCallback((nodeId: string, config: Partial<Node['config']>) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId
          ? { ...node, config: { ...node.config, ...config } }
          : node
      )
    );
  }, []);

  const updateNodeConnection = useCallback((nodeId: string, targetId: string | undefined) => {
    console.log('=== Update Node Connection ===');
    console.log('Node ID:', nodeId);
    console.log('Target ID:', targetId);

    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId
          ? { ...node, connection: targetId }
          : node
      )
    );
  }, []);

  const updateRouterConnection = useCallback((nodeId: string, choiceId: string, targetId: string | undefined) => {
    console.log('=== Update Router Connection ===');
    console.log('Node ID:', nodeId);
    console.log('Choice ID:', choiceId);
    console.log('Target ID:', targetId);

    setNodes(prevNodes => 
      prevNodes.map(node => {
        if (node.id === nodeId && node.type === 'router' && node.config.choices) {
          const updatedChoices = node.config.choices.map(choice =>
            choice.id === choiceId
              ? { ...choice, connection: targetId }
              : choice
          );
          return {
            ...node,
            config: { ...node.config, choices: updatedChoices }
          };
        }
        return node;
      })
    );
  }, []);

  const removeConnection = useCallback((sourceId: string, targetId: string) => {
    console.log('=== Remove Connection ===');
    console.log('Source ID:', sourceId);
    console.log('Target ID:', targetId);

    setNodes(prevNodes => {
      const updatedNodes = prevNodes.map(node => {
        if (node.id === sourceId) {
          if (node.type === 'router' && node.config.choices) {
            // Update router node choices
            const updatedChoices = node.config.choices.map(choice => ({
              ...choice,
              connection: choice.connection === targetId ? undefined : choice.connection
            }));
            return {
              ...node,
              config: { ...node.config, choices: updatedChoices }
            };
          } else {
            // Update regular node connection
            return {
              ...node,
              connection: node.connection === targetId ? undefined : node.connection
            };
          }
        }
        return node;
      });

      return updatedNodes;
    });
  }, []);

  return {
    nodes,
    setNodes,
    addNode,
    deleteNode,
    updateNodeConfig,
    updateNodeConnection,
    updateRouterConnection,
    removeConnection
  };
}