import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  return (
    <div className="w-full mb-2">
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={onSeek}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none 
          [&::-webkit-slider-thumb]:w-3 
          [&::-webkit-slider-thumb]:h-3 
          [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:bg-white 
          hover:[&::-webkit-slider-thumb]:bg-[#ff4d00]"
      />
    </div>
  );
}