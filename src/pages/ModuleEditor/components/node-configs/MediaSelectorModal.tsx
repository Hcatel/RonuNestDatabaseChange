import React from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import type { StorageFile } from '../../../../types/content';
import { MediaSelector } from '../../../../components/MediaSelector';

interface MediaSelectorModalProps {
  title: string;
  acceptedTypes: string[];
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaSelectorModal({ title, acceptedTypes, onSelect, onClose }: MediaSelectorModalProps) {
  const handleMediaSelect = async (file: StorageFile) => {
    try {
      const { data } = supabase.storage
        .from('module-thumbnails')
        .getPublicUrl(file.name);

      onSelect(data.publicUrl);
    } catch (err) {
      console.error('Error selecting media:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <MediaSelector 
            onFileSelect={handleMediaSelect}
            acceptedTypes={acceptedTypes}
            inModal={true}
          />
        </div>
      </div>
    </div>
  );
}