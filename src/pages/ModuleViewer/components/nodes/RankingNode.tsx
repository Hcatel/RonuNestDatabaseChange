import React from 'react';
import type { Node } from '../../../ModuleEditor/types';
import { ContinueButton } from '../ContinueButton';

interface RankingItem {
  id: number;
  text: string;
}

interface RankingNodeProps {
  node: Node;
  rankedItems: RankingItem[];
  onReorder: (items: RankingItem[]) => void;
  onNext: () => void;
}

export function RankingNode({ node, rankedItems, onReorder, onNext }: RankingNodeProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-gray-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-gray-50');
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-50');
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex) return;

    const newItems = [...rankedItems];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    onReorder(newItems);
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {node.config.title}
        </h2>
        <p className="text-lg text-gray-700 mb-8">{node.config.question}</p>
        <div className="space-y-2 select-none">
          {rankedItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className="flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg cursor-move transition-all duration-200 hover:shadow-md hover:border-[#008080]/30"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-[#008080]/10 rounded-full text-[#008080] font-semibold">
                {index + 1}
              </div>
              <span className="flex-1">{item.text}</span>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-sm">Drag to reorder</span>
              </div>
            </div>
          ))}
        </div>
        {rankedItems.length > 0 && (
          <ContinueButton onNext={onNext} />
        )}
      </div>
    </div>
  );
}