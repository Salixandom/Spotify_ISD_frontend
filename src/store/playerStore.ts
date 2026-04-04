import { create } from 'zustand';
import type { PlaylistTrack, RepeatMode } from '../types';

interface PlayerStore {
  // State
  queue: PlaylistTrack[];
  originalQueue: PlaylistTrack[];
  currentIndex: number;
  currentTrack: PlaylistTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  audioMetrics: {
    amplitude: number;
    bass: number;
    mid: number;
    treble: number;
    spectrum: number[];
  };

  // Queue actions
  setQueue: (tracks: PlaylistTrack[], startIndex?: number) => void;
  playTrack: (track: PlaylistTrack) => void;
  addToQueue: (track: PlaylistTrack) => void;

  // Playback actions
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;

  // Volume
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // Modes
  toggleShuffle: () => void;
  cycleRepeat: () => void;

  // Internal (called by audio element)
  setProgress: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  onTrackEnd: () => void;
  setAudioMetrics: (metrics: {
    amplitude: number;
    bass: number;
    mid: number;
    treble: number;
    spectrum: number[];
  }) => void;
}

// Helper: shuffle array, keeping item at keepIndex first
function shuffleKeepFirst<T>(arr: T[], keepIndex: number): T[] {
  const first = arr[keepIndex];
  const rest = arr.filter((_, i) => i !== keepIndex);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [first, ...rest];
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  queue: [],
  originalQueue: [],
  currentIndex: 0,
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeatMode: 'off',
  audioMetrics: {
    amplitude: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    spectrum: Array.from({ length: 24 }, () => 0),
  },

  setQueue: (tracks, startIndex = 0) => {
    const { shuffle } = get();
    const ordered = shuffle ? shuffleKeepFirst(tracks, startIndex) : tracks;
    const index = shuffle ? 0 : startIndex;
    set({
      queue: ordered,
      originalQueue: tracks,
      currentIndex: index,
      currentTrack: ordered[index] ?? null,
      isPlaying: true,
      progress: 0,
    });
  },

  playTrack: (track) => {
    set({
      queue: [track],
      originalQueue: [track],
      currentIndex: 0,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
    });
  },

  addToQueue: (track) => {
    const { queue, originalQueue } = get();
    set({
      queue: [...queue, track],
      originalQueue: [...originalQueue, track],
    });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  nextTrack: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      // Stay on same track, just reset progress
      set({ progress: 0, isPlaying: true });
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        set({ currentIndex: 0, currentTrack: queue[0], progress: 0, isPlaying: true });
      } else {
        // repeatMode === 'off': stop at end
        set({ isPlaying: false, progress: 0 });
      }
    } else {
      set({
        currentIndex: nextIndex,
        currentTrack: queue[nextIndex],
        progress: 0,
        isPlaying: true,
      });
    }
  },

  prevTrack: () => {
    const { queue, currentIndex, progress } = get();
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (progress > 3) {
      set({ progress: 0 });
      return;
    }

    const prevIndex = Math.max(0, currentIndex - 1);
    set({
      currentIndex: prevIndex,
      currentTrack: queue[prevIndex],
      progress: 0,
      isPlaying: true,
    });
  },

  seekTo: (seconds) => {
    set({ progress: seconds });
  },

  setVolume: (volume) => {
    set({ volume: Math.max(0, Math.min(1, volume)), isMuted: false });
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  toggleShuffle: () => {
    const { shuffle, queue, originalQueue, currentTrack } = get();
    if (!shuffle) {
      // Turning shuffle ON
      const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
      const shuffled = shuffleKeepFirst(queue, currentIndex);
      set({ shuffle: true, queue: shuffled, currentIndex: 0 });
    } else {
      // Turning shuffle OFF — restore original order
      const newIndex = originalQueue.findIndex((t) => t.id === currentTrack?.id);
      set({
        shuffle: false,
        queue: [...originalQueue],
        currentIndex: Math.max(0, newIndex),
      });
    }
  },

  cycleRepeat: () => {
    const { repeatMode } = get();
    const next: RepeatMode =
      repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
    set({ repeatMode: next });
  },

  setProgress: (seconds) => set({ progress: seconds }),
  setDuration: (seconds) => set({ duration: seconds }),
  setAudioMetrics: (metrics) => set({ audioMetrics: metrics }),

  onTrackEnd: () => {
    get().nextTrack();
  },
}));
