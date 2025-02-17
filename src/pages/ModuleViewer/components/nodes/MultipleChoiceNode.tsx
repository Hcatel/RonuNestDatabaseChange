import React from 'react';
import type { Node } from '../../../ModuleEditor/types';
import { ContinueButton } from '../ContinueButton';

interface MultipleChoiceNodeProps {
  node: Node;
  selectedChoices: string[];
  onSelect: (choiceId: string) => void;
  onNext: () => void;
}

export function MultipleChoiceNode({ node, selectedChoices, onSelect, onNext }: MultipleChoiceNodeProps) {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {node.config.title}
        </h2>
        <p className="text-lg text-gray-700 mb-8">{node.config.question}</p>
        <div className="space-y-3">
          {node.config.choices?.map(choice => (
            <button
              key={choice.id}
              onClick={() => onSelect(choice.id)}
              disabled={!node.config.allowMultiple && selectedChoices.length > 0 && !selectedChoices.includes(choice.id)}
              className={`w-full px-6 py-4 text-left bg-white border-2 rounded-lg transition-colors ${
                selectedChoices.includes(choice.id)
                  ? 'border-[#008080] bg-[#008080]/5'
                  : 'border-gray-200 hover:border-[#008080] hover:bg-[#008080]/5'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {choice.text}
            </button>
          ))}
        </div>
        {selectedChoices.length > 0 && (
          <ContinueButton onNext={onNext} />
        )}
      </div>
    </div>
  );
}