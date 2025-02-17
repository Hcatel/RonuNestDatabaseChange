import React, { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Playlist } from '../../types/content';

interface PlaylistToPlaylistModalProps {
  playlistId: string;
  onClose: () => void;
}

export function PlaylistToPlaylistModal({ playlistId, onClose }: PlaylistToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get all playlists except the current one
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('creator_id', user.id)
        .neq('id', playlistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);

      // Load existing playlist associations
      const { data: existingAssociations, error: associationsError } = await supabase
        .from('playlist_playlists')
        .select('parent_playlist_id')
        .eq('child_playlist_id', playlistId);

      if (associationsError) throw associationsError;

      setSelectedPlaylists(new Set(existingAssociations.map(a => a.parent_playlist_id)));
    } catch (err) {
      console.error('Error loading playlists:', err);
      setError(err instanceof Error ? err.message : 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Get current associations
      const { data: currentAssociations, error: fetchError } = await supabase
        .from('playlist_playlists')
        .select('parent_playlist_id')
        .eq('child_playlist_id', playlistId);

      if (fetchError) throw fetchError;

      const currentPlaylistIds = new Set(currentAssociations.map(a => a.parent_playlist_id));
      const selectedPlaylistIds = Array.from(selectedPlaylists);

      // Remove from unselected playlists
      const playlistsToRemove = Array.from(currentPlaylistIds)
        .filter(id => !selectedPlaylists.has(id));

      if (playlistsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('playlist_playlists')
          .delete()
          .eq('child_playlist_id', playlistId)
          .in('parent_playlist_id', playlistsToRemove);

        if (removeError) throw removeError;
      }

      // Add to newly selected playlists
      for (const parent_playlist_id of selectedPlaylistIds) {
        if (!currentPlaylistIds.has(parent_playlist_id)) {
          // Get the current highest position for this playlist
          const { data: positionData, error: positionError } = await supabase
            .from('playlist_playlists')
            .select('position')
            .eq('parent_playlist_id', parent_playlist_id)
            .order('position', { ascending: false })
            .limit(1);

          if (positionError) throw positionError;

          const nextPosition = positionData && positionData.length > 0 
            ? positionData[0].position + 1 
            : 0;

          // Insert the new playlist with the next available position
          const { error: addError } = await supabase
            .from('playlist_playlists')
            .insert({
              parent_playlist_id,
              child_playlist_id: playlistId,
              position: nextPosition
            });

          if (addError) throw addError;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving playlist selections:', err);
      setError(err instanceof Error ? err.message : 'Failed to save playlist selections');
    } finally {
      setSaving(false);
    }
  };

  const togglePlaylist = (playlistId: string) => {
    setSelectedPlaylists(prev => {
      const next = new Set(prev);
      if (next.has(playlistId)) {
        next.delete(playlistId);
      } else {
        next.add(playlistId);
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add to Playlists</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2" />
            Successfully updated playlists
          </div>
        )}

        <div className="flex-1 overflow-auto mb-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-[#008080]" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No other playlists found.
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map(playlist => (
                <label
                  key={playlist.id}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlaylists.has(playlist.id)}
                    onChange={() => togglePlaylist(playlist.id)}
                    className="w-4 h-4 text-[#008080] rounded border-gray-300 focus:ring-[#008080]"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{playlist.title}</div>
                    {playlist.description && (
                      <div className="text-sm text-gray-500">{playlist.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}