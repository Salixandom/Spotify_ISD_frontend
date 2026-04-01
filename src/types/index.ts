// ─── Auth ────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// ─── User Profile ─────────────────────────────────────────
export interface UserProfile {
  user_id: number;
  display_name: string;
  bio: string;
  avatar_url: string;
  profile_visibility: 'public' | 'followers' | 'private';
  show_activity: boolean;
  allow_messages: boolean;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  followers_count?: number;
  following_count?: number;
}

export interface UserStats {
  total_playlists: number;
  total_songs: number;
  total_followers: number;
  total_following: number;
  joined_date: string;
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
  is_liked_songs?: boolean;
  is_system_generated?: boolean;
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

// ─── Artist & Album (catalog) ────────────────────────────
export interface Artist {
  id: number;
  name: string;
  bio: string;
  image_url: string;
  monthly_listeners: number;
}

export interface Album {
  id: number;
  name: string;
  artist: Artist;
  release_year: number | null;
  cover_url: string;
}

// ─── Genre (for browse page) ─────────────────────────────
export interface Genre {
  name: string;
  color: string;
}

export interface GenreData {
  name: string;
  description: string;
  song_count: number;
  image_url: string;
  follower_count: number;
}

// ─── Search ──────────────────────────────────────────────
export interface SearchResults {
  songs: Song[];
  playlists: Playlist[];
  artists: Artist[];
  albums: Album[];
}

// ─── Playlist extras ─────────────────────────────────────
export interface PlaylistStats {
  total_tracks: number;
  total_duration_seconds: number;
  genres: string[];
  artists: string[];
  albums: string[];
  collaborators_count: number;
  followers_count: number;
  likes_count: number;
}

export interface PlaylistComment {
  id: number;
  playlist_id: number;
  user_id: number;
  username: string;
  text: string;
  parent_id: number | null;
  likes_count: number;
  replies_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSnapshot {
  id: number;
  playlist_id: number;
  snapshot_data: Record<string, unknown>;
  change_reason: string;
  track_count: number;
  created_at: string;
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
