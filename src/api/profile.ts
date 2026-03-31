import api from './axios';
import { unwrapResponse } from '../utils/apiResponse';

export interface UserProfileData {
  user_id: number;
  display_name: string;
  bio: string;
  avatar_url: string;
  profile_visibility: 'public' | 'followers' | 'private';
  show_activity: boolean;
  allow_messages: boolean;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserFollowData {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
}

export interface FollowersResponse {
  user_id: number;
  followers: Array<{
    id: number;
    follower_id: number;
    following_id: number;
    created_at: string;
  }>;
  count: number;
}

export interface FollowingResponse {
  user_id: number;
  following: Array<{
    id: number;
    follower_id: number;
    following_id: number;
    created_at: string;
  }>;
  count: number;
}

export const profileAPI = {
  getMyProfile: async (): Promise<UserProfileData> => {
    const res = await api.get('/auth/profile/me/');
    return unwrapResponse<UserProfileData>(res.data, 'Failed to fetch profile');
  },

  updateProfile: async (data: Partial<UserProfileData>): Promise<UserProfileData> => {
    const res = await api.put('/auth/profile/me/', data);
    return unwrapResponse<UserProfileData>(res.data, 'Failed to update profile');
  },

  updateAvatar: async (avatarUrl: string): Promise<UserProfileData> => {
    const res = await api.post('/auth/profile/me/avatar/', { avatar_url: avatarUrl });
    return unwrapResponse<UserProfileData>(res.data, 'Failed to update avatar');
  },

  getFollowers: async (userId?: number): Promise<FollowersResponse> => {
    const url = userId ? `/auth/social/followers/${userId}/` : '/auth/social/followers/';
    const res = await api.get(url);
    return unwrapResponse<FollowersResponse>(res.data, 'Failed to fetch followers');
  },

  getFollowing: async (userId?: number): Promise<FollowingResponse> => {
    const url = userId ? `/auth/social/following/${userId}/` : '/auth/social/following/';
    const res = await api.get(url);
    return unwrapResponse<FollowingResponse>(res.data, 'Failed to fetch following');
  },

  followUser: async (userId: number): Promise<UserFollowData> => {
    const res = await api.post(`/auth/social/follow/${userId}/`);
    return unwrapResponse<UserFollowData>(res.data, 'Failed to follow user');
  },

  unfollowUser: async (userId: number): Promise<{ unfollowed: boolean }> => {
    const res = await api.delete(`/auth/social/follow/${userId}/`);
    return unwrapResponse<{ unfollowed: boolean }>(res.data, 'Failed to unfollow user');
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ success: boolean }> => {
    const res = await api.post('/auth/change-password/', data);
    return unwrapResponse<{ success: boolean }>(res.data, 'Failed to change password');
  },
};
