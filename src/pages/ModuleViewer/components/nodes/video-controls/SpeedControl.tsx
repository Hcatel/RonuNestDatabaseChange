import React from 'react';
import { FastForward } from 'lucide-react';

interface SpeedControlProps {
  currentSpeed: number;
  isReady: boolean;
  onSpeedChange: (speed: number) => void;
  showMenu: boolean;
  onToggleMenu: () => void;
}

export function SpeedControl({ 
  currentSpeed, 
  isReady, 
  onSpeedChange,
  showMenu,
  onToggleMenu
}: SpeedControlProps) {
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMenu();
        }}
        disabled={!isReady}
        className="flex items-center gap-1 text-white hover:text-[#ff4d00] transition-colors"
      >
        <FastForward className="w-5 h-5" />
        <span className="text-sm">{currentSpeed}x</span>
      </button>

      {showMenu && (
        <div 
          className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {speeds.map((speed) => (
            <button
              key={speed}
              onClick={(e) => {
                e.stopPropagation();
                onSpeedChange(speed);
              }}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                speed === currentSpeed ? 'text-[#ff4d00]' : 'text-white'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      )}
    </div>
  );
}