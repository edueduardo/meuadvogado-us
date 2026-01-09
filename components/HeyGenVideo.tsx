'use client';

import { useEffect, useRef, useState } from 'react';

interface HeyGenVideoProps {
  videoId: string; // HeyGen video ID
  title: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
  fallbackImage?: string;
  onVideoLoad?: () => void;
  onVideoPlay?: () => void;
  abTestVariant?: string; // For A/B testing
}

/**
 * HeyGenVideo Component
 * Embeds HeyGen AI-generated videos with fallback support
 * Tracks engagement via Mixpanel
 */
export default function HeyGenVideo({
  videoId,
  title,
  autoplay = false,
  muted = false,
  loop = false,
  className = '',
  width = '100%',
  height = 'auto',
  fallbackImage,
  onVideoLoad,
  onVideoPlay,
  abTestVariant,
}: HeyGenVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);

  // Track video engagement with Mixpanel
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('video_impression', {
        video_id: videoId,
        video_title: title,
        variant: abTestVariant || 'control',
        timestamp: new Date().toISOString(),
      });
    }
  }, [videoId, title, abTestVariant]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onVideoLoad) {
      onVideoLoad();
    }
  };

  const handlePlay = () => {
    if (onVideoPlay) {
      onVideoPlay();
    }
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('video_play', {
        video_id: videoId,
        video_title: title,
        variant: abTestVariant || 'control',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleError = () => {
    setHasError(true);
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('video_error', {
        video_id: videoId,
        video_title: title,
        variant: abTestVariant || 'control',
        timestamp: new Date().toISOString(),
      });
    }
  };

  // If video fails to load and fallback image exists, show it
  if (hasError && fallbackImage) {
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <img
          src={fallbackImage}
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <p className="text-white text-sm font-medium">Video indisponível</p>
        </div>
      </div>
    );
  }

  // HeyGen video embed URL format
  // Using HeyGen's public embed URL pattern
  const embedUrl = `https://app.heygen.com/embed/${videoId}`;

  return (
    <div className={`relative overflow-hidden rounded-lg bg-black ${className}`} style={{ width, height }}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">Carregando vídeo...</p>
          </div>
        </div>
      )}

      <iframe
        ref={videoRef}
        src={embedUrl}
        title={title}
        allow="microphone; camera"
        allowFullScreen
        className="w-full h-full"
        style={{
          border: 'none',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
        onLoad={handleLoad}
        onError={handleError}
        onPlay={handlePlay}
      />

      {/* Accessibility label */}
      <noscript>
        <p className="text-center text-gray-500 py-8">Este conteúdo requer JavaScript ativado</p>
      </noscript>
    </div>
  );
}
