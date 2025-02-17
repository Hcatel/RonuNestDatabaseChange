import React from 'react';
import { Play, Pause } from 'lucide-react';

interface PlayPauseControlProps {
  isPlaying: boolean;
  isReady: boolean;
  onToggle: () => void;
}

export function PlayPauseControl({ isPlaying, isReady, onToggle }: PlayPauseControlProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={!isReady}
      className="text-white hover:text-[#ff4d00] transition-colors"
    >
      {isPlaying ? (
        <Pause className="w-6 h-6" />
      ) : (
        <Play className="w-6 h-6" />
      )}
    </button>
  );
}