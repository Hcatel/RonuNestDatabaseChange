interface PlaylistModule {
  id: string;
  playlist_id: string;
  module_id: string | null;
  sub_playlist_id: string | null;
  position: number; 
  module?: Module;
  sub_playlist?: NestedPlaylist;
}

const loadPlaylistModules = async () => {
  try {
    const { data, error } = await supabase
      .from('playlist_items')
      .select(`
        *,
        module:modules(*),
        sub_playlist:playlists(*)
      `)
      .eq('playlist_id', playlistId)
      .order('position');

    if (error) throw error;
    
    // Transform data to handle both modules and sub-playlists
    const items = (data || []).map(item => ({
      ...item,
      module: item.module_id ? item.module : null,
      sub_playlist: item.sub_playlist_id ? item.sub_playlist : null
    }));
    
    setPlaylistModules(items);
  } catch (err) {
    console.error('Error loading playlist modules:', err);
    setError(err instanceof Error ? err.message : 'Failed to load playlist modules');
  }
};

const handleAddModule = async (moduleId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify user has access to both playlist and module
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('creator_id')
      .eq('id', playlistId)
      .single();

    if (playlistError) throw playlistError;
    if (playlist.creator_id !== user.id) throw new Error('Unauthorized');

    // Get the current highest position
    const { data: positionData, error: positionError } = await supabase
      .from('playlist_items')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);

    if (positionError) throw positionError;

    const position = positionData && positionData.length > 0
      ? positionData[0].position + 1
      : 0;

    const { error } = await supabase
      .from('playlist_items')
      .insert({
        playlist_id: playlistId,
        module_id: moduleId,
        sub_playlist_id: null,
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
      .from('playlist_items')
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

const handleRemovePlaylist = async (playlistId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify user has access to the parent playlist
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('creator_id')
      .eq('id', playlistId)
      .single();

    if (playlistError) throw playlistError;
    if (playlist.creator_id !== user.id) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('playlist_items')
      .delete()
      .eq('sub_playlist_id', playlistId);

    if (error) throw error;
    await loadNestedPlaylists();
  } catch (err) {
    console.error('Error removing playlist:', err);
    setError(err instanceof Error ? err.message : 'Failed to remove playlist');
  }
};

const handleDragEnd = async () => {
  setIsDragging(false);
  setDraggedModule(null);
  
  if (!playlistModules.length) return;

  // Save new positions to database
  try {
    const updates = playlistModules.map(({ id, position }) => ({
      id,
      position
    }));

    const { error } = await supabase
      .from('playlist_items')
      .upsert(updates);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating positions:', err);
    setError(err instanceof Error ? err.message : 'Failed to update positions');
    await loadPlaylistModules(); // Reload original order
  }
};

// Render section
{playlistModules.map((playlistModule) => (
  <div
    key={playlistModule.module_id || playlistModule.sub_playlist_id}
    draggable
    onDragStart={() => handleDragStart(playlistModule)}
    onDragOver={(e) => handleDragOver(e, playlistModule)}
    onDragEnd={handleDragEnd}
    className="group flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg"
  >
    <div 
      className="cursor-move p-1 hover:bg-gray-200 rounded"
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
    </div>
    <div
      onClick={() => {
        if (playlistModule.module_id) {
          navigate(`/studio/content/module?id=${playlistModule.module_id}`);
        } else if (playlistModule.sub_playlist_id) {
          navigate(`/studio/content/playlist?id=${playlistModule.sub_playlist_id}`);
        }
      }}
      className="flex items-center flex-1 ml-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
    >
      <img
        src={
          (playlistModule.module?.thumbnail_url || 
           playlistModule.sub_playlist?.thumbnail_url ||
           'https://images.unsplash.com/photo-1522202176988-66273c2fd55f')
        }
        alt={playlistModule.module?.title || playlistModule.sub_playlist?.title}
        className="w-12 h-8 object-cover rounded"
      />
      <div className="ml-4">
        <h4 className="font-medium text-gray-900 group-hover:text-[#008080] transition-colors">
          {playlistModule.module?.title || playlistModule.sub_playlist?.title}
        </h4>
        <p className="text-sm text-gray-600">
          {playlistModule.module?.description || playlistModule.sub_playlist?.description}
        </p>
      </div>
    </div>
    <button
      onClick={() => {
        if (playlistModule.module_id) {
          handleRemoveModule(playlistModule.module_id);
        } else if (playlistModule.sub_playlist_id) {
          handleRemovePlaylist(playlistModule.sub_playlist_id);
        }
      }}
      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
))}