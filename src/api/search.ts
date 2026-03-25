import api from './axios';
import type { Song } from '../types';

export const searchAPI = {
  search: async (query: string): Promise<Song[]> => {
    const res = await api.get(`/search/?q=${encodeURIComponent(query)}`);
    return res.data;
  },

  browse: async (): Promise<string[]> => {
    const res = await api.get('/search/browse/');
    return res.data;
  },
};
