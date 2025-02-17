import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Grip, ToggleLeft as Toggle, X } from 'lucide-react';
import { getNodeIcon } from '../../utils';
import type { Node } from '../../types';

interface CustomNodeData extends Node {
  onDelete: () => void;
  onConfigChange: (config: Partial<Node['config']>) => void;
  isSelected: boolean;
  onClick: () => void;
}

const CustomNodeComponent = ({ data, isConnectable }: NodeProps<CustomNodeData>) => {
  const { title, type, color, config, onDelete, onConfigChange, isSelected, onClick } = data;

  // For router nodes, create multiple output handles based on choices
  const renderOutputHandles = () => {
    if (type === 'router' && config.choices) {
      return config.choices.map((choice, index) => {
        const totalChoices = config.choices?.length || 1;
        const spacing = 100 / (totalChoices + 1);
        const position = (index + 1) * spacing;

        return (
          <Handle
            key={choice.id}
            type="source"
            position={Position.Right}
            id={`choice-${choice.id}`}
            style={{
              background: color,
              width: '12px',
              height: '12px',
              top: `${position}%`
            }}
            isConnectable={isConnectable}
          />
        );
      });
    }

    // For non-router nodes, return single output handle
    return (
      <Handle
        type="source"
        position={Position.Right}
        style={{ 
          background: color,
          width: '12px',
          height: '12px'
        }}
        isConnectable={isConnectable}
      />
    );
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg ${
        type === 'router' ? 'w-[250px] min-h-[150px]' : 'w-[200px]'
      } ${
        isSelected ? 'ring-2 ring-[#008080]' : ''
      } transition-all duration-200 ease-in-out transform hover:scale-[1.02] relative`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          background: '#fff',
          border: '2px solid #e2e8f0',
          width: '12px',
          height: '12px'
        }}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div 
            className={`p-1 rounded bg-opacity-10 text-opacity-100`}
            style={{ backgroundColor: `${color}20`, color }}
          >
            {React.createElement(getNodeIcon(type), { className: "w-5 h-5" })}
          </div>
          <span className="font-medium text-gray-900">{config.title || title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
              // This is for dragging
            }}
          >
            <Grip className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            className="p-1 hover:bg-red-50 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {type === 'router' && config.question && (
          <p className="text-sm text-gray-600 mb-4">{config.question}</p>
        )}
        {type !== 'router' && (
          <div className="flex items-center justify-between text-sm text-gray-600 py-1">
            <span>Required</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfigChange({ required: !config.required });
              }}
              className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.required ? 'bg-[#ff4d00]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  config.required ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {renderOutputHandles()}
    </div>
  );
};

export const CustomNode = memo(CustomNodeComponent);