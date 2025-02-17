import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GripVertical, Plus, Search, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Module {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  visibility: 'draft' | 'private' | 'public' | 'restricted';
  created_at: string;
  updated_at: string;
}

interface NestedPlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  visibility: 'public' | 'private' | 'restricted';
  created_at: string;
  updated_at: string;
}

interface PlaylistModule {
  id: string;
  playlist_id: string;
  module_id: string;
  position: number;
  module: Module;
}

export default function PlaylistContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playlistId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlistModules, setPlaylistModules] = useState<PlaylistModule[]>([]);
  const [nestedPlaylists, setNestedPlaylists] = useState<NestedPlaylist[]>([]);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedModule, setDraggedModule] = useState<PlaylistModule | null>(null);

  useEffect(() => {
    if (playlistId) {
      loadPlaylistModules();
      loadNestedPlaylists();
      loadAvailableModules();
    }
  }, [playlistId]);

  const loadNestedPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlist_playlists')
        .select(`
          id,
          position,
          child_playlist:child_playlist_id (
            id,
            title,
            description,
            thumbnail_url,
            visibility,
            created_at,
            updated_at
          )
        `)
        .eq('parent_playlist_id', playlistId)
        .order('position');

      if (error) throw error;
      
      // Transform the data to match our NestedPlaylist interface
      const playlists = data
        .map(item => item.child_playlist)
        .filter(Boolean) as NestedPlaylist[];
      
      setNestedPlaylists(playlists);
    } catch (err) {
      console.error('Error loading nested playlists:', err);
      setError(err instanceof Error ? err.message : 'Failed to load nested playlists');
    }
  };

  const loadPlaylistModules = async () => {
    try {
      const { data, error } = await supabase
        .from('playlist_modules')
        .select('*, module:modules(*)')
        .eq('playlist_id', playlistId)
        .order('position');

      if (error) throw error;
      setPlaylistModules(data || []);
    } catch (err) {
      console.error('Error loading playlist modules:', err);
      setError(err instanceof Error ? err.message : 'Failed to load playlist modules');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableModules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableModules(data || []);
    } catch (err) {
      console.error('Error loading available modules:', err);
      setError(err instanceof Error ? err.message : 'Failed to load available modules');
    }
  };

  const handleAddModule = async (moduleId: string) => {
    try {
      const position = playlistModules.length;
      const { error } = await supabase
        .from('playlist_modules')
        .insert({
          playlist_id: playlistId,
          module_id: moduleId,
          position
        });

      if (error) throw error;
      await loadPlaylistModules();
      setIsAddingModule(false);
    } catch (err) {
      console.error('Error adding module:', err);
      setError(err instanceof Error ? err.message : 'Failed to add module');
    }
  };

  const handleRemoveModule = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_modules')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('module_id', moduleId);

      if (error) throw error;
      await loadPlaylistModules();
    } catch (err) {
      console.error('Error removing module:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove module');
    }
  };

  const handleDragStart = (module: PlaylistModule) => {
    setIsDragging(true);
    setDraggedModule(module);
  };

  const handleDragOver = (e: React.DragEvent, targetModule: PlaylistModule) => {
    e.preventDefault();
    if (!draggedModule || draggedModule.id === targetModule.id) return;

    const newModules = [...playlistModules];
    const draggedIndex = newModules.findIndex(m => m.id === draggedModule.id);
    const targetIndex = newModules.findIndex(m => m.id === targetModule.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder array
    newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, draggedModule);

    // Update positions
    newModules.forEach((module, index) => {
      module.position = index;
    });

    setPlaylistModules(newModules);
  };

  const handleDragEnd = async () => {
    setIsDragging(false);
    setDraggedModule(null);

    // Save new positions to database
    try {
      const updates = playlistModules.map(({ id, position }) => ({
        id,
        position
      }));

      const { error } = await supabase
        .from('playlist_modules')
        .upsert(updates);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating positions:', err);
      setError(err instanceof Error ? err.message : 'Failed to update positions');
      await loadPlaylistModules(); // Reload original order
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#333333]">Playlist Content</h2>
        <button
          onClick={() => setIsAddingModule(true)}
          className="flex items-center px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Module
        </button>
      </div>

      {/* Module List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Modules</h3>
          <p className="text-sm text-gray-600">
            Drag and drop to reorder content in your playlist
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {/* Nested Playlists */}
          {nestedPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              className="flex items-center p-4"
            >
              <div 
                className="cursor-move p-2 hover:bg-gray-100 rounded"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              <div 
                onClick={() => navigate(`/studio/content/playlist?id=${playlist.id}`)}
                className="flex items-center flex-1 ml-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
              >
                <img
                  src={playlist.thumbnail_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'}
                  alt={playlist.title}
                  className="w-12 h-8 object-cover rounded"
                />
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">
                    {playlist.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {playlist.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemovePlaylist(playlist.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Modules */}
          {playlistModules.map((playlistModule) => (
            <div
              key={playlistModule.id}
              draggable
              onDragStart={() => handleDragStart(playlistModule)}
              onDragOver={(e) => handleDragOver(e, playlistModule)}
              onDragEnd={handleDragEnd}
              className={`flex items-center p-4 group ${
                isDragging && draggedModule?.id === playlistModule.id
                  ? 'opacity-50'
                  : ''
              }`}
            >
              <div 
                className="cursor-move p-2 hover:bg-gray-100 rounded"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              <div 
                onClick={() => navigate(`/studio/content/module?id=${playlistModule.module.id}`)}
                className="flex items-center flex-1 ml-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
              >
                <img
                  src={playlistModule.module.thumbnail_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'}
                  alt={playlistModule.module.title}
                  className="w-12 h-8 object-cover rounded"
                />
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900 group-hover:text-[#008080] transition-colors">
                    {playlistModule.module.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {playlistModule.module.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveModule(playlistModule.module.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {playlistModules.length === 0 && nestedPlaylists.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                No content in this playlist yet. Click "Add Module" to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Module Modal */}
      {isAddingModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add Module</h2>
              <button
                onClick={() => setIsAddingModule(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              {availableModules
                .filter(module => 
                  module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  module.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(module => (
                  <button
                    key={module.id}
                    onClick={() => handleAddModule(module.id)}
                    className="w-full flex items-center p-4 hover:bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <img
                      src={module.thumbnail_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'}
                      alt={module.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div className="ml-4 text-left">
                      <h4 className="font-medium text-gray-900">{module.title}</h4>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}