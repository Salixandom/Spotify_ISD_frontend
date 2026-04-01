import api from './axios';
import { unwrapResponse } from '../utils/apiResponse';
import type { SearchResults, Song, Artist, Album, Playlist, GenreData } from '../types';

export const searchAPI = {
  // ─── Unified Search ───────────────────────────────────
  search: async (query: string): Promise<SearchResults> => {
    const res = await api.get('/search/', { params: { q: query } });
    return unwrapResponse<SearchResults>(res.data, 'Search failed');
  },

  // ─── Songs ────────────────────────────────────────────
  searchSongs: async (params: {
    q?: string;
    genre?: string;
    sort?: 'title' | 'artist' | 'album' | 'genre' | 'duration' | 'year';
    order?: 'asc' | 'desc';
  }): Promise<Song[]> => {
    const res = await api.get('/search/songs/', { params });
    return unwrapResponse<Song[]>(res.data, 'Failed to search songs');
  },

  // ─── Artists ──────────────────────────────────────────
  searchArtists: async (query?: string): Promise<Artist[]> => {
    const res = await api.get('/search/artists/', { params: { q: query } });
    return unwrapResponse<Artist[]>(res.data, 'Failed to search artists');
  },

  getArtist: async (artistId: number): Promise<Artist> => {
    const res = await api.get(`/search/artists/${artistId}/`);
    return unwrapResponse<Artist>(res.data, 'Failed to fetch artist');
  },

  // ─── Albums ───────────────────────────────────────────
  searchAlbums: async (query?: string): Promise<Album[]> => {
    const res = await api.get('/search/albums/', { params: { q: query } });
    return unwrapResponse<Album[]>(res.data, 'Failed to search albums');
  },

  getAlbum: async (albumId: number): Promise<Album> => {
    const res = await api.get(`/search/albums/${albumId}/`);
    return unwrapResponse<Album>(res.data, 'Failed to fetch album');
  },

  // ─── Playlists ────────────────────────────────────────
  searchPlaylists: async (params: {
    q?: string;
    type?: 'solo' | 'collaborative';
  }): Promise<Playlist[]> => {
    const res = await api.get('/search/playlists/', { params });
    return unwrapResponse<Playlist[]>(res.data, 'Failed to search playlists');
  },

  // ─── Browse / Genres ──────────────────────────────────
  /** Returns a flat list of genre name strings from songs in the catalog */
  browse: async (): Promise<string[]> => {
    const res = await api.get('/search/browse/');
    return unwrapResponse<string[]>(res.data, 'Failed to browse genres');
  },

  /** Returns genres with stats (song_count, description, etc.) */
  getGenres: async (): Promise<{ genres: GenreData[] }> => {
    const res = await api.get('/search/discover/genres/');
    return unwrapResponse<{ genres: GenreData[] }>(res.data, 'Failed to fetch genres');
  },

  getGenreDetail: async (
    genreName: string,
    params?: { sort?: 'popularity' | 'recent' | 'title'; limit?: number }
  ): Promise<{ genre: GenreData; songs: Song[]; total: number }> => {
    const res = await api.get(`/search/discover/genres/${encodeURIComponent(genreName)}/`, { params });
    return unwrapResponse<{ genre: GenreData; songs: Song[]; total: number }>(
      res.data,
      'Failed to fetch genre detail'
    );
  },

  // ─── Discovery ────────────────────────────────────────
  getNewReleases: async (params?: {
    days?: number;
    genre?: string;
    limit?: number;
  }): Promise<{ since_date: string; days: number; songs: Song[]; total: number }> => {
    const res = await api.get('/search/discover/new-releases/', { params });
    return unwrapResponse<{ since_date: string; days: number; songs: Song[]; total: number }>(
      res.data,
      'Failed to fetch new releases'
    );
  },

  getTrending: async (params?: {
    genre?: string;
    period?: 'all' | 'week' | 'month';
    limit?: number;
  }): Promise<{ period: string; songs: Song[]; total: number }> => {
    const res = await api.get('/search/discover/trending/', { params });
    return unwrapResponse<{ period: string; songs: Song[]; total: number }>(
      res.data,
      'Failed to fetch trending songs'
    );
  },

  getSimilarSongs: async (
    songId: number,
    limit?: number
  ): Promise<{ song_id: number; song_title: string; similar_songs: Song[]; total: number }> => {
    const res = await api.get(`/search/discover/similar/${songId}/`, { params: { limit } });
    return unwrapResponse<{
      song_id: number;
      song_title: string;
      similar_songs: Song[];
      total: number;
    }>(res.data, 'Failed to fetch similar songs');
  },

  getRecommendations: async (limit?: number): Promise<{
    recommendation_type: 'personalized' | 'trending';
    preferred_genres?: string[];
    songs: Song[];
    total: number;
  }> => {
    const res = await api.get('/search/discover/recommendations/', { params: { limit } });
    return unwrapResponse<{
      recommendation_type: 'personalized' | 'trending';
      preferred_genres?: string[];
      songs: Song[];
      total: number;
    }>(res.data, 'Failed to fetch recommendations');
  },
};
