import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentHeader } from '../components/content/ContentHeader';
import { FilterBar } from '../components/content/FilterBar';
import { MediaUploader } from '../components/content/MediaUploader';
import { ContentTable } from '../components/content/ContentTable';
import { useModules } from '../hooks/useModules';
import { usePlaylists } from '../hooks/usePlaylists';
import { useMediaFiles } from '../hooks/useMediaFiles';
import { useSort } from '../hooks/useSort';
import { useFilters } from '../hooks/useFilters';
import { formatFileSize } from '../utils/formatters';
import type { Module } from '../types/content';
import { ConnectionError } from '../components/ConnectionError';
import { checkSupabaseConnection } from '../lib/supabase';

export default function Content() {
  const [activeTab, setActiveTab] = useState<'modules' | 'playlists' | 'media'>('modules');
  const [connectionError, setConnectionError] = useState(false);
  const navigate = useNavigate();

  const { modules, loading: modulesLoading, error: modulesError, fetchModules } = useModules();
  const { playlists, fetchPlaylists } = usePlaylists();
  const { 
    mediaFiles, 
    isUploading, 
    uploadProgress, 
    fileInputRef,
    handleFileUpload,
    handleDelete,
    fetchMediaFiles 
  } = useMediaFiles();
  
  const { sortField, handleSort, sortMediaFiles } = useSort();
  const { filters, isFilterMenuOpen, setIsFilterMenuOpen, filterModules } = useFilters();

  useEffect(() => {
    fetchModules();
    fetchMediaFiles();
    fetchPlaylists();
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionError(!isConnected);
    };

    checkConnection();
  }, []);

  const handleRetryConnection = async () => {
    setConnectionError(false);
    const isConnected = await checkSupabaseConnection();
    setConnectionError(!isConnected);
    if (isConnected) {
      // Retry loading data
      fetchModules();
      fetchMediaFiles();
      fetchPlaylists();
    }
  };
  
  // Calculate filtered and sorted data
  const filteredModules = filterModules(modules);
  const sortedMediaFiles = sortMediaFiles(mediaFiles);

  if (connectionError) {
    return (
      <div className="flex-1 overflow-auto">
        <ContentHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="p-8">
          <ConnectionError 
            message="Unable to connect to RonuNest. Please check your connection and try again."
            onRetry={handleRetryConnection}
          />
        </div>
      </div>
    );
  }
  
  if (modulesLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <ContentHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-48"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (modulesError) {
    return (
      <div className="flex-1 overflow-auto">
        <ContentHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="p-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {modulesError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <ContentHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="p-8">
        <FilterBar
          activeTab={activeTab}
          totalItems={activeTab === 'modules' ? filteredModules.length : 
                     activeTab === 'playlists' ? playlists.length : 
                     mediaFiles.length}
          onFilterClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          onUploadClick={() => fileInputRef.current?.click()}
        />

        {activeTab === 'media' && (
          <MediaUploader
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onFileSelect={handleFileUpload}
            fileInputRef={fileInputRef}
          />
        )}

        <ContentTable
          activeTab={activeTab}
          modules={filteredModules}
          playlists={playlists}
          mediaFiles={sortedMediaFiles}
          onSort={handleSort}
          onDelete={handleDelete}
          formatFileSize={formatFileSize}
        />
      </main>
    </div>
  );
}