import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { VideoControls } from './VideoControls';
import type { Node } from '../../../ModuleEditor/types';
import { ContinueButton } from '../ContinueButton';

interface VideoNodeProps {
  node: Node;
  onNext: () => void;
  onFinish: () => void;
  isOverlaid?: boolean;
}

export function VideoNode({ node, onNext, onFinish, isOverlaid }: VideoNodeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasMetadata, setHasMetadata] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const videoUrl = node.config.videoUrl?.startsWith('http') 
    ? node.config.videoUrl 
    : supabase.storage.from('module-thumbnails').getPublicUrl(node.config.videoUrl).data.publicUrl;

  // Capture video frame when overlaid
  useEffect(() => {
    if (isOverlaid && videoRef.current) {
      const video = videoRef.current;
      
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCurrentThumbnail(canvas.toDataURL('image/jpeg'));
      }
      
      // Pause video
      video.pause();
      setIsPaused(true);
    }
  }, [isOverlaid]);

  // Pause video when overlaid
  useEffect(() => {
    if (isOverlaid && videoRef.current) {
      videoRef.current.pause();
      setIsPaused(true);
    }
  }, [isOverlaid]);

  console.log('🎥 VideoNode Render', {
    nodeId: node.id,
    controls: node.config.videoControls,
    isVideoReady,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      console.log('🎥 Video Metadata Loaded', {
        duration: video.duration,
        readyState: video.readyState,
        currentTime: video.currentTime,
        timestamp: new Date().toISOString()
      });
      setHasMetadata(true);
      
      // Ensure duration is available
      if (isNaN(video.duration)) {
        console.warn('Video duration is NaN after metadata load');
        setLoadError('Unable to determine video duration');
      }
    };

    const handleCanPlay = () => {
      console.log('🎥 Video Can Play', {
        duration: video.duration,
        readyState: video.readyState,
        currentTime: video.currentTime,
        timestamp: new Date().toISOString()
      });
      setIsVideoReady(true);
    };

    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      const error = videoElement.error;
      console.error('🎥 Video Error', {
        error,
        code: error?.code,
        message: error?.message,
        timestamp: new Date().toISOString()
      });
      setLoadError(error?.message || 'Error loading video');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    
    // If video is already loaded, set ready state
    if (video.readyState >= 3) {
      setIsVideoReady(true);
      setHasMetadata(true);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  // Handle video load errors
  if (loadError) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {node.config.title}
        </h2>
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center p-4">
            <p className="text-red-400 mb-2">Unable to load video</p>
            <p className="text-sm text-gray-400">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black ${isOverlaid ? 'bg-opacity-80' : ''}`}>
      <h2 className="absolute top-4 left-4 text-2xl font-bold text-white z-10">
        {node.config.title}
      </h2>
      <div 
        className="relative w-full h-full" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Show captured frame when overlaid */}
        {isOverlaid && currentThumbnail && (
          <div 
            className="absolute inset-0 bg-center bg-contain bg-no-repeat opacity-30"
            style={{ backgroundImage: `url(${currentThumbnail})` }}
          />
        )}
        <video
          ref={videoRef}
          src={videoUrl}
          preload="auto"
          controls={false}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
            isOverlaid ? 'opacity-0' : 'opacity-100'
          }`}
          crossOrigin="anonymous"
          playsInline
          muted={false}
          autoPlay={node.config.videoControls?.autoplay}
          onLoadStart={() => console.log('🎥 Video Load Start')}
          onLoadedData={() => console.log('🎥 Video Data Loaded')}
          onDurationChange={(e) => console.log('🎥 Duration Change:', (e.target as HTMLVideoElement).duration)}
          onCanPlay={(e) => {
            const video = e.target as HTMLVideoElement;
            if (node.config.videoControls?.autoplay) {
              video.play().catch(error => {
                console.error('Autoplay failed:', error);
                // If autoplay fails, we can try again with muted autoplay
                video.muted = true;
                video.play().catch(error => {
                  console.error('Muted autoplay failed:', error);
                });
              });
            }
          }}
        >
          {node.config.videoControls?.showSubtitles && (
            <track
              kind="subtitles"
              src={node.config.subtitlesUrl || ''}
              srcLang="en"
              label="English"
            />
          )}
          Your browser does not support the video tag.
        </video>
        {!isOverlaid && (
          <VideoControls
            video={videoRef.current}
            isReady={isVideoReady && hasMetadata}
            showPlayPause={node.config.videoControls?.showPlayPause}
            showVolume={node.config.videoControls?.showVolume}
            showSeeking={node.config.videoControls?.allowSeeking}
            showSubtitles={node.config.videoControls?.showSubtitles}
          />
        )}
      </div>
      {!isOverlaid && (
        <ContinueButton
          onNext={node.connection ? onNext : onFinish}
          isFinish={!node.connection}
        />
      )}
    </div>
  );
}