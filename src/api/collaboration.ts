import api from './axios';
import { unwrapResponse } from '../utils/apiResponse';
import type { Collaborator, InviteLink, Playlist } from '../types';

export const collabAPI = {
  generateInvite: async (playlistId: number): Promise<InviteLink> => {
    const res = await api.post(`/collab/${playlistId}/invite/`);
    return unwrapResponse<InviteLink>(res.data, 'Failed to generate invite link');
  },

  validateToken: async (token: string): Promise<{ playlist_id: number; playlist_name: string }> => {
    const res = await api.get(`/collab/join/${token}/`);
    return unwrapResponse<{ playlist_id: number; playlist_name: string }>(
      res.data,
      'Invalid or expired invite link'
    );
  },

  join: async (token: string): Promise<Collaborator> => {
    const res = await api.post(`/collab/join/${token}/`);
    return unwrapResponse<Collaborator>(res.data, 'Failed to join playlist');
  },

  getMembers: async (playlistId: number): Promise<Collaborator[]> => {
    const res = await api.get(`/collab/${playlistId}/members/`);
    return unwrapResponse<Collaborator[]>(res.data, 'Failed to fetch collaborators');
  },

  removeMember: async (playlistId: number, userId: number): Promise<void> => {
    await api.delete(`/collab/${playlistId}/members/`, { params: { user_id: userId } });
  },

  getMyCollaborations: async (): Promise<Playlist[]> => {
    const res = await api.get('/collab/my-collaborations/');
    return unwrapResponse<Playlist[]>(res.data, 'Failed to fetch collaborations');
  },

  getMyRole: async (playlistId: number): Promise<{ role: 'owner' | 'collaborator' | null }> => {
    const res = await api.get(`/collab/${playlistId}/my-role/`);
    return unwrapResponse<{ role: 'owner' | 'collaborator' | null }>(
      res.data,
      'Failed to fetch role'
    );
  },
};
