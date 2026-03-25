export interface User {
  id: number;
  username: string;
}

export interface Playlist {
  id: number;
  owner_id: number;
  name: string;
  description: string;
  visibility: 'public' | 'private';
  playlist_type: 'solo' | 'collaborative';
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: number;
  playlist_id: number;
  added_by_id: number;
  title: string;
  artist: string;
  album: string;
  duration_seconds: number;
  cover_url: string;
  audio_url: string;
  position: number;
  added_at: string;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration_seconds: number;
  cover_url: string;
  audio_url: string;
}

export interface Collaborator {
  id: number;
  playlist_id: number;
  user_id: number;
  role: 'owner' | 'collaborator';
  joined_at: string;
}

export interface InviteLink {
  id: number;
  playlist_id: number;
  token: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
}
