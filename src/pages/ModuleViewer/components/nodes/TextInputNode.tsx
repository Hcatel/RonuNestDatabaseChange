import React from 'react';
import type { Node } from '../../../ModuleEditor/types';
import { ContinueButton } from '../ContinueButton';

interface TextInputNodeProps {
  node: Node;
  response: string;
  onResponseChange: (response: string) => void;
  onSubmit: () => void;
}

export function TextInputNode({ node, response, onResponseChange, onSubmit }: TextInputNodeProps) {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {node.config.title}
        </h2>
        <p className="text-lg text-gray-700 mb-8">{node.config.question}</p>
        <div className="space-y-2">
          <textarea
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            placeholder="Type your answer here..."
            value={response || ''}
            onChange={(e) => onResponseChange(e.target.value)}
          />
        </div>
        <ContinueButton
          onNext={onSubmit}
          isFinish={!node.connection}
        />
      </div>
    </div>
  );
}