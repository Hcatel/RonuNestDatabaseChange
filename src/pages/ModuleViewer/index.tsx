import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CompletionPage } from './components/CompletionPage';
import { MessageNode } from './components/nodes/MessageNode';
import { VideoNode } from './components/nodes/VideoNode';
import { RouterNode } from './components/nodes/RouterNode';
import { TextInputNode } from './components/nodes/TextInputNode';
import { MultipleChoiceNode } from './components/nodes/MultipleChoiceNode';
import { RankingNode } from './components/nodes/RankingNode';
import { useModuleNavigation } from './hooks/useModuleNavigation';
import { useModuleSharing } from './hooks/useModuleSharing';
import type { Node } from '../ModuleEditor/types';

interface ModuleData {
  id: string;
  title: string;
  description: string;
  content: {
    nodes: Node[];
  };
}

interface RouteParams {
  moduleId: string;
}

interface Responses {
  [key: string]: any;
}

interface RouterNodeProps {
  node: Node;
  onResponse: (response: any) => void;
  previousNode?: Node;
}

function ModuleViewer() {
  const { moduleId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [module, setModule] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const {
    currentNodeIndex,
    setCurrentNodeIndex,
    responses,
    setResponses,
    handleResponse,
    handleNext
  } = useModuleNavigation(module?.content?.nodes || []);

  const {
    showShareMenu,
    setShowShareMenu,
    copySuccess,
    handleShare,
    handleCopyLink
  } = useModuleSharing();

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate('/explore');
  };

  useEffect(() => {
    if (!moduleId) {
      setError('No module ID provided');
      return;
    }

    const loadModule = async () => {
      try {
        const { data: module, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', moduleId)
          .single();

        if (error) throw error;
        if (!module) throw new Error('Module not found');

        setModule(module);
      } catch (err) {
        console.error('Error loading module:', err);
        setError(err instanceof Error ? err.message : 'Failed to load module');
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Module not found'}
          </h1>
          <button
            onClick={() => navigate('/explore')}
            className="text-[#008080] hover:text-[#006666]"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const nodes = module.content?.nodes || [];
  const currentNode = nodes[currentNodeIndex];
  const previousNode = nodes[currentNodeIndex - 1];

  console.log('ModuleViewer Render', {
    currentNodeType: currentNode?.type,
    currentNodeId: currentNode?.id,
    isOverlay: currentNode?.type === 'router' && currentNode?.config?.overlay,
    timestamp: new Date().toISOString()
  });

  if (currentNodeIndex === nodes.length) {
    return (
      <div className="fixed inset-0 bg-gray-50 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 min-h-screen flex items-center justify-center">
          <CompletionPage
            moduleTitle={module.title}
            showShareMenu={showShareMenu}
            setShowShareMenu={setShowShareMenu}
            handleShare={handleShare}
            handleCopyLink={handleCopyLink}
            copySuccess={copySuccess}
          />
        </div>
      </div>
    );
  }

  if (!currentNode) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-auto">
      <div className="max-w-3xl mx-auto px-4 py-12 min-h-[calc(100vh-4rem)]">
        {/* Exit Button */}
        <button
          onClick={handleExit}
          className="fixed top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Exit Module?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to exit? Your progress will not be saved.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExit}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Exit Module
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Previous node content for router overlay */}
        {currentNode.type === 'router' && 
         currentNode.config?.overlay && 
         previousNode && (
          <>
            {previousNode.type === 'message' && (
              <MessageNode
                key={`${previousNode.id}-overlay`}
                node={previousNode}
                onNext={() => {}}
                onFinish={() => {}}
                isOverlaid
              />
            )}
            {previousNode.type === 'video' && (
              <VideoNode
                key={`${previousNode.id}-overlay`}
                node={previousNode}
                onNext={() => {}}
                onFinish={() => {}}
                isOverlaid
              />
            )}
          </>
        )}

        {currentNode.type === 'router' && (
          <RouterNode
            key={currentNode.id}
            node={currentNode}
            onResponse={handleResponse}
            previousNode={currentNode.config?.overlay ? previousNode : undefined}
          />
        )}
        {currentNode.type === 'textInput' && (
          <TextInputNode
            key={currentNode.id}
            node={currentNode}
            response={responses[currentNode.id] || ''}
            onResponseChange={(response) => setResponses(prev => ({
              ...prev,
              [currentNode.id]: response
            }))}
            onSubmit={() => handleResponse(responses[currentNode.id])}
          />
        )}
        {currentNode.type === 'multipleChoice' && (
          <MultipleChoiceNode
            key={currentNode.id}
            node={currentNode}
            selectedChoices={responses[currentNode.id] || []}
            onSelect={(choiceId) => handleResponse(
              currentNode.config.allowMultiple ? 
              [...(responses[currentNode.id] || []), choiceId] : 
              choiceId
            )}
            onNext={handleNext}
          />
        )}
        {currentNode.type === 'ranking' && (
          <RankingNode
            key={currentNode.id}
            node={currentNode}
            rankedItems={responses[currentNode.id] || 
              currentNode.config.rankingItems?.map((item, index) => ({ 
                id: index, 
                text: item 
              })) || []}
            onReorder={(items) => setResponses(prev => ({
              ...prev,
              [currentNode.id]: items
            }))}
            onNext={handleNext}
          />
        )}
        {currentNode.type === 'message' && (
          <MessageNode
            key={currentNode.id}
            node={currentNode}
            onNext={handleNext}
            onFinish={() => setCurrentNodeIndex(nodes.length)}
          />
        )}
        {currentNode.type === 'video' && (
          <VideoNode
            key={currentNode.id}
            node={currentNode}
            onNext={handleNext}
            onFinish={() => setCurrentNodeIndex(nodes.length)}
          />
        )}
      </div>
    </div>
  );
}

export default ModuleViewer;