import api from './axios';
import { unwrapResponse } from '../utils/apiResponse';
import type { PlaylistTrack, TrackSortField, SortOrder } from '../types';

export const trackAPI = {
  list: async (playlistId: number): Promise<PlaylistTrack[]> => {
    const res = await api.get(`/tracks/${playlistId}/`);
    return unwrapResponse<PlaylistTrack[]>(res.data, 'Failed to fetch tracks');
  },

  add: async (playlistId: number, songId: number): Promise<PlaylistTrack> => {
    const res = await api.post(`/tracks/${playlistId}/`, { song_id: songId });
    return unwrapResponse<PlaylistTrack>(res.data, 'Failed to add track');
  },

  remove: async (playlistId: number, trackId: number): Promise<void> => {
    await api.delete(`/tracks/${playlistId}/${trackId}/`);
  },

  batchRemove: async (playlistId: number, trackIds: number[]): Promise<void> => {
    await api.delete(`/tracks/${playlistId}/remove/`, { data: { track_ids: trackIds } });
  },

  reorder: async (playlistId: number, trackIds: number[]): Promise<void> => {
    await api.put(`/tracks/${playlistId}/reorder/`, { track_ids: trackIds });
  },

  sort: async (
    playlistId: number,
    field: TrackSortField,
    order: SortOrder = 'asc'
  ): Promise<PlaylistTrack[]> => {
    const res = await api.put(`/tracks/${playlistId}/sort/`, { sort_by: field, order });
    return unwrapResponse<PlaylistTrack[]>(res.data, 'Failed to sort tracks');
  },

  hide: async (playlistId: number, trackId: number): Promise<void> => {
    await api.post(`/tracks/${playlistId}/${trackId}/hide/`);
  },

  unhide: async (playlistId: number, trackId: number): Promise<void> => {
    await api.delete(`/tracks/${playlistId}/${trackId}/hide/`);
  },

  archivePlaylist: async (playlistId: number): Promise<void> => {
    await api.post(`/tracks/${playlistId}/archive/`);
  },

  unarchivePlaylist: async (playlistId: number): Promise<void> => {
    await api.delete(`/tracks/${playlistId}/archive/`);
  },
};
