import React from 'react';
import { X, ToggleLeft as Toggle, Save } from 'lucide-react';
import { Node } from '../types';
import { MessageConfig } from './node-configs/MessageConfig';
import { VideoConfig } from './node-configs/VideoConfig';
import { RouterConfig } from './node-configs/RouterConfig';
import { TextInputConfig } from './node-configs/TextInputConfig';
import { MultipleChoiceConfig } from './node-configs/MultipleChoiceConfig';
import { RankingConfig } from './node-configs/RankingConfig';

interface NodeConfigModalProps {
  node: Node;
  nodes: Node[];
  onClose: () => void;
  onChange: (config: Partial<Node['config']> & { connection?: string }) => void;
}

function NodeConfigModal({ node, nodes, onClose, onChange }: NodeConfigModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const renderConfig = () => {
    switch (node.type) {
      case 'message':
        return <MessageConfig config={node.config} onChange={onChange} />;
      case 'video':
        return <VideoConfig config={node.config} onChange={onChange} />;
      case 'router':
        return <RouterConfig config={node.config} onChange={onChange} nodes={nodes} />;
      case 'textInput':
        return <TextInputConfig config={node.config} onChange={onChange} />;
      case 'multipleChoice':
        return <MultipleChoiceConfig config={node.config} onChange={onChange} />;
      case 'ranking':
        return <RankingConfig config={node.config} onChange={onChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Configure {node.title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            {node.type !== 'router' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Response Settings
                </label>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">
                    Required Response
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange({ required: !node.config.required })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      node.config.required ? 'bg-[#ff4d00]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        node.config.required ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={node.config.title || ''}
                onChange={(e) => onChange({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>

            {renderConfig()}
            
            {/* Node Connection - Only show for non-router nodes */}
            {node.type !== 'router' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connect to Node
                </label>
                <select
                  value={node.connection || ''}
                  onChange={(e) => onChange({ connection: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                >
                  <option value="">Select a node</option>
                  {nodes.filter(n => n.id !== node.id).map(n => (
                    <option key={n.id} value={n.id}>
                      {n.config.title || n.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export { NodeConfigModal };