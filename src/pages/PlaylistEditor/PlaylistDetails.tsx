import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Globe2, Lock, Users, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VisibilityOptionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

function VisibilityOption({ icon, label, description, isSelected, onClick }: VisibilityOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 text-left transition-all ${
        isSelected
          ? 'border-[#008080] bg-[#008080]/5'
          : 'border-gray-200 hover:border-[#008080]/30'
      }`}
    >
      <div className={`${isSelected ? 'text-[#008080]' : 'text-gray-600'}`}>
        {icon}
      </div>
      <h3 className={`font-medium mt-2 ${isSelected ? 'text-[#008080]' : 'text-gray-900'}`}>
        {label}
      </h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </button>
  );
}

type PlaylistVisibility = 'public' | 'private' | 'restricted';

export default function PlaylistDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playlistId = searchParams.get('id');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<PlaylistVisibility>('private');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playlistId) {
      loadPlaylist(playlistId);
    }
  }, [playlistId]);

  const loadPlaylist = async (id: string) => {
    setIsLoading(true);
    try {
      const { data: playlist, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (playlist) {
        setTitle(playlist.title || '');
        setDescription(playlist.description || '');
        setVisibility(playlist.visibility);
        if (playlist.thumbnail_url) {
          setThumbnailPreview(playlist.thumbnail_url);
        }
      }
    } catch (err) {
      console.error('Error loading playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
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
    if (!title.trim()) {
      setError('Title is required');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let thumbnailUrl = thumbnailPreview;
      if (thumbnail) {
        const fileExt = thumbnail.name.split('.').pop();
        const fileName = `playlist-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('module-thumbnails')
          .upload(fileName, thumbnail, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('module-thumbnails')
          .getPublicUrl(fileName);
        thumbnailUrl = publicUrl;
      }

      const playlistData = {
        title,
        description,
        visibility,
        thumbnail_url: thumbnailUrl,
        creator_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (playlistId) {
        const { error, data } = await supabase
          .from('playlists')
          .update(playlistData)
          .eq('id', playlistId)
          .select()
          .single();

        if (error) throw error;
        
        // Show success message
        setError('Playlist updated successfully');
        setTimeout(() => setError(null), 3000);
        
        // Navigate to content tab if this is a new playlist
        if (!playlistId) {
          navigate(`/studio/content/playlist/content?id=${data.id}`);
        }
      } else {
        const { error, data } = await supabase
          .from('playlists')
          .insert(playlistData)
          .select()
          .single();

        if (error) throw error;
        
        // Show success message
        setError('Playlist created successfully');
        setTimeout(() => setError(null), 3000);
        
        // Navigate to content tab
        navigate(`/studio/content/playlist/content?id=${data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save playlist');
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

      {/* Playlist Details */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#333333] mb-6">Playlist Details</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <div className="relative">
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter playlist name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent ${
                  !title.trim() ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {!title.trim() && (
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
              placeholder="Enter playlist description"
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
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Access Settings */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#333333] mb-6">Access Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VisibilityOption
            icon={<Globe2 className="w-5 h-5" />}
            label="Public"
            description="Anyone can access"
            isSelected={visibility === 'public'}
            onClick={() => setVisibility('public')}
          />
          <VisibilityOption
            icon={<Lock className="w-5 h-5" />}
            label="Private"
            description="Only you and invited users"
            isSelected={visibility === 'private'}
            onClick={() => setVisibility('private')}
          />
          <VisibilityOption
            icon={<Users className="w-5 h-5" />}
            label="Restricted"
            description="Specific groups only"
            isSelected={visibility === 'restricted'}
            onClick={() => setVisibility('restricted')}
          />
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