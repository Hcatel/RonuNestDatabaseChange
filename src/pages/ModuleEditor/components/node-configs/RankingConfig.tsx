import React from 'react';
import { X } from 'lucide-react';
import type { Node } from '../../types';

interface RankingConfigProps {
  config: Node['config'];
  onChange: (config: Partial<Node['config']>) => void;
}

export function RankingConfig({ config, onChange }: RankingConfigProps) {
  const handleAddItem = (e: React.MouseEvent) => {
    // Prevent event from bubbling up and closing the modal
    e.preventDefault();
    e.stopPropagation();
    
    const newItems = [...(config.rankingItems || []), ''];
    onChange({ rankingItems: newItems });
  };

  const handleRemoveItem = (e: React.MouseEvent, index: number) => {
    // Prevent event from bubbling up and closing the modal
    e.preventDefault();
    e.stopPropagation();
    
    const newItems = [...(config.rankingItems || [])];
    newItems.splice(index, 1);
    onChange({ rankingItems: newItems });
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...(config.rankingItems || [])];
    newItems[index] = value;
    onChange({ rankingItems: newItems });
  };

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question
        </label>
        <input
          type="text"
          value={config.question || ''}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Enter your question"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Items to Rank
        </label>
        <div className="space-y-2">
          {config.rankingItems?.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder="Item text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
              <button
                onClick={(e) => handleRemoveItem(e, index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddItem}
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#008080] hover:text-[#008080] transition-colors"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}