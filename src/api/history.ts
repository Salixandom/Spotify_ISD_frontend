import api from './axios';
import { unwrapResponse } from '../utils/apiResponse';
import type { Song } from '../types';

export const historyAPI = {
  // ─── Play History ───────────────────────────────────

  /**
   * Get recently played songs for the current user
   * Returns unique songs played recently, ordered by play time
   */
  getRecentPlays: async (): Promise<Song[]> => {
    const res = await api.get('/history/recent/');
    return unwrapResponse<Song[]>(res.data, 'Failed to fetch recent plays');
  },

  /**
   * Record a play event for a song
   * Used to track what the user is listening to
   */
  recordPlay: async (songId: number): Promise<{ status: string }> => {
    const res = await api.post('/history/played/', { song_id: songId });
    return unwrapResponse<{ status: string }>(res.data, 'Failed to record play');
  },
};
