import React from 'react';

interface ContentHeaderProps {
  activeTab: 'modules' | 'playlists' | 'media';
  onTabChange: (tab: 'modules' | 'playlists' | 'media') => void;
}

export function ContentHeader({ activeTab, onTabChange }: ContentHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#333333]">Nest Content</h1>
        <input
          type="search"
          placeholder="Search across your nest"
          className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
        />
      </div>

      {/* Tabs */}
      <div className="flex mt-8 bg-gray-100/50 p-1 rounded-lg space-x-1 w-fit">
        {['modules', 'playlists', 'media'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab as typeof activeTab)}
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white text-[#008080] shadow-sm'
                : 'text-gray-600 hover:text-[#008080] hover:bg-white/50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </header>
  );
}