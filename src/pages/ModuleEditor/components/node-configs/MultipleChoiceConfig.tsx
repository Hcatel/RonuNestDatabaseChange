import React from 'react';
import { X } from 'lucide-react';
import type { Node } from '../../types';

interface MultipleChoiceConfigProps {
  config: Node['config'];
  onChange: (config: Partial<Node['config']>) => void;
}

export function MultipleChoiceConfig({ config, onChange }: MultipleChoiceConfigProps) {
  const handleAddChoice = (e: React.MouseEvent) => {
    // Prevent event from bubbling up and closing the modal
    e.preventDefault();
    e.stopPropagation();
    
    const newChoices = [...(config.choices || []), {
      id: `choice-${Date.now()}`,
      text: '',
    }];
    onChange({ choices: newChoices });
  };

  const handleRemoveChoice = (e: React.MouseEvent, choiceId: string) => {
    // Prevent event from bubbling up and closing the modal
    e.preventDefault();
    e.stopPropagation();
    
    const newChoices = config.choices?.filter(c => c.id !== choiceId);
    onChange({ choices: newChoices });
  };

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question
        </label>
        <input
          type="text"
          value={config.question}
          onChange={(e) => onChange({ question: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
        />
      </div>
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={config.allowMultiple}
          onChange={(e) => onChange({ allowMultiple: e.target.checked })}
          className="mr-2"
        />
        <span className="text-sm text-gray-600">
          Allow multiple selections
        </span>
      </label>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choices
        </label>
        <div className="space-y-2">
          {config.choices?.map((choice, index) => (
            <div key={choice.id} className="flex gap-2">
              <input
                type="text"
                value={choice.text}
                onChange={(e) => {
                  const newChoices = [...(config.choices || [])];
                  newChoices[index] = { ...choice, text: e.target.value };
                  onChange({ choices: newChoices });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                placeholder="Choice text"
              />
              <button
                onClick={(e) => handleRemoveChoice(e, choice.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddChoice}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#008080] hover:text-[#008080] transition-colors"
          >
            Add Choice
          </button>
        </div>
      </div>
    </div>
  );
}