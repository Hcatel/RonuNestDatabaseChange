import React from 'react';
import type { Node } from '../../types';

interface MessageConfigProps {
  config: Node['config'];
  onChange: (config: Partial<Node['config']>) => void;
}

export function MessageConfig({ config, onChange }: MessageConfigProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Content
      </label>
      <textarea
        value={config.content}
        onChange={(e) => onChange({ content: e.target.value })}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
      />
    </div>
  );
}