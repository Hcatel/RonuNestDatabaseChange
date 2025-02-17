import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Playlist } from '../types/content';

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPlaylists([]);
        return;
      }

      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching playlists:', error);
        throw new Error('Failed to fetch playlists. Please try again.');
      }

      setPlaylists(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch playlists');
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    playlists,
    loading,
    error,
    fetchPlaylists
  };
}