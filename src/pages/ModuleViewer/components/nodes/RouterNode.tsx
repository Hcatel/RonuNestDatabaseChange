import React from 'react';
import type { Node } from '../../../ModuleEditor/types';

interface RouterNodeProps {
  node: Node;
  onResponse: (response: string) => void;
  previousNode?: Node;
}

export function RouterNode({ node, onResponse, previousNode }: RouterNodeProps) {
  const choices = node.config.choices || [];
  
  // Helper function to get grid layout classes based on choice index and total choices
  const getChoiceLayoutClasses = (index: number, total: number) => {
    // For 1 choice, center it
    if (total === 1) {
      return 'col-span-2';
    }
    
    // For 2 choices, place side by side
    if (total === 2) {
      return 'col-span-1';
    }
    
    // For 3 choices
    if (total === 3) {
      if (index < 2) {
        return 'col-span-1'; // First two side by side
      }
      return 'col-span-2'; // Third centered below
    }
    
    // For 4 choices
    if (total === 4) {
      return 'col-span-1'; // 2x2 grid
    }
    
    // For 5 or more choices
    if (index < 2) {
      return 'col-span-1'; // First two side by side
    }
    if (index < 4) {
      return 'col-span-1'; // Next two side by side
    }
    return 'col-span-2'; // Rest centered below
  };

  const containerClasses = node.config.overlay 
    ? 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center'
    : 'fixed inset-0 bg-gray-50 flex items-center justify-center';

  const contentClasses = node.config.overlay
    ? 'bg-black/40 p-8 rounded-xl max-w-4xl w-full mx-auto'
    : 'max-w-4xl w-full mx-auto px-4';

  const titleClasses = node.config.overlay
    ? 'text-2xl font-bold text-white mb-4'
    : 'text-2xl font-bold text-gray-900 mb-4';

  const questionClasses = node.config.overlay
    ? 'text-lg text-gray-200 max-w-2xl mx-auto'
    : 'text-lg text-gray-700 max-w-2xl mx-auto';

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <div className="text-center">
          <h2 className={titleClasses}>
          {node.config.title}
          </h2>
          <p className={questionClasses}>
          {node.config.question}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
        {choices.map((choice, index) => {
          const layoutClass = getChoiceLayoutClasses(index, choices.length);
          
          return (
            <button
              key={choice.id}
              onClick={() => onResponse(choice.id)}
              className={`${layoutClass} 
                px-6 py-8 text-center rounded-xl transition-all duration-200
                ${node.config.overlay 
                  ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm' 
                  : 'bg-white border-2 border-gray-200 hover:border-[#008080] hover:bg-[#008080]/5'
                }
                hover:shadow-lg transform hover:-translate-y-0.5`}
            >
              <span className={`text-lg font-medium ${node.config.overlay ? 'text-white' : 'text-gray-900'}`}>
                {choice.text}
              </span>
            </button>
          );
        })}
        </div>
        </div>
    </div>
  );
}