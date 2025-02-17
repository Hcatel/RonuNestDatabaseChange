import React from 'react';
import { X } from 'lucide-react';
import type { Node } from '../../types';

interface RouterConfigProps {
  config: Node['config'];
  onChange: (config: Partial<Node['config']>) => void;
  nodes: Node[];
}

export function RouterConfig({ config, onChange, nodes = [] }: RouterConfigProps) {
  // Ensure choices is always an array and has required properties
  const choices = config.choices?.map(choice => ({
    id: choice.id || `choice-${Date.now()}-${Math.random()}`,
    text: choice.text || '',
    connection: choice.connection || ''
  })) || [];

  const handleAddChoice = (e: React.MouseEvent) => {
    // Prevent event from bubbling up and closing the modal
    e.preventDefault();
    e.stopPropagation();
    
    const newChoices = [
      ...choices,
      {
        id: `choice-${Date.now()}-${Math.random()}`,
        text: '',
        connection: ''
      }
    ];
    onChange({ choices: newChoices });
  };

  const handleRemoveChoice = (e: React.MouseEvent, choiceId: string) => {
    // Prevent event from bubbling up and closing the modal
    e.preventDefault();
    e.stopPropagation();
    
    const newChoices = choices.filter(c => c.id !== choiceId);
    onChange({ choices: newChoices });
  };

  const handleChoiceTextChange = (choiceId: string, text: string) => {
    const newChoices = choices.map(choice =>
      choice.id === choiceId ? { ...choice, text } : choice
    );
    onChange({ choices: newChoices });
  };

  const handleConnectionChange = (choiceId: string, connection: string) => {
    const newChoices = choices.map(choice =>
      choice.id === choiceId ? { ...choice, connection } : choice
    );
    onChange({ choices: newChoices });
  };

  // Filter out the current node from available nodes to prevent self-reference
  const availableNodes = nodes.filter(n => n.id !== config.id);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question
        </label>
        <input
          type="text"
          value={config.question || ''}
          onChange={(e) => onChange({ question: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
          placeholder="Enter your question"
        />
      </div>

      {/* Overlay Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Overlay Mode</h3>
          <p className="text-sm text-gray-600">
            Show this router as an overlay on the previous page
          </p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange({ overlay: !config.overlay });
          }}
          type="button"
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            config.overlay ? 'bg-[#ff4d00]' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              config.overlay ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choices
        </label>
        <div className="space-y-2">
          {choices.map((choice) => (
            <div key={choice.id} className="flex gap-2">
              <input
                type="text"
                value={choice.text}
                onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                placeholder="Choice text"
              />
              <select
                value={choice.connection || ''}
                onChange={(e) => handleConnectionChange(choice.id, e.target.value)}
                className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              >
                <option value="">Connect to node</option>
                {availableNodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.config.title || node.title}
                  </option>
                ))}
              </select>
              <button
                onClick={(e) => handleRemoveChoice(e, choice.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddChoice}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#008080] hover:text-[#008080] transition-colors"
            type="button"
          >
            Add Choice
          </button>
        </div>
      </div>
    </div>
  );
}