import React from 'react';
import { Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FilterBarProps {
  activeTab: 'modules' | 'playlists' | 'media';
  totalItems: number;
  onFilterClick: () => void;
  onUploadClick: () => void;
}

export function FilterBar({ activeTab, totalItems, onFilterClick, onUploadClick }: FilterBarProps) {
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (activeTab === 'modules') {
      navigate('/studio/content/module');
    } else if (activeTab === 'playlists') {
      navigate('/studio/content/playlist');
    } else if (activeTab === 'media') {
      onUploadClick();
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onFilterClick}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-[#008080] transition-colors border border-gray-200 rounded-lg"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
        <div className="text-sm text-gray-600">{totalItems} Total</div>
      </div>
      <button
        onClick={handleActionClick}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium shadow-sm"
      >
        <Plus className="w-5 h-5" />
        {activeTab === 'playlists' ? 'Create Playlist' : activeTab === 'modules' ? 'Create Module' : 'Upload Media'}
      </button>
    </div>
  );
}