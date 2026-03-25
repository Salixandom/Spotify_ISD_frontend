import api from './axios';
import type { Playlist } from '../types';

export const playlistAPI = {
  list: async (): Promise<Playlist[]> => {
    const res = await api.get('/playlists/');
    return res.data;
  },

  get: async (id: number): Promise<Playlist> => {
    const res = await api.get(`/playlists/${id}/`);
    return res.data;
  },

  create: async (data: Partial<Playlist>): Promise<Playlist> => {
    const res = await api.post('/playlists/', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Playlist>): Promise<Playlist> => {
    const res = await api.put(`/playlists/${id}/`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/playlists/${id}/`);
  },
};
