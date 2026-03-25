import api from './axios';
import type { Collaborator, InviteLink } from '../types';

export const collabAPI = {
  generateInvite: async (playlistId: number): Promise<InviteLink> => {
    const res = await api.post(`/collab/${playlistId}/invite/`);
    return res.data;
  },

  validateToken: async (token: string) => {
    const res = await api.get(`/collab/join/${token}/`);
    return res.data;
  },

  join: async (token: string): Promise<Collaborator> => {
    const res = await api.post(`/collab/join/${token}/`);
    return res.data;
  },

  getMembers: async (playlistId: number): Promise<Collaborator[]> => {
    const res = await api.get(`/collab/${playlistId}/members/`);
    return res.data;
  },

  removeMember: async (playlistId: number, userId: number): Promise<void> => {
    await api.delete(`/collab/${playlistId}/members/?user_id=${userId}`);
  },
};
