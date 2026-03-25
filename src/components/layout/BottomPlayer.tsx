import React, { useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

export const BottomPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    togglePlay,
    setVolume,
    setProgress,
    setDuration,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current && currentTrack?.audio_url) {
      audioRef.current.src = currentTrack.audio_url;
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <footer className="h-20 bg-spotify-dark border-t border-spotify-border
                         flex items-center justify-center">
        <p className="text-spotify-subtext text-sm">No track selected</p>
      </footer>
    );
  }

  return (
    <footer className="h-20 bg-spotify-dark border-t border-spotify-border
                       flex items-center px-6 gap-6">
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => togglePlay()}
      />

      {/* Track info */}
      <div className="flex items-center gap-3 w-60 shrink-0">
        {currentTrack.cover_url ? (
          <img
            src={currentTrack.cover_url}
            alt={currentTrack.title}
            className="w-14 h-14 rounded"
          />
        ) : (
          <div className="w-14 h-14 rounded bg-spotify-elevated" />
        )}
        <div className="overflow-hidden">
          <p className="text-white text-sm font-semibold truncate">
            {currentTrack.title}
          </p>
          <p className="text-spotify-subtext text-xs truncate">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-1">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-white text-black
                     flex items-center justify-center
                     hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-xs text-spotify-subtext w-8 text-right">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            min={0}
            max={usePlayerStore.getState().duration || 100}
            value={progress}
            onChange={(e) => {
              if (audioRef.current) {
                audioRef.current.currentTime = Number(e.target.value);
              }
            }}
            className="flex-1 h-1 accent-spotify-green cursor-pointer"
          />
          <span className="text-xs text-spotify-subtext w-8">
            {formatTime(usePlayerStore.getState().duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-40 shrink-0 justify-end">
        <button
          onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
          className="text-spotify-subtext hover:text-white transition-colors"
        >
          {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 h-1 accent-spotify-green cursor-pointer"
        />
      </div>
    </footer>
  );
};
