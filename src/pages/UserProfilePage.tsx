import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Calendar,
  Users,
  Music,
  Edit2,
  Check,
  X,
  Heart,
  Sparkles,
  Globe,
  Mail,
  Settings,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { profileAPI } from "../api/profile";
import { playlistAPI } from "../api/playlists";
import { getLocalDraftPlaylists } from "../utils/localPlaylists";
import type { UserProfile } from "../types";
import { getErrorMessage } from "../utils/apiResponse";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { getInitials } from "../utils/helpers";

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
    show_activity: true,
    allow_messages: true,
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    playlists: 0,
  });
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [localDrafts, setLocalDrafts] = useState<any[]>([]);
  const [showPlaylists, setShowPlaylists] = useState(false);

  useEffect(() => {
    loadProfile();
    loadStats();
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    if (!user?.id) return;

    try {
      const response = await playlistAPI.getUserPlaylists(user.id) as any;
      const playlistData = response?.playlists || [];
      setPlaylists(Array.isArray(playlistData) ? playlistData : []);
      setLocalDrafts(getLocalDraftPlaylists());
    } catch (err) {
      console.error("Failed to load playlists:", err);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await profileAPI.getMyProfile();
      setProfile(data);
      setEditData({
        display_name: data.display_name || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
        show_activity: data.show_activity ?? true,
        allow_messages: data.allow_messages ?? true,
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [followers, following] = await Promise.all([
        profileAPI.getFollowers(),
        profileAPI.getFollowing(),
      ]);
      setStats({
        followers: followers.count,
        following: following.count,
        playlists: 0,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await profileAPI.updateProfile(editData);
      setProfile(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      display_name: profile?.display_name || "",
      bio: profile?.bio || "",
      avatar_url: profile?.avatar_url || "",
      show_activity: profile?.show_activity ?? true,
      allow_messages: profile?.allow_messages ?? true,
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Passwords do not match!");
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }
    if (passwordData.current_password === passwordData.new_password) {
      toast.error("New password must be different from current password!");
      return;
    }

    setIsChangingPassword(true);
    try {
      await profileAPI.changePassword(passwordData);
      toast.success("Password changed successfully!");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error("Failed to change password:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-spotify-green/30 border-t-spotify-green rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = editData.display_name || user?.username || "User";
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header Card */}
        <div className="backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-4">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-spotify-green to-emerald-600 flex items-center justify-center overflow-hidden shadow-2xl">
                  {editData.avatar_url ? (
                    <img
                      src={editData.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-black text-4xl font-bold">{initials}</span>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-white text-3xl font-bold mb-2">
                  {editData.display_name || user?.username}
                </h1>
                <p className="text-gray-400 flex items-center gap-2 mb-4">
                  <User size={16} />
                  @{user?.username}
                </p>

                {/* Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-white text-2xl font-bold">{stats.followers}</div>
                    <div className="text-gray-400 text-sm">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-2xl font-bold">{stats.following}</div>
                    <div className="text-gray-400 text-sm">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-2xl font-bold">{stats.playlists}</div>
                    <div className="text-gray-400 text-sm">Playlists</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-spotify-green hover:bg-emerald-600 rounded-lg text-sm font-medium"
              >
                <Edit2 size={16} className="mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Bio */}
          {editData.bio && !isEditing && (
            <div className="rounded-xl p-5 border border-white/10">
              <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-spotify-green" />
                About
              </h3>
              <p className="text-gray-300 leading-relaxed">{editData.bio}</p>
            </div>
          )}
        </div>

        {/* Edit Mode */}
        {isEditing && (
          <div className="space-y-6">
            {/* Header */}
            <div className="px-6 py-4 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-spotify-green" />
                <h2 className="text-white text-xl font-semibold">Edit Profile</h2>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <User size={18} className="text-spotify-green" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Display Name</label>
                      <Input
                        value={editData.display_name}
                        onChange={(e) =>
                          setEditData({ ...editData, display_name: e.target.value })
                        }
                        placeholder="Your display name"
                        className="bg-white/5 border-white/10 focus:border-spotify-green/50 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Avatar URL</label>
                      <Input
                        value={editData.avatar_url}
                        onChange={(e) =>
                          setEditData({ ...editData, avatar_url: e.target.value })
                        }
                        placeholder="https://example.com/avatar.jpg"
                        className="bg-white/5 border-white/10 focus:border-spotify-green/50 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Bio</label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) =>
                        setEditData({ ...editData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-spotify-green/50 focus:outline-none text-sm resize-none"
                    />
                    <div className="text-gray-500 text-xs mt-1 text-right">
                      {editData.bio.length}/500
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Settings Section */}
              <div className="border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Globe size={18} className="text-spotify-green" />
                  Privacy Settings
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-spotify-green/10 flex items-center justify-center flex-shrink-0">
                        <Users size={18} className="text-spotify-green" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Show Activity</div>
                        <div className="text-gray-400 text-xs">Let others see your activity</div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setEditData({ ...editData, show_activity: !editData.show_activity })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                        editData.show_activity ? "bg-spotify-green" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${
                          editData.show_activity ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Mail size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Allow Messages</div>
                        <div className="text-gray-400 text-xs">Let others send you messages</div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setEditData({ ...editData, allow_messages: !editData.allow_messages })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                        editData.allow_messages ? "bg-purple-500" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full transition-transform shadow-lg ${
                          editData.allow_messages ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Settings size={18} className="text-spotify-green" />
                  Change Password
                </h3>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Current Password</label>
                      <Input
                        type="password"
                        showPasswordToggle={true}
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, current_password: e.target.value })
                        }
                        placeholder="Enter current password"
                        className="bg-white/5 border-white/10 focus:border-spotify-green/50 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">New Password</label>
                      <Input
                        type="password"
                        showPasswordToggle={true}
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, new_password: e.target.value })
                        }
                        placeholder="Enter new password"
                        className="bg-white/5 border-white/10 focus:border-spotify-green/50 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Confirm Password</label>
                      <Input
                        type="password"
                        showPasswordToggle={true}
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirm_password: e.target.value })
                        }
                        placeholder="Confirm new password"
                        className="bg-white/5 border-white/10 focus:border-spotify-green/50 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Settings size={16} />
                        Update Password
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border border-white/10 rounded-2xl bg-white/5 backdrop-blur-xl p-6">
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-spotify-green hover:bg-emerald-600 rounded-xl text-sm font-medium justify-center"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check size={18} />
                        Save Changes
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Info & Quick Actions */}
        {!isEditing && (
          <div className="grid md:grid-cols-3 gap-4">
            {/* Account Info */}
            <div className="md:col-span-2 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-white text-lg font-semibold mb-4">Account Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Calendar size={16} />
                    Joined
                  </div>
                  <div className="text-white font-semibold">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>

                <div className="border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Globe size={16} />
                    Visibility
                  </div>
                  <div className="text-white font-semibold capitalize">
                    {profile?.profile_visibility || "public"}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-white text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button
                  onClick={() => setShowPlaylists(!showPlaylists)}
                  className="w-full px-4 py-3 hover:bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Music size={16} />
                  My Playlists
                </Button>
                <Button
                  onClick={() => navigate("/followers")}
                  className="w-full px-4 py-3 hover:bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Users size={16} />
                  Followers
                </Button>
                <Button
                  onClick={() => navigate("/following")}
                  className="w-full px-4 py-3 hover:bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Heart size={16} />
                  Following
                </Button>
              </div>
            </div>

            {/* User's Playlists - shown when toggled */}
            {showPlaylists && (
              <div className="md:col-span-3 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Music size={18} className="text-[#1DB954]" />
                  My Playlists
                </h2>
                {playlists.length === 0 && localDrafts.length === 0 ? (
                  <div className="text-center py-8">
                    <Music className="mx-auto mb-3 text-white/20" size={32} />
                    <p className="text-white/60 text-sm">No playlists yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex gap-3 w-max">
                      {[...localDrafts, ...playlists].map((playlist: any) => (
                        <div
                          key={playlist.id}
                          onClick={() => navigate(`/playlist/${playlist.id}`)}
                          className="group cursor-pointer"
                        >
                          <div className="w-[220px]">
                            <div className="relative aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-[#1DB954]/50 transition-all mb-2">
                              {playlist.cover_url ? (
                                <img
                                  src={playlist.cover_url}
                                  alt={playlist.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                                  <Music className="text-white/20" size={32} />
                                </div>
                              )}
                            </div>
                            <p className="text-white font-semibold text-sm truncate">
                              {playlist.name}
                            </p>
                            <p className="text-white/60 text-xs truncate">
                              {playlist.description || (playlist.is_system_generated ? 'Auto-generated' : 'Playlist')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <div className="mt-4 text-center">
          <Button
            onClick={logout}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};
