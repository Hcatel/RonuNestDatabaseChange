import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Globe2, Lock, Users, Loader2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatFileSize } from '../../utils/formatters';
import type { User } from '@supabase/supabase-js';

export default function GroupDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupId = searchParams.get('id');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      loadGroup(groupId);
    }
  }, [groupId]);

  const loadGroup = async (id: string) => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user has access to this group
      const { data: group, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id) 
        .eq('creator_id', user.id)
        .single();

      if (error) throw error;
      
      if (group) {
        setName(group.name || '');
        setDescription(group.description || '');
        if (group.thumbnail_url) {
          setThumbnailPreview(group.thumbnail_url);
        }
      }
    } catch (err) {
      console.error('Error loading group:', err);
      setError(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate input
      if (!name.trim()) {
        throw new Error('Name is required');
      }

      let thumbnailUrl = thumbnailPreview;
      if (thumbnail) {
        // Validate file size
        if (thumbnail.size > 10 * 1024 * 1024) {
          throw new Error(`File size exceeds 10MB limit (${formatFileSize(thumbnail.size)})`);
        }

        // Validate file type
        if (!thumbnail.type.startsWith('image/')) {
          throw new Error('Only image files are allowed');
        }

        const fileExt = thumbnail.name.split('.').pop();
        const fileName = `group-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('module-thumbnails')
          .upload(fileName, thumbnail, { 
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Only get public URL if upload succeeded
        const { data: { publicUrl } } = await supabase.storage
          .from('module-thumbnails')
          .getPublicUrl(fileName);

        thumbnailUrl = publicUrl;
      }

      const groupData = {
        name,
        description,
        thumbnail_url: thumbnailUrl,
        updated_at: new Date().toISOString()
      };

      if (groupId) {
        // Update existing group
        const { error } = await supabase
          .from('groups')
          .update(groupData)
          .eq('id', groupId)
          .eq('creator_id', user.id);

        if (error) throw error;
      } else {
        // Create new group
        groupData.creator_id = user.id;

        const { data, error } = await supabase
          .from('groups')
          .insert(groupData)
          .select()
          .single();

        if (error) throw error;
        
        navigate(`/studio/learners/group/content?id=${data.id}`);
      }

      setError('Group saved successfully');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error saving group:', err); 
      setError(err instanceof Error ? err.message : 'Failed to save group');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {saveError && (
        <div className={`p-4 rounded-lg mb-8 ${
          saveError.includes('success')
            ? 'bg-green-50 text-green-600'
            : 'bg-red-50 text-red-600'
        }`}>
          {saveError}
        </div>
      )}

      {/* Group Details */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#333333] mb-6">Group Details</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent ${
                  !name.trim() ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {!name.trim() && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">
                  Required
                </span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              {thumbnailPreview ? (
                <div className="space-y-1 text-center">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="thumbnail"
                      className="relative cursor-pointer rounded-md font-medium text-[#008080] hover:text-[#006666] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#008080]"
                    >
                      <span>Change thumbnail</span>
                      <input id="thumbnail" type="file" className="sr-only" onChange={handleThumbnailChange} accept="image/*" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="thumbnail"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#008080] hover:text-[#006666] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#008080]"
                    >
                      <span>Upload a thumbnail</span>
                      <input id="thumbnail" type="file" className="sr-only" onChange={handleThumbnailChange} accept="image/*" />
                    </label>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Available Content */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#333333]">Available Content</h2>
            <p className="text-gray-600">Add content that members of this group can access</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {/* TODO: Show add content modal */}}
              className="flex items-center px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-4">
          <div className="border rounded-lg divide-y">
            <div className="p-4 text-center text-gray-500">
              No content added yet. Click "Add Content" to make modules and playlists available to group members.
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center px-8 py-4 bg-[#ff4d00] text-white rounded-lg font-semibold hover:bg-[#e64600] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
}