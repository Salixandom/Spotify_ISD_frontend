import React, { useEffect, useRef } from "react";
import {
    Shuffle,
    SkipBack,
    Play,
    Pause,
    SkipForward,
    Repeat,
    Repeat1,
    Volume2,
    VolumeX,
    ListMusic,
    Laptop2,
    Maximize2,
    CirclePlus,
} from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";

const PLACEHOLDER_TRACK = {
    title: "Ural Debo Akashe",
    artist: "Ayub Bachchu",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    duration: 309, // 5:09
};

export const BottomPlayer: React.FC = () => {
    const {
        currentTrack,
        isPlaying,
        volume,
        progress,
        duration,
        shuffle,
        repeatMode,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        setProgress,
        setDuration,
        toggleShuffle,
        cycleRepeat,
        onTrackEnd,
    } = usePlayerStore();

    const audioRef = useRef<HTMLAudioElement>(null);

    const trackTitle = currentTrack?.song?.title || PLACEHOLDER_TRACK.title;
    const trackArtist = currentTrack?.song?.artist || PLACEHOLDER_TRACK.artist;
    const trackCover = currentTrack?.song?.cover_url || PLACEHOLDER_TRACK.cover;
    const trackAudio = currentTrack?.song?.audio_url || "";

    const effectiveDuration =
        currentTrack?.song?.duration_seconds ||
        duration ||
        PLACEHOLDER_TRACK.duration;

    useEffect(() => {
        if (!audioRef.current || !trackAudio) return;

        if (isPlaying) {
            audioRef.current.play().catch(() => {});
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, trackAudio]);

    useEffect(() => {
        if (!audioRef.current || !trackAudio) return;

        audioRef.current.src = trackAudio;
        if (isPlaying) {
            audioRef.current.play().catch(() => {});
        }
    }, [trackAudio, isPlaying]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.volume = volume;
    }, [volume]);

    const formatTime = (seconds: number) => {
        if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const isRepeatOff = repeatMode === "off";
    const isRepeatOne = repeatMode === "one";

    return (
        <footer
            className="h-[88px] px-4 md:px-5
      bg-gradient-to-r from-black/35 via-white/[0.05] to-black/35
      backdrop-blur-2xl border border-white/12
      shadow-[0_8px_30px_rgba(0,0,0,0.35)]
      flex items-center"
            aria-label="Playback controls"
        >
            <audio
                ref={audioRef}
                onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={onTrackEnd}
            />

            <div className="w-full grid grid-cols-[minmax(240px,1fr)_minmax(440px,1.6fr)_minmax(240px,1fr)] items-center gap-4">
                {/* LEFT: Track info */}
                <section className="min-w-0 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/25 border border-white/12 shrink-0">
                        <img
                            src={trackCover}
                            alt={trackTitle}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                            {trackTitle}
                        </p>
                        <p className="text-white/65 text-xs truncate">
                            {String(trackArtist)}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="text-white/60 hover:text-white transition-colors shrink-0 inline-flex"
                        aria-label="Add current song to playlist"
                        title="Add to playlist"
                    >
                        <CirclePlus size={17} />
                    </button>
                </section>

                {/* CENTER: Transport + timeline */}
                <section className="min-w-0 flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleShuffle}
                            className={`transition-colors ${
                                shuffle
                                    ? "text-spotify-green"
                                    : "text-white/65 hover:text-white"
                            }`}
                            aria-label="Toggle shuffle"
                            title="Shuffle"
                        >
                            <Shuffle size={17} />
                        </button>

                        <button
                            type="button"
                            onClick={prevTrack}
                            className="text-white/65 hover:text-white transition-colors"
                            aria-label="Previous track"
                            title="Previous"
                        >
                            <SkipBack size={18} fill="currentColor" />
                        </button>

                        <button
                            type="button"
                            onClick={togglePlay}
                            className="w-8 h-8 rounded-full bg-white text-black
              flex items-center justify-center hover:scale-105 transition-transform"
                            aria-label={isPlaying ? "Pause" : "Play"}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <Pause size={16} fill="currentColor" />
                            ) : (
                                <Play size={16} fill="currentColor" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={nextTrack}
                            className="text-white/65 hover:text-white transition-colors"
                            aria-label="Next track"
                            title="Next"
                        >
                            <SkipForward size={18} fill="currentColor" />
                        </button>

                        <button
                            type="button"
                            onClick={cycleRepeat}
                            className={`transition-colors ${
                                isRepeatOff
                                    ? "text-white/65 hover:text-white"
                                    : "text-spotify-green"
                            }`}
                            aria-label="Cycle repeat mode"
                            title={`Repeat: ${repeatMode}`}
                        >
                            {isRepeatOne ? (
                                <Repeat1 size={17} />
                            ) : (
                                <Repeat size={17} />
                            )}
                        </button>
                    </div>

                    <div className="w-full max-w-[700px] flex items-center gap-2">
                        <span className="w-10 text-right text-[11px] text-white/60 tabular-nums">
                            {formatTime(progress)}
                        </span>

                        <input
                            type="range"
                            min={0}
                            max={effectiveDuration || 1}
                            value={Math.min(progress, effectiveDuration || 1)}
                            onChange={(e) => {
                                const next = Number(e.target.value);
                                setProgress(next);
                                if (audioRef.current && trackAudio) {
                                    audioRef.current.currentTime = next;
                                }
                            }}
                            className="flex-1 h-1 rounded-full accent-white cursor-pointer"
                            aria-label="Seek playback position"
                        />

                        <span className="w-10 text-[11px] text-white/60 tabular-nums">
                            {formatTime(effectiveDuration)}
                        </span>
                    </div>
                </section>

                {/* RIGHT: Utilities + volume */}
                <section className="min-w-0 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        className="text-white/60 hover:text-white transition-colors hidden md:inline-flex"
                        aria-label="Now playing queue"
                        title="Queue"
                    >
                        <ListMusic size={16} />
                    </button>

                    <button
                        type="button"
                        className="text-white/60 hover:text-white transition-colors hidden md:inline-flex"
                        aria-label="Connect to a device"
                        title="Connect to device"
                    >
                        <Laptop2 size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                        className="text-white/60 hover:text-white transition-colors"
                        aria-label={volume === 0 ? "Unmute" : "Mute"}
                        title={volume === 0 ? "Unmute" : "Mute"}
                    >
                        {volume === 0 ? (
                            <VolumeX size={17} />
                        ) : (
                            <Volume2 size={17} />
                        )}
                    </button>

                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-24 h-1 rounded-full accent-white cursor-pointer"
                        aria-label="Set volume"
                    />

                    <button
                        type="button"
                        className="text-white/60 hover:text-white transition-colors hidden lg:inline-flex"
                        aria-label="Open full screen player"
                        title="Full screen"
                    >
                        <Maximize2 size={15} />
                    </button>
                </section>
            </div>

            <span className="sr-only">
                {repeatMode === "all" && "Repeat all enabled"}
                {repeatMode === "one" && "Repeat one enabled"}
            </span>
        </footer>
    );
};

export default BottomPlayer;
