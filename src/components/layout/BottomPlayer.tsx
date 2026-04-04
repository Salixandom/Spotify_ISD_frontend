import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
    Minimize2,
    CirclePlus,
} from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import { getArtistName } from "../../utils/trackHelpers";
import { historyAPI } from "../../api/history";

const ANALYZER_HOST_ALLOWLIST = [
    "files.freemusicarchive.org",
];
const LAST_NON_PLAYBACK_ROUTE_KEY = "last_non_playback_route";

const PLACEHOLDER_TRACK = {
    title: "Ural Debo Akashe",
    artist: "Ayub Bachchu",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    duration: 309, // 5:09
};

export const BottomPlayer: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        currentTrack,
        isPlaying,
        volume,
        progress,
        duration,
        shuffle,
        repeatMode,
        setIsPlaying,
        nextTrack,
        prevTrack,
        setVolume,
        setProgress,
        setDuration,
        setAudioMetrics,
        toggleShuffle,
        cycleRepeat,
        onTrackEnd,
    } = usePlayerStore();

    const audioRef = useRef<HTMLAudioElement>(null);
    const lastRecordedTrackIdRef = useRef<number | null>(null);
    const lastNonPlaybackPathRef = useRef<string>("/");
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
    const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
    const rafRef = useRef<number | null>(null);
    const fallbackRafRef = useRef<number | null>(null);

    const trackTitle = currentTrack?.song?.title || PLACEHOLDER_TRACK.title;
    const trackArtist = getArtistName(currentTrack?.song?.artist) || PLACEHOLDER_TRACK.artist;
    const trackCover = currentTrack?.song?.cover_url || PLACEHOLDER_TRACK.cover;
    const trackAudio = currentTrack?.song?.audio_url || "";
    const isTrackPlayable = Boolean(trackAudio);

    const effectiveDuration =
        currentTrack?.song?.duration_seconds ||
        duration ||
        PLACEHOLDER_TRACK.duration;

    useEffect(() => {
        if (!audioRef.current || !trackAudio) {
            if (isPlaying) {
                setIsPlaying(false);
            }
            return;
        }

        if (isPlaying) {
            audioRef.current.play().catch(() => {
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, trackAudio, setIsPlaying]);

    useEffect(() => {
        if (!audioRef.current || !trackAudio) return;

        // Set CORS mode only for analyzer-safe hosts; preserve playback for others.
        let analyzerSafeHost = false;
        if (trackAudio.startsWith("/") || trackAudio.startsWith(window.location.origin)) {
            analyzerSafeHost = true;
        } else {
            try {
                analyzerSafeHost = ANALYZER_HOST_ALLOWLIST.includes(new URL(trackAudio).hostname);
            } catch {
                analyzerSafeHost = false;
            }
        }

        audioRef.current.crossOrigin = analyzerSafeHost ? "anonymous" : null;
        audioRef.current.src = trackAudio;
    }, [trackAudio]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.volume = volume;
    }, [volume]);

    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (fallbackRafRef.current) {
                cancelAnimationFrame(fallbackRafRef.current);
                fallbackRafRef.current = null;
            }
            sourceNodeRef.current?.disconnect();
            analyserRef.current?.disconnect();
            audioContextRef.current?.close().catch(() => {});
        };
    }, []);

    const teardownAnalyzer = React.useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (fallbackRafRef.current) {
            cancelAnimationFrame(fallbackRafRef.current);
            fallbackRafRef.current = null;
        }
        sourceNodeRef.current?.disconnect();
        analyserRef.current?.disconnect();
        audioContextRef.current?.close().catch(() => {});
        sourceNodeRef.current = null;
        analyserRef.current = null;
        audioContextRef.current = null;
        frequencyDataRef.current = null;
    }, []);

    const canAnalyzeTrack = React.useCallback((url: string) => {
        if (!url) return false;
        if (url.startsWith("/") || url.startsWith(window.location.origin)) return true;

        try {
            const parsed = new URL(url);
            return ANALYZER_HOST_ALLOWLIST.includes(parsed.hostname);
        } catch {
            return false;
        }
    }, []);

    const setupAnalyzer = React.useCallback(() => {
        const el = audioRef.current;
        if (!el || analyserRef.current) return false;

        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return false;

            const ctx = new AudioCtx();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.82;

            const src = ctx.createMediaElementSource(el);
            src.connect(analyser);
            analyser.connect(ctx.destination);

            audioContextRef.current = ctx;
            analyserRef.current = analyser;
            sourceNodeRef.current = src;
            frequencyDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
            return true;
        } catch {
            teardownAnalyzer();
            return false;
        }
    }, [teardownAnalyzer]);

    useEffect(() => {
        if (!trackAudio) {
            teardownAnalyzer();
            return;
        }

        const enableAnalyzer = canAnalyzeTrack(trackAudio);
        if (!enableAnalyzer) {
            teardownAnalyzer();
            return;
        }

        setupAnalyzer();
    }, [trackAudio, canAnalyzeTrack, setupAnalyzer, teardownAnalyzer]);

    useEffect(() => {
        if (!isPlaying) {
            setAudioMetrics({
                amplitude: 0,
                bass: 0,
                mid: 0,
                treble: 0,
                spectrum: Array.from({ length: 24 }, () => 0),
            });
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (fallbackRafRef.current) {
                cancelAnimationFrame(fallbackRafRef.current);
                fallbackRafRef.current = null;
            }
            return;
        }

        const analyser = analyserRef.current;
        const buffer = frequencyDataRef.current;
        const ctx = audioContextRef.current;
        if (!analyser || !buffer) {
            const tickFallback = () => {
                const t = performance.now() / 1000;
                const amplitude = 0.16 + 0.08 * (Math.sin(t * 2.2) * 0.5 + 0.5);
                const bass = 0.22 + 0.11 * (Math.sin(t * 1.3 + 0.8) * 0.5 + 0.5);
                const mid = 0.2 + 0.1 * (Math.sin(t * 2.1 + 1.7) * 0.5 + 0.5);
                const treble = 0.18 + 0.09 * (Math.sin(t * 2.9 + 2.4) * 0.5 + 0.5);

                const spectrum = Array.from({ length: 24 }, (_, i) => {
                    const wave = Math.sin(t * (1.4 + (i % 5) * 0.25) + i * 0.55);
                    return 0.16 + ((wave * 0.5 + 0.5) * 0.28);
                });

                setAudioMetrics({ amplitude, bass, mid, treble, spectrum });
                fallbackRafRef.current = requestAnimationFrame(tickFallback);
            };

            fallbackRafRef.current = requestAnimationFrame(tickFallback);
            return () => {
                if (fallbackRafRef.current) {
                    cancelAnimationFrame(fallbackRafRef.current);
                    fallbackRafRef.current = null;
                }
            };
        }

        if (ctx && ctx.state === "suspended") {
            ctx.resume().catch(() => {});
        }

        const sampleBand = (start: number, end: number): number => {
            if (end <= start) return 0;
            let sum = 0;
            for (let i = start; i < end; i += 1) sum += buffer[i];
            return (sum / (end - start)) / 255;
        };

        const tick = () => {
            analyser.getByteFrequencyData(buffer);

            let total = 0;
            for (let i = 0; i < buffer.length; i += 1) total += buffer[i];
            const amplitude = (total / buffer.length) / 255;

            const bassEnd = Math.floor(buffer.length * 0.14);
            const midEnd = Math.floor(buffer.length * 0.48);

            const bass = sampleBand(0, bassEnd);
            const mid = sampleBand(bassEnd, midEnd);
            const treble = sampleBand(midEnd, buffer.length);

            const bars = 24;
            const chunk = Math.max(1, Math.floor(buffer.length / bars));
            const spectrum = Array.from({ length: bars }, (_, idx) => {
                const start = idx * chunk;
                const end = Math.min(buffer.length, start + chunk);
                let localMax = 0;
                for (let i = start; i < end; i += 1) {
                    if (buffer[i] > localMax) localMax = buffer[i];
                }
                return localMax / 255;
            });

            setAudioMetrics({ amplitude, bass, mid, treble, spectrum });
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [isPlaying, trackAudio, setAudioMetrics]);

    useEffect(() => {
        if (!audioRef.current || !trackAudio) return;
        const liveTime = audioRef.current.currentTime;
        if (!Number.isFinite(liveTime)) return;

        if (Math.abs(liveTime - progress) > 0.8) {
            audioRef.current.currentTime = progress;
        }
    }, [progress, trackAudio]);

    useEffect(() => {
        if (location.pathname !== "/playback") {
            const route = `${location.pathname}${location.search}`;
            lastNonPlaybackPathRef.current = route;
            try {
                sessionStorage.setItem(LAST_NON_PLAYBACK_ROUTE_KEY, route);
            } catch {
                // ignore storage failures
            }
        }
    }, [location.pathname, location.search]);

    useEffect(() => {
        const songId = currentTrack?.song?.id;
        if (!songId || !isPlaying) return;
        if (lastRecordedTrackIdRef.current === songId) return;

        lastRecordedTrackIdRef.current = songId;
        historyAPI.recordPlay(songId).catch(() => {
            // Ignore tracking failures to avoid interrupting playback.
        });
    }, [currentTrack?.song?.id, isPlaying]);

    const formatTime = (seconds: number) => {
        if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const isRepeatOff = repeatMode === "off";
    const isRepeatOne = repeatMode === "one";
    const handleTogglePlay = () => {
        if (!audioRef.current || !trackAudio) {
            setIsPlaying(false);
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
    };

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
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
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
                            onClick={handleTogglePlay}
                            className="w-8 h-8 rounded-full bg-white text-black
              flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={!isTrackPlayable}
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
                        onClick={() => {
                            if (location.pathname === "/playback") {
                                let target = lastNonPlaybackPathRef.current || "/";
                                try {
                                    target = sessionStorage.getItem(LAST_NON_PLAYBACK_ROUTE_KEY) || target;
                                } catch {
                                    // ignore storage failures
                                }
                                navigate(target || "/");
                            } else {
                                navigate("/playback");
                            }
                        }}
                        className="text-white/60 hover:text-white transition-colors inline-flex"
                        aria-label="Open full screen player"
                        title={location.pathname === "/playback" ? "Exit full screen" : "Full screen"}
                    >
                        {location.pathname === "/playback" ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
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
