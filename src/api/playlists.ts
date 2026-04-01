import api from './axios';
import type { Playlist } from '../types';
import { unwrapResponse } from '../utils/apiResponse';

type PlaylistLinkPayload = {
  link: string;
  expires_at?: string;
};

type TokenPayload = {
  token: string;
  expires_at?: string;
};

const toAbsoluteApiLink = (apiPath: string): string => {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}${apiPath}`;
};

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

  getShareLink: async (id: number): Promise<PlaylistLinkPayload> => {
    try {
      const res = await api.post(`/playlists/${id}/share-link/`);
      return unwrapResponse<PlaylistLinkPayload>(res.data, 'Failed to generate share link');
    } catch {
      const legacyRes = await api.post(`/share/${id}/create/`);
      const payload = unwrapResponse<TokenPayload>(
        legacyRes.data,
        'Failed to generate share link'
      );
      return {
        link: toAbsoluteApiLink(`/api/share/view/${payload.token}/`),
        expires_at: payload.expires_at,
      };
    }
  },

  getCollabInviteLink: async (id: number): Promise<PlaylistLinkPayload> => {
    try {
      const res = await api.post(`/playlists/${id}/collab-link/`);
      return unwrapResponse<PlaylistLinkPayload>(
        res.data,
        'Failed to generate collaboration invite link'
      );
    } catch {
      const legacyRes = await api.post(`/collaboration/${id}/invite/`);
      const payload = unwrapResponse<TokenPayload>(
        legacyRes.data,
        'Failed to generate collaboration invite link'
      );
      return {
        link: toAbsoluteApiLink(`/api/collaboration/join/${payload.token}/`),
        expires_at: payload.expires_at,
      };
    }
  },
};
