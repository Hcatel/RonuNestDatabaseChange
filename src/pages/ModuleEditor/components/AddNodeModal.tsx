import React from 'react';
import { FileText, Video, GitBranch, Type, ListChecks, MoveVertical, X } from 'lucide-react';
import { NodeTypeButton } from './NodeTypeButton';
import type { Node } from '../types';

interface AddNodeModalProps {
  onClose: () => void;
  onAddNode: (type: Node['type']) => void;
}

export function AddNodeModal({ onClose, onAddNode }: AddNodeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Node</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <NodeTypeButton
            icon={FileText}
            title="Message"
            description="Add rich text content with images"
            onClick={() => {
              console.log('Message node button clicked'); // Debug log
              onAddNode('message');
            }}
          />
          <NodeTypeButton
            icon={Video}
            title="Video"
            description="Add video content with controls"
            onClick={() => onAddNode('video')}
          />
          <NodeTypeButton
            icon={GitBranch}
            title="Router"
            description="Add branching logic"
            onClick={() => onAddNode('router')}
          />
          <NodeTypeButton
            icon={Type}
            title="Text Input"
            description="Add text response questions"
            onClick={() => onAddNode('textInput')}
          />
          <NodeTypeButton
            icon={ListChecks}
            title="Multiple Choice"
            description="Add single/multiple choice questions"
            onClick={() => onAddNode('multipleChoice')}
          />
          <NodeTypeButton
            icon={MoveVertical}
            title="Ranking"
            description="Add ranking questions"
            onClick={() => onAddNode('ranking')}
          />
        </div>
      </div>
    </div>
  );
}