import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface NodeTypeButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export function NodeTypeButton({ icon, title, description, onClick }: NodeTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start p-4 border-2 border-gray-200 rounded-lg hover:border-[#008080] hover:bg-[#008080]/5 transition-all duration-200 ease-in-out transform hover:scale-[1.02] text-left"
    >
      <div className="p-2 rounded bg-[#008080]/10 text-[#008080] mb-3">
        {React.createElement(icon, { className: "w-5 h-5" })}
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}