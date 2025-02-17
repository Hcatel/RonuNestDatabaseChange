import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { StorageFile } from '../types/content';

export function useMediaFiles() {
  const [mediaFiles, setMediaFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMediaFiles = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMediaFiles([]);
        return;
      }

      const { data, error } = await supabase
        .storage
        .from('module-thumbnails')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Storage error:', error);
        throw new Error('Failed to fetch media files. Please ensure you have proper access.');
      }
      
      setMediaFiles(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching media files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch media files');
      setMediaFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to upload files');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
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

      await fetchMediaFiles();
      
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to delete files');

      const { error } = await supabase.storage
        .from('module-thumbnails')
        .remove([fileName]);

      if (error) throw error;
      await fetchMediaFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  return {
    mediaFiles,
    loading,
    error,
    isUploading,
    uploadProgress,
    fileInputRef,
    fetchMediaFiles,
    handleFileUpload,
    handleDelete
  };
}