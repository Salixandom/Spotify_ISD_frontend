import api from './axios';
import type { Track } from '../types';

export const trackAPI = {
  list: async (playlistId: number): Promise<Track[]> => {
    const res = await api.get(`/tracks/${playlistId}/`);
    return res.data;
  },

  add: async (playlistId: number, data: Partial<Track>): Promise<Track> => {
    const res = await api.post(`/tracks/${playlistId}/`, data);
    return res.data;
  },

  remove: async (playlistId: number, trackId: number): Promise<void> => {
    await api.delete(`/tracks/${playlistId}/${trackId}/`);
  },

  reorder: async (playlistId: number, trackIds: number[]): Promise<void> => {
    await api.put(`/tracks/${playlistId}/reorder/`, { track_ids: trackIds });
  },
};
