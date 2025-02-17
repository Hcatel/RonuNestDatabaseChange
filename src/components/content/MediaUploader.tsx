import React from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface MediaUploaderProps {
  isUploading: boolean;
  uploadProgress: number;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function MediaUploader({ isUploading, uploadProgress, onFileSelect, fileInputRef }: MediaUploaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl text-gray-700 mb-2">My Media</h2>
      <p className="text-gray-600 mb-6">
        Upload and manage your media files here. They can be used in your modules and playlists.
      </p>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Media</h3>
        <p className="text-sm text-gray-600 mb-4">
          Supported formats: images, videos, audio, and documents (max 50MB)
        </p>
        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-[#008080] focus:outline-none">
          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-[#008080] animate-spin" />
                <div className="text-center">
                  <div className="font-medium text-gray-600 mb-1">Uploading...</div>
                  <div className="text-sm text-gray-500">{Math.round(uploadProgress)}%</div>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="font-medium text-gray-600">
                  Drop files to upload or <span className="text-[#008080]">browse</span>
                </span>
              </>
            )}
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            multiple 
            onChange={onFileSelect}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}