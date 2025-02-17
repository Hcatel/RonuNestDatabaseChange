import React, { useState, useEffect, useRef } from 'react';
import { Plus, Settings } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { NodeCanvas } from './components/NodeCanvas';
import { AddNodeModal } from './components/AddNodeModal';
import { NodeConfigModal } from './components/NodeConfigModal';
import { useNodes } from './hooks/useNodes';
import { useZoom } from './hooks/useZoom';
import { ZoomIn, ZoomOut, Maximize, Loader2, Check } from 'lucide-react';

function Build() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const moduleId = searchParams.get('id');
  const [state, setState] = useState({
    isSaving: false,
    saveStatus: null as 'saved' | 'saving' | 'error' | null,
    saveError: null as string | null,
    isInitialLoad: true
  });
  const { isSaving, saveStatus, saveError, isInitialLoad } = state;

  const { 
    nodes, 
    setNodes, 
    addNode, 
    deleteNode, 
    updateNodeConfig,
    updateNodeConnection,
    updateRouterConnection,
    removeConnection
  } = useNodes();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [configureNode, setConfigureNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const { zoom, setZoom, handleZoom, handleWheelZoom } = useZoom();

  // Handle node connections
  const handleConnect = ({ source, target, sourceHandle }: { source: string; target: string; sourceHandle?: string }) => {
    const sourceNode = nodes.find(n => n.id === source);
    if (!sourceNode) return;

    if (sourceNode.type === 'router' && sourceHandle) {
      // For router nodes, update the connection for the specific choice
      const choiceId = sourceHandle.replace('choice-', '');
      updateRouterConnection(source, choiceId, target);
    } else {
      // For regular nodes, update the single connection
      updateNodeConnection(source, target);
    }
  };

  // Handle edge deletion
  const handleEdgeDelete = (edgeId: string) => {
    console.log('=== Edge Deletion ===');
    console.log('Edge ID:', edgeId);
    
    // Extract full node IDs including the "node-" prefix
    const parts = edgeId.split('-');
    const sourceId = `${parts[0]}-${parts[1]}`;
    const targetId = `${parts[2]}-${parts[3]}`;
    const sourceNode = nodes.find(n => n.id === sourceId);
    
    console.log('Source Node:', sourceNode);
    console.log('Target Node ID:', targetId);
    
    if (!sourceNode) {
      console.warn('Source node not found');
      return;
    }

    // Remove the connection from the source node
    console.log('Removing connection...');
    removeConnection(sourceId, targetId);
    console.log('Connection removed');
  };

  // Handle node configuration changes
  const handleConfigChange = (nodeId: string, config: Partial<Node['config']> & { connection?: string }) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Handle connection changes separately
    if ('connection' in config) {
      if (node.type === 'router') {
        // For router nodes, update the specific choice connection
        const choiceId = config.connection?.split('-')[1];
        if (choiceId) {
          updateRouterConnection(nodeId, choiceId, config.connection);
        }
      } else {
        // For regular nodes, update the single connection
        updateNodeConnection(nodeId, config.connection);
      }
      // Remove connection from config to avoid duplicate handling
      const { connection, ...restConfig } = config;
      updateNodeConfig(nodeId, restConfig);
    } else {
      // Handle other config changes
      updateNodeConfig(nodeId, config);
    }
  };

  // Autosave when nodes change
  useEffect(() => {
    if (!moduleId || nodes.length === 0) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, moduleId]);

  // Handle wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheelZoom, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheelZoom);
  }, [handleWheelZoom]);

  const handleSave = async () => {
    if (!moduleId) {
      setState(prev => ({
        ...prev,
        saveError: 'No module ID found',
        saveStatus: 'error'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isSaving: true,
      saveStatus: 'saving',
      saveError: null
    }));
    
    const moduleContent = {
      nodes: nodes.map(node => ({
        ...node,
        position: {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y)
        }
      }))
    };

    try {
      const { error } = await supabase
        .from('modules')
        .update({
          content: moduleContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId)
        .select();

      if (error) throw error;

      setState(prev => ({ ...prev, saveStatus: 'saved', isSaving: false }));

      setTimeout(() => {
        setState(prev => ({ ...prev, saveStatus: null }));
      }, 2000);
    } catch (err) {
      console.error('Error saving module:', err);
      setState(prev => ({
        ...prev,
        saveError: err instanceof Error ? err.message : 'Failed to save module',
        saveStatus: 'error',
        isSaving: false
      }));
      
      setTimeout(() => {
        setState(prev => ({ ...prev, saveStatus: null, saveError: null }));
      }, 3000);
    }
  };

  // Load saved nodes
  useEffect(() => {
    const loadNodes = async () => {
      if (!moduleId) {
        setState(prev => ({ ...prev, isInitialLoad: false }));
        return;
      }

      try {
        const { data: module, error } = await supabase
          .from('modules')
          .select('content')
          .eq('id', moduleId)
          .single();

        if (error) throw error;

        if (module?.content?.nodes) {
          setNodes(module.content.nodes);
        } else {
          setNodes([]);
        }
      } catch (err) {
        console.error('Error loading module:', err);
        setState(prev => ({
          ...prev,
          saveError: err instanceof Error ? err.message : 'Failed to load module',
          saveStatus: 'error'
        }));
      } finally {
        setState(prev => ({ ...prev, isInitialLoad: false }));
      }
    };

    loadNodes();
  }, [moduleId, setNodes]);

  useEffect(() => {
    if (!moduleId && !isInitialLoad) {
      navigate('/studio/content/module', { replace: true });
    }
  }, [moduleId, navigate, isInitialLoad]);

  if (!moduleId && !isInitialLoad) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Module Selected</h2>
          <p className="text-gray-600 mb-4">Please create or select a module first.</p>
          <button
            onClick={() => navigate('/studio/content/module')}
            className="px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors"
          >
            Go to Module Summary
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative">
      <NodeCanvas
        zoom={zoom}
        nodes={nodes}
        selectedNode={selectedNode}
        onNodeClick={(nodeId) => {
          setSelectedNode(nodeId);
          setConfigureNode(nodeId);
        }}
        onNodeDelete={deleteNode}
        onConfigChange={handleConfigChange}
        onConnect={handleConnect}
        onEdgeDelete={handleEdgeDelete}
      />

      {/* Floating Toolbar */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 flex items-center justify-between z-[47] w-[calc(100%-2rem)] max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setIsAddingNode(true)}
            className="flex items-center px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Node
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-gray-600 hover:text-[#008080] transition-colors">
              Check for Errors
            </button>
            <div className="flex items-center gap-2">
              {saveStatus === 'saved' && (
                <div className="flex items-center text-green-600 text-sm">
                  <Check className="w-4 h-4 mr-1" />
                  Saved
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="text-red-600 text-sm">
                  {saveError || 'Error saving'}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button
              onClick={() => handleZoom(-1, { x: 0, y: 0 })}
              className="p-2 text-gray-600 hover:text-[#008080] hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 min-w-[4rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(1, { x: 0, y: 0 })}
              className="p-2 text-gray-600 hover:text-[#008080] hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 text-gray-600 hover:text-[#008080] hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Zoom"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isAddingNode && (
        <AddNodeModal
          onClose={() => setIsAddingNode(false)}
          onAddNode={(type) => {
            addNode(type);
            setIsAddingNode(false);
          }}
        />
      )}

      {configureNode && (
        <NodeConfigModal
          node={nodes.find(n => n.id === configureNode)!}
          nodes={nodes}
          onClose={() => setConfigureNode(null)}
          onChange={(config) => handleConfigChange(configureNode, config)}
        />
      )}
    </div>
  );
}

export default Build;