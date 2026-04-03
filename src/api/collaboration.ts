import api from './axios';
import { unwrapResponse } from '../utils/apiResponse';
import type { Collaborator, InviteLink, Playlist } from '../types';

export const collabAPI = {
  createShareLink: async (playlistId: number): Promise<{ token: string; expires_at: string }> => {
    const res = await api.post(`/share/${playlistId}/create/`);
    return unwrapResponse<{ token: string; expires_at: string }>(
      res.data,
      'Failed to create share link'
    );
  },

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

  removeCollaborator: async (playlistId: number, userId: number): Promise<void> => {
    await api.delete(`/collab/${playlistId}/members/`, { data: { user_id: userId } });
  },

  leavePlaylist: async (
    playlistId: number,
    options?: { new_owner_id?: number; stay_as_collaborator?: boolean }
  ): Promise<void> => {
    const res = await api.post(`/collab/${playlistId}/leave/`, options);
    return unwrapResponse<void>(res.data, 'Failed to leave playlist');
  },
};
