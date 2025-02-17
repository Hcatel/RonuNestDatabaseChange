import React from 'react';
import type { Node } from '../../types';

interface TextInputConfigProps {
  config: Node['config'];
  onChange: (config: Partial<Node['config']>) => void;
}

export function TextInputConfig({ config, onChange }: TextInputConfigProps) {
  return (
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
  );
}