import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  isMuted: boolean;
  isReady: boolean;
  onToggle: () => void;
}

export function VolumeControl({ isMuted, isReady, onToggle }: VolumeControlProps) {
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
      {isMuted ? (
        <VolumeX className="w-6 h-6" />
      ) : (
        <Volume2 className="w-6 h-6" />
      )}
    </button>
  );
}