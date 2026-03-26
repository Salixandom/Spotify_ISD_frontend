// ─── Auth ────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// ─── Song (master catalog) ───────────────────────────────
export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  release_year: number | null;
  duration_seconds: number;
  cover_url: string;
  audio_url: string; // Supabase public URL
  storage_path: string; // Supabase bucket path (internal use)
}

// ─── Playlist ────────────────────────────────────────────
export interface Playlist {
  id: number;
  owner_id: number;
  name: string;
  description: string;
  visibility: 'public' | 'private';
  playlist_type: 'solo' | 'collaborative';
  cover_url: string;
  snapshot_id: string;
  created_at: string;
  updated_at: string;
}

// ─── PlaylistTrack (junction: playlist + song) ───────────
export interface PlaylistTrack {
  id: number;
  playlist_id: number;
  song: Song; // always nested, never flat
  added_by_id: number;
  position: number;
  added_at: string;
}

// ─── Collaboration ───────────────────────────────────────
export interface Collaborator {
  id: number;
  playlist_id: number;
  user_id: number;
  role: 'collaborator'; // owner is never stored here
  joined_at: string;
}

export interface InviteLink {
  id: number;
  playlist_id: number;
  token: string;
  created_by_id: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

// ─── Genre (for browse page) ─────────────────────────────
export interface Genre {
  name: string;
  color: string;
}

// ─── Player ──────────────────────────────────────────────
export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
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
}

// ─── Sort ────────────────────────────────────────────────
export type TrackSortField =
  | 'custom'
  | 'title'
  | 'artist'
  | 'album'
  | 'genre'
  | 'duration'
  | 'year'
  | 'added_at';

export type SortOrder = 'asc' | 'desc';
