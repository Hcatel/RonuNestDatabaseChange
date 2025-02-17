import { useState } from 'react';
import type { Node } from '../../ModuleEditor/types';

export function useModuleNavigation(nodes: Node[]) {
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const handleResponse = (response: any) => {
    const currentNode = nodes[currentNodeIndex];
    if (!currentNode) return;

    setResponses(prev => ({
      ...prev,
      [currentNode.id]: response
    }));

    // If this is a router node, find the next node based on the choice
    if (currentNode.type === 'router' && currentNode.config.choices) {
      const choice = currentNode.config.choices.find(c => c.id === response);
      if (choice?.connection) {
        const nextNodeIndex = nodes.findIndex(n => n.id === choice.connection);
        if (nextNodeIndex !== -1) {
          setCurrentNodeIndex(nextNodeIndex);
          return;
        }
      }
    } else if (currentNode.connection) {
      // For non-router nodes, follow the single connection
      const nextNodeIndex = nodes.findIndex(n => n.id === currentNode.connection);
      if (nextNodeIndex !== -1) {
        setCurrentNodeIndex(nextNodeIndex);
        return;
      }
    }

    // If no valid connection found, show completion page
    setCurrentNodeIndex(nodes.length);
  };

  const handleNext = () => {
    const currentNode = nodes[currentNodeIndex];
    if (!currentNode) return;

    if (currentNode.connection) {
      const nextNodeIndex = nodes.findIndex(n => n.id === currentNode.connection);
      if (nextNodeIndex !== -1) {
        setCurrentNodeIndex(nextNodeIndex);
        return;
      }
    }

    // If no connection found, show completion page
    setCurrentNodeIndex(nodes.length);
  };

  return {
    currentNodeIndex,
    setCurrentNodeIndex,
    responses,
    setResponses,
    handleResponse,
    handleNext
  };
}