import api from './axios';
import { unwrapResponse } from '../utils/apiResponse';
import type {
  Playlist,
  PlaylistStats,
  PlaylistComment,
  PlaylistSnapshot,
} from '../types';

export const playlistAPI = {
  // ─── CRUD ─────────────────────────────────────────────
  list: async (params?: {
    visibility?: 'public' | 'private';
    type?: 'solo' | 'collaborative';
    q?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    filter?: 'followed' | 'liked';
    include_archived?: boolean;
    is_system_generated?: 'true' | 'false';
  }): Promise<Playlist[]> => {
    const res = await api.get('/playlists/', { params });
    return unwrapResponse<Playlist[]>(res.data, 'Failed to fetch playlists');
  },

  get: async (id: number, includeArchived?: boolean): Promise<Playlist> => {
    const params = includeArchived ? { include_archived: 'true' } : undefined;
    const res = await api.get(`/playlists/${id}/`, { params });
    return unwrapResponse<Playlist>(res.data, 'Failed to fetch playlist');
  },

  create: async (data: Partial<Playlist>): Promise<Playlist> => {
    const res = await api.post('/playlists/', data);
    return unwrapResponse<Playlist>(res.data, 'Failed to create playlist');
  },

  update: async (id: number, data: Partial<Playlist>): Promise<Playlist> => {
    const res = await api.put(`/playlists/${id}/`, data);
    return unwrapResponse<Playlist>(res.data, 'Failed to update playlist');
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/playlists/${id}/`);
  },

  // ─── Stats & Discovery ────────────────────────────────
  getStats: async (id: number): Promise<PlaylistStats> => {
    const res = await api.get(`/playlists/${id}/stats/`);
    return unwrapResponse<PlaylistStats>(res.data, 'Failed to fetch playlist stats');
  },

  getFeatured: async (): Promise<Playlist[]> => {
    const res = await api.get('/playlists/featured/');
    return unwrapResponse<Playlist[]>(res.data, 'Failed to fetch featured playlists');
  },

  getRecommended: async (): Promise<Playlist[]> => {
    const res = await api.get('/playlists/recommended/');
    return unwrapResponse<Playlist[]>(res.data, 'Failed to fetch recommended playlists');
  },

  getSimilar: async (id: number): Promise<Playlist[]> => {
    const res = await api.get(`/playlists/${id}/similar/`);
    return unwrapResponse<Playlist[]>(res.data, 'Failed to fetch similar playlists');
  },

  getUserPlaylists: async (userId: number, includeArchived?: boolean): Promise<Playlist[]> => {
    const res = await api.get(`/playlists/users/${userId}/playlists/`, {
      params: includeArchived ? { include_archived: 'true' } : undefined
    });
    return unwrapResponse<Playlist[]>(res.data, 'Failed to fetch user playlists');
  },

  // ─── Social ───────────────────────────────────────────
  follow: async (id: number): Promise<void> => {
    await api.post(`/playlists/${id}/follow/`);
  },

  unfollow: async (id: number): Promise<void> => {
    await api.delete(`/playlists/${id}/follow/`);
  },

  like: async (id: number): Promise<void> => {
    await api.post(`/playlists/${id}/like/`);
  },

  unlike: async (id: number): Promise<void> => {
    await api.delete(`/playlists/${id}/like/`);
  },

  // ─── Cover ────────────────────────────────────────────
  updateCover: async (id: number, coverUrl: string): Promise<Playlist> => {
    const res = await api.post(`/playlists/${id}/cover/`, { cover_url: coverUrl });
    return unwrapResponse<Playlist>(res.data, 'Failed to update cover');
  },

  deleteCover: async (id: number): Promise<void> => {
    await api.delete(`/playlists/${id}/cover/`);
  },

  // ─── Duplicate ────────────────────────────────────────
  duplicate: async (id: number, includeTracks = true): Promise<Playlist> => {
    const res = await api.post(`/playlists/${id}/duplicate/`, { include_tracks: includeTracks });
    return unwrapResponse<Playlist>(res.data, 'Failed to duplicate playlist');
  },

  // ─── Generate ──────────────────────────────────────────
  generatePlaylist: async (data: {
    generation_type: 'taste' | 'trending' | 'new_releases' | 'similar_song' | 'genre';
    name?: string;
    track_limit?: number;
    genre?: string;
    mood?: string;
    song_id?: number;
  }): Promise<Playlist> => {
    const res = await api.post('/playlists/auto-generated/', data);
    return unwrapResponse<Playlist>(res.data, 'Failed to generate playlist');
  },

  // ─── Import / Export ──────────────────────────────────
  exportPlaylist: async (id: number): Promise<Record<string, unknown>> => {
    const res = await api.get(`/playlists/${id}/export/`);
    return unwrapResponse<Record<string, unknown>>(res.data, 'Failed to export playlist');
  },

  importPlaylist: async (data: Record<string, unknown>): Promise<Playlist> => {
    const res = await api.post('/playlists/import/', data);
    return unwrapResponse<Playlist>(res.data, 'Failed to import playlist');
  },

  // ─── Snapshots ────────────────────────────────────────
  getSnapshots: async (id: number): Promise<PlaylistSnapshot[]> => {
    const res = await api.get(`/playlists/${id}/snapshots/`);
    return unwrapResponse<PlaylistSnapshot[]>(res.data, 'Failed to fetch snapshots');
  },

  restoreSnapshot: async (playlistId: number, snapshotId: number): Promise<Playlist> => {
    const res = await api.post(`/playlists/${playlistId}/restore/${snapshotId}/`);
    return unwrapResponse<Playlist>(res.data, 'Failed to restore snapshot');
  },

  // ─── Comments ─────────────────────────────────────────
  getComments: async (id: number): Promise<PlaylistComment[]> => {
    const res = await api.get(`/playlists/${id}/comments/`);
    return unwrapResponse<PlaylistComment[]>(res.data, 'Failed to fetch comments');
  },

  addComment: async (
    id: number,
    text: string,
    parentId?: number
  ): Promise<PlaylistComment> => {
    const res = await api.post(`/playlists/${id}/comments/`, {
      text,
      ...(parentId !== undefined && { parent_id: parentId }),
    });
    return unwrapResponse<PlaylistComment>(res.data, 'Failed to add comment');
  },

  updateComment: async (commentId: number, text: string): Promise<PlaylistComment> => {
    const res = await api.patch(`/playlists/comments/${commentId}/`, { text });
    return unwrapResponse<PlaylistComment>(res.data, 'Failed to update comment');
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/playlists/comments/${commentId}/`);
  },

  getCommentReplies: async (commentId: number): Promise<PlaylistComment[]> => {
    const res = await api.get(`/playlists/comments/${commentId}/replies/`);
    return unwrapResponse<PlaylistComment[]>(res.data, 'Failed to fetch replies');
  },

  likeComment: async (commentId: number): Promise<void> => {
    await api.post(`/playlists/comments/${commentId}/like/`);
  },

  unlikeComment: async (commentId: number): Promise<void> => {
    await api.delete(`/playlists/comments/${commentId}/like/`);
  },

  // ─── Batch ────────────────────────────────────────────
  batchDelete: async (ids: number[]): Promise<void> => {
    await api.delete('/playlists/batch-delete/', { data: { playlist_ids: ids } });
  },

  batchUpdate: async (
    updates: Array<{ id: number } & Partial<Playlist>>
  ): Promise<Playlist[]> => {
    const res = await api.patch('/playlists/batch-update/', { updates });
    return unwrapResponse<Playlist[]>(res.data, 'Failed to batch update playlists');
  },
};
