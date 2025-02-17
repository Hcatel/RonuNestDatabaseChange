import { useState, useEffect } from 'react';

export function useMediaControls() {
  const [activeVideo, setActiveVideo] = useState<HTMLVideoElement | null>(null);
  
  useEffect(() => {
    // Pause other videos when a new one starts playing
    const handlePlay = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      if (video !== activeVideo) {
        activeVideo?.pause();
        setActiveVideo(video);
      }
    };

    // Add play event listeners to all video elements
    document.querySelectorAll('video').forEach(video => {
      video.addEventListener('play', handlePlay);
    });

    // Cleanup
    return () => {
      document.querySelectorAll('video').forEach(video => {
        video.removeEventListener('play', handlePlay);
      });
    };
  }, [activeVideo]);

  // Pause active video when navigating away
  useEffect(() => {
    return () => {
      activeVideo?.pause();
    };
  }, [activeVideo]);

  return { activeVideo, setActiveVideo };
}