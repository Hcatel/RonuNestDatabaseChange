import { useState, useEffect, useRef } from 'react';

interface VideoMetadata {
  duration: number;
  hasSubtitles: boolean;
  readyState: number;
}

interface VideoState {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  hasSubtitles: boolean;
  isControlsVisible: boolean;
  showSpeedMenu: boolean;
  isMetadataLoaded: boolean;
}

export function useVideoState(video: HTMLVideoElement | null) {
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    playbackSpeed: 1,
    hasSubtitles: false,
    isControlsVisible: true,
    showSpeedMenu: false,
    isMetadataLoaded: false
  });

  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const metadataRef = useRef<VideoMetadata>({
    duration: 0,
    hasSubtitles: false,
    readyState: 0
  });

  const updateState = (updates: Partial<VideoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Handle initial video state
  useEffect(() => {
    if (!video) return;
    
    // If video already has metadata, update state immediately
    if (video.readyState >= 1) {
      metadataRef.current = {
        duration: video.duration,
        hasSubtitles: video.textTracks.length > 0,
        readyState: video.readyState
      };
      
      updateState({
        duration: video.duration,
        hasSubtitles: video.textTracks.length > 0,
        isMetadataLoaded: true
      });
    }
  }, [video]);

  useEffect(() => {
    if (!video) return;

    const handlePlay = () => updateState({ isPlaying: true });
    const handlePause = () => updateState({ isPlaying: false });
    const handleTimeUpdate = () => updateState({ currentTime: video.currentTime });
    const handleLoadedMetadata = () => {
      console.log('🎥 Metadata Loaded:', {
        duration: video.duration,
        readyState: video.readyState,
        tracks: video.textTracks.length
      });
      
      metadataRef.current = {
        duration: video.duration,
        hasSubtitles: video.textTracks.length > 0,
        readyState: video.readyState
      };

      updateState({
        duration: video.duration,
        hasSubtitles: video.textTracks.length > 0,
        isMetadataLoaded: true
      });
    };
    const handleVolumeChange = () => updateState({ isMuted: video.muted });
    const handleDurationChange = () => {
      console.log('🎥 Duration Change:', {
        duration: video.duration,
        readyState: video.readyState
      });
      updateState({ duration: video.duration });
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('durationchange', handleDurationChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('durationchange', handleDurationChange);
    };
  }, [video]);

  // Auto-hide controls
  useEffect(() => {
    if (state.isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        updateState({ isControlsVisible: false });
      }, 2000);
    } else {
      updateState({ isControlsVisible: true });
    }

    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [state.isPlaying]);

  return {
    state,
    updateState,
    hideControlsTimeout
  };
}