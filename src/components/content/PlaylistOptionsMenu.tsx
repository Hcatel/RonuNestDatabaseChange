import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, ListPlus } from 'lucide-react';
import { PlaylistToPlaylistModal } from './PlaylistToPlaylistModal';

interface PlaylistOptionsMenuProps {
  playlistId: string;
}

export function PlaylistOptionsMenu({ playlistId }: PlaylistOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-lg inline-block"
      >
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
          <Link
            to={`/studio/content/playlist?id=${playlistId}`}
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Edit Playlist
          </Link>
          <button
            onClick={() => {
              setShowPlaylistModal(true);
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <ListPlus className="w-4 h-4 mr-2" />
            Add to Playlists
          </button>
        </div>
      )}

      {showPlaylistModal && (
        <PlaylistToPlaylistModal
          playlistId={playlistId}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
}