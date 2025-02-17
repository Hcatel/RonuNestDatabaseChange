import React from 'react';
import type { Node } from '../../../ModuleEditor/types';
import { ContinueButton } from '../ContinueButton';

interface MessageNodeProps {
  node: Node;
  onNext: () => void;
  onFinish: () => void;
  isOverlaid?: boolean;
}

export function MessageNode({ node, onNext, onFinish, isOverlaid }: MessageNodeProps) {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {node.config.title}
        </h2>
        <div className="prose prose-lg">
          {node.config.content}
        </div>
        {!isOverlaid && (
          <ContinueButton
            onNext={node.connection ? onNext : onFinish}
            isFinish={!node.connection}
          />
        )}
      </div>
    </div>
  );
}