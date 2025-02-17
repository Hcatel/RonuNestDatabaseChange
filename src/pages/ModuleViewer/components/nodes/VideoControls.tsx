import React from 'react';
import { Maximize2 } from 'lucide-react';
import { PlayPauseControl } from './video-controls/PlayPauseControl';
import { VolumeControl } from './video-controls/VolumeControl';
import { ProgressBar } from './video-controls/ProgressBar';
import { SpeedControl } from './video-controls/SpeedControl';
import { TimeDisplay } from './video-controls/TimeDisplay';
import { useVideoState } from './video-controls/useVideoState';

interface VideoControlsProps {
  video: HTMLVideoElement | null;
  isReady: boolean;
  showPlayPause?: boolean;
  showVolume?: boolean;
  showSeeking?: boolean;
  showSubtitles?: boolean;
}

export function VideoControls({ 
  video,
  isReady,
  showPlayPause = true,
  showVolume = true,
  showSeeking = true,
  showSubtitles = true
}: VideoControlsProps) {
  const { state, updateState } = useVideoState(video);

  const handleMouseMove = () => {
    updateState({ isControlsVisible: true });
    if (state.isPlaying) {
      setTimeout(() => {
        updateState({ isControlsVisible: false });
      }, 2000);
    }
  };

  const togglePlay = () => {
    if (!video) return;
    if (state.isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error('Play error:', error);
      });
    }
  };

  const handleToggleMute = () => {
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleSpeedChange = (newSpeed: number) => {
    if (!video) return;
    video.playbackRate = newSpeed;
    updateState({ playbackSpeed: newSpeed });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!video || !showSeeking) return;
    const time = Number(e.target.value);
    if (isNaN(time)) return;
    video.currentTime = time;
  };

  const toggleSubtitles = () => {
    if (!video || !state.hasSubtitles) return;
    const track = video.textTracks[0];
    if (track) {
      track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
    }
  };

  const toggleFullscreen = () => {
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  return (
    <div 
      className="absolute inset-0 flex items-end"
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
    >
      {/* Controls bar */}
      <div 
        className={`w-full bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
          state.isControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        {showSeeking && (
          <ProgressBar
            currentTime={state.currentTime}
            duration={state.duration}
            onSeek={handleSeek}
          />
        )}

        {/* Controls row */}
        <div className="flex items-center gap-4">
          {showPlayPause && (
            <PlayPauseControl
              isPlaying={state.isPlaying}
              isReady={isReady}
              onToggle={togglePlay}
            />
          )}

          {showVolume && (
            <VolumeControl
              isMuted={state.isMuted}
              isReady={isReady}
              onToggle={handleToggleMute}
            />
          )}

          {showSeeking && (
            <TimeDisplay
              currentTime={state.currentTime}
              duration={state.duration}
            />
          )}

          <div className="flex-1" />

          {/* Playback Speed */}
          <SpeedControl
            currentSpeed={state.playbackSpeed}
            isReady={isReady}
            onSpeedChange={handleSpeedChange}
            showMenu={state.showSpeedMenu}
            onToggleMenu={() => updateState({ showSpeedMenu: !state.showSpeedMenu })}
          />

          {showSubtitles && state.hasSubtitles && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSubtitles();
              }}
              disabled={!isReady}
              className="text-white hover:text-[#ff4d00] transition-colors"
            >
              CC
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            disabled={!isReady}
            className="text-white hover:text-[#ff4d00] transition-colors"
          >
            <Maximize2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}