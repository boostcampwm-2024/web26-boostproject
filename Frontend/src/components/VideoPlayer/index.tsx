import { useState, useRef, useEffect } from 'react';
import useLayoutStore from '@store/useLayoutStore';
import useHls from '@hooks/useHls';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Badge from '@components/common/Badges/Badge';
import OfflinePlayer from '@components/VideoPlayer/OfflinePlayer';
import Controls from './Control/index';

interface VideoPlayerProps {
  streamUrl: string;
  onAir: boolean;
}

export default function VideoPlayer({ streamUrl, onAir }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const { videoPlayerState, toggleVideoPlayer } = useLayoutStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const { isBuffering, error, setQuality, qualities } = useHls(streamUrl, videoRef);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
    setVolume(newVolume || 1);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const hideAllControls = () => {
    setShowControls(false);
    setShowCursor(false);
  };

  const startControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideAllControls, 3000);
  };

  const handleShowControls = () => {
    setShowControls(true);
    setShowCursor(true);
    startControlsTimer();
  };

  const handleMouseMove = () => {
    handleShowControls();
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    hideAllControls();
    setShowCursor(true);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${!showCursor ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {onAir ? (
        <video
          ref={videoRef}
          className="h-full w-full bg-black"
          onPlay={handlePlay}
          onPause={handlePause}
          muted
          autoPlay
          playsInline
        >
          <track kind="captions" src="" />
        </video>
      ) : (
        <OfflinePlayer />
      )}

      {isBuffering && isPlaying && <LoadingSpinner />}

      {onAir && (
        <Badge
          text="LIVE"
          className={`absolute right-2 top-2 bg-red-600 text-lico-gray-1 transition-opacity duration-300 ${showControls ? 'opacity-90' : 'pointer-events-none opacity-0'}`}
        />
      )}

      <Controls
        isPlaying={isPlaying}
        isFullScreen={isFullScreen}
        videoPlayerState={videoPlayerState}
        showControls={showControls}
        volume={volume}
        isMuted={isMuted}
        onPlayToggle={togglePlay}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={toggleMute}
        onFullScreenToggle={toggleFullScreen}
        onVideoPlayerToggle={toggleVideoPlayer}
        onShowControls={handleShowControls}
        qualities={qualities}
        setQuality={setQuality}
      />
    </div>
  );
}
