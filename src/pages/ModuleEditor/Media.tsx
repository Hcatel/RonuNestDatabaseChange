import React, { useState, useEffect, useRef } from 'react';
import { Plus, Filter, ChevronDown, MoreVertical, Upload, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StorageFile {
  id: number;
  name: string;
  metadata: {
    size: number;
    mimetype: string;
  };
  created_at: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function Media() {
  const [sortField, setSortField] = useState<'name' | 'type' | 'size' | 'dateAdded'>('dateAdded');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [mediaFiles, setMediaFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      const { data, error } = await supabase
        .storage
        .from('module-thumbnails')
        .list();

      if (error) throw error;
      setMediaFiles(data || []);
    } catch (err) {
      console.error('Error fetching media files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch media files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 50MB limit`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('module-thumbnails')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // Refresh the file list
      await fetchMediaFiles();
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('module-thumbnails')
        .remove([fileName]);

      if (error) throw error;

      // Refresh the file list
      await fetchMediaFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedMediaFiles = [...mediaFiles].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'size') {
      const sizeA = a.metadata.size;
      const sizeB = b.metadata.size;
      return (sizeA - sizeB) * direction;
    } else if (sortField === 'type') {
      const typeA = a.metadata.mimetype || '';
      const typeB = b.metadata.mimetype || '';
      return typeA.localeCompare(typeB) * direction;
    } else if (sortField === 'dateAdded') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return (dateA - dateB) * direction;
    } else {
      // Sort by name
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB) * direction;
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-[#008080] transition-colors border border-gray-200 rounded-lg">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <div className="text-sm text-gray-600">{mediaFiles.length} Total</div>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Upload Media
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl text-gray-700 mb-2">My Media</h2>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        <p className="text-gray-600 mb-6">
          Upload and manage your media files here. They can be used in your modules and playlists.
        </p>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Media</h3>
          <p className="text-sm text-gray-600 mb-4">
            Supported formats: images, videos, audio, and documents (max 50MB)
          </p>
          <label 
            className={`flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none ${
              isUploading ? 'cursor-not-allowed' : 'cursor-pointer hover:border-[#008080]'
            } focus:outline-none`}
          >
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
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              multiple 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-8 p-4">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                <button className="flex items-center hover:text-[#008080]">
                  Title
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center hover:text-[#008080]"
                >
                  Type
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                <button
                  onClick={() => handleSort('size')}
                  className="flex items-center hover:text-[#008080]"
                >
                  Size
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                <button
                  onClick={() => handleSort('dateAdded')}
                  className="flex items-center hover:text-[#008080]"
                >
                  Date Added
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </th>
              <th className="w-8 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sortedMediaFiles.map((file) => (
              <tr key={file.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900 hover:text-[#008080] cursor-pointer">
                    {file.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{file.metadata.mimetype}</td>
                <td className="px-4 py-3 text-gray-600">{formatFileSize(file.metadata.size)}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(file.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => handleDelete(file.name)}
                    className="p-1 hover:bg-red-50 rounded-lg group"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}