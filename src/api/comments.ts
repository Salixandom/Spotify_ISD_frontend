import api from './axios';
import { unwrapResponse } from '../utils/apiResponse';

export interface PlaylistComment {
  id: number;
  playlist_id: number;
  user_id: number;
  username: string;
  content: string;
  parent_id: number | null;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentsResponse {
  comments: PlaylistComment[];
  total: number;
}

export interface RepliesResponse {
  replies: PlaylistComment[];
  total: number;
}

export const commentsAPI = {
  getComments: async (playlistId: string | number): Promise<PlaylistComment[]> => {
    const res = await api.get(`/playlists/${playlistId}/comments/`);
    const data = unwrapResponse<PlaylistComment[] | CommentsResponse>(res.data, 'Failed to fetch comments');
    // Handle both array and wrapped response formats
    return Array.isArray(data) ? data : (data as CommentsResponse).comments;
  },

  getReplies: async (commentId: number): Promise<RepliesResponse> => {
    const res = await api.get(`/playlists/comments/${commentId}/replies/`);
    return unwrapResponse<RepliesResponse>(res.data, 'Failed to fetch replies');
  },

  createComment: async (
    playlistId: string | number,
    content: string,
    parentId?: number
  ): Promise<PlaylistComment> => {
    const res = await api.post(`/playlists/${playlistId}/comments/`, {
      content,
      ...(parentId !== undefined && { parent_id: parentId }),
    });
    return unwrapResponse<PlaylistComment>(res.data, 'Failed to create comment');
  },

  updateComment: async (commentId: number, content: string): Promise<PlaylistComment> => {
    const res = await api.patch(`/playlists/comments/${commentId}/`, { content });
    return unwrapResponse<PlaylistComment>(res.data, 'Failed to update comment');
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/playlists/comments/${commentId}/`);
  },

  likeComment: async (commentId: number): Promise<void> => {
    await api.post(`/playlists/comments/${commentId}/like/`);
  },

  unlikeComment: async (commentId: number): Promise<void> => {
    await api.delete(`/playlists/comments/${commentId}/like/`);
  },
};
