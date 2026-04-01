import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Clock3,
  Copy,
  Globe,
  GripVertical,
  List,
  ListPlus,
  Lock,
  MinusCircle,
  MoreHorizontal,
  Music2,
  Pencil,
  Play,
  Plus,
  PlusCircle,
  CheckCircle2,
  Share,
  Shuffle,
  UserMinus,
  UserPlus,
  XCircle,
  Eye,
  EyeOff,
  Save,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { playlistAPI } from "../api/playlists";
import { trackAPI } from "../api/tracks";
import { collabAPI } from "../api/collaboration";
import { profileAPI } from "../api/profile";
import { searchAPI } from "../api/search";
import type { Playlist, PlaylistTrack, TrackSortField, SortOrder } from "../types";
import toast from "react-hot-toast";
import { DynamicMusicBackground } from "../components/ui/DynamicMusicBackground";
import {
  deleteLocalDraftPlaylistById,
  getLocalDraftPlaylistById,
} from "../utils/localPlaylists";
import { Modal } from "../components/ui/Modal";
import { EditPlaylistModal } from "../components/modals/EditPlaylistModal";
import { TrackContextMenu } from "../components/modals/TrackContextMenu";
import { Menu } from "lucide-react";
import { getArtistName, getAlbumName } from "../utils/trackHelpers";

const SpotifyIcon = ({ size = 24, className = "" }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

type PlaylistViewModel = {
  id: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  playlistType: "solo" | "collaborative";
  ownerText: string;
  coverUrl?: string;
  createdAt?: string;
  isLocalDraft?: boolean;
};

const PLACEHOLDER_TRACKS: PlaylistTrack[] = [
  {
    id: 9001,
    playlist_id: 999,
    added_by_id: 1,
    position: 1,
    added_at: "2021-03-15T11:22:00.000Z",
    song: {
      id: 501,
      title: "Ekta Chele",
      artist: "Sahana",
      album: "Jhalmuri, Vol. 1",
      genre: "Pop",
      release_year: 2021,
      duration_seconds: 217,
      cover_url: "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?w=400&h=400&fit=crop",
      audio_url: "",
      storage_path: "",
    },
  },
  {
    id: 9002,
    playlist_id: 999,
    added_by_id: 1,
    position: 2,
    added_at: "2021-03-15T11:36:00.000Z",
    song: {
      id: 502,
      title: "Jao Pakhi Bolo Tare",
      artist: "Krishnokoli Islam",
      album: "Monpura",
      genre: "Folk",
      release_year: 2020,
      duration_seconds: 208,
      cover_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
      audio_url: "",
      storage_path: "",
    },
  },
  {
    id: 9003,
    playlist_id: 999,
    added_by_id: 1,
    position: 3,
    added_at: "2021-03-16T08:12:00.000Z",
    song: {
      id: 503,
      title: "Kodom",
      artist: "Blue Jeans",
      album: "Numberella Charity Album",
      genre: "Alternative",
      release_year: 2021,
      duration_seconds: 247,
      cover_url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop",
      audio_url: "",
      storage_path: "",
    },
  },
];

const formatDuration = (totalSeconds: number): string => {
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
};

const formatDate = (iso?: string): string => {
  if (!iso) return "";
  const value = new Date(iso);
  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const SortableItem: React.FC<{
  id: number;
  disabled?: boolean;
  children: (dragHandleProps: React.HTMLAttributes<HTMLElement>, isDragging: boolean) => React.ReactNode;
}> = ({ id, disabled = false, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined }}
    >
      {children(disabled ? {} : { ...attributes, ...listeners }, isDragging)}
    </div>
  );
};

export const PlaylistPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = React.useState<PlaylistViewModel | null>(null);
  const [tracks, setTracks] = React.useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPlaceholderMode, setIsPlaceholderMode] = React.useState(false);
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [isListMenuOpen, setIsListMenuOpen] = React.useState(false);
  const [isShareSubmenuOpen, setIsShareSubmenuOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"normal" | "compact">("normal");
  const [isArchived, setIsArchived] = React.useState(false);
  const [isOnProfile, setIsOnProfile] = React.useState(true); // true = followed/owned, false = not on profile
  const [likedSongsPlaylistId, setLikedSongsPlaylistId] = React.useState<string | null>(null);
  const [likedTrackSongIds, setLikedTrackSongIds] = React.useState<Set<number>>(new Set());
  const [likedSongTrackIdsMap, setLikedSongTrackIdsMap] = React.useState<Map<number, number>>(new Map()); // song_id -> track_id in Liked Songs
  const [userPlaylists, setUserPlaylists] = React.useState<{ id: string; name: string }[]>([]);
  const [userMap, setUserMap] = React.useState<Map<number, { id: number; username: string; display_name?: string; avatar_url?: string }>>(new Map());
  const [contextMenu, setContextMenu] = React.useState<{
    isOpen: boolean;
    track: PlaylistTrack | null;
    x: number;
    y: number;
  }>({
    isOpen: false,
    track: null,
    x: 0,
    y: 0,
  });

  // Reorder/sort state
  const [isReorderMode, setIsReorderMode] = React.useState(false);
  const [reorderedTracks, setReorderedTracks] = React.useState<PlaylistTrack[]>([]);
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState<{ field: TrackSortField; order: SortOrder } | null>(null);
  const [isSorting, setIsSorting] = React.useState(false);
  const [isAdvancedSortOpen, setIsAdvancedSortOpen] = React.useState(false);

  const actionsMenuRef = React.useRef<HTMLDivElement>(null);
  const listMenuRef = React.useRef<HTMLDivElement>(null);
  const contextMenuRef = React.useRef<HTMLDivElement>(null);

  // Helper to get current user ID
  const getCurrentUserId = React.useCallback((): number => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch {
      // Ignore parse errors
    }
    return 0;
  }, []);

  // Helper to get display name for a user ID
  const getDisplayName = React.useCallback((userId: number): string => {
    const currentUserId = getCurrentUserId();
    if (userId === currentUserId) return 'You';

    const userData = userMap.get(userId);
    if (userData) {
      return userData.display_name || userData.username;
    }

    return 'Unknown';
  }, [userMap, getCurrentUserId]);

  // Helper to get avatar URL for a user ID
  const getAvatarUrl = React.useCallback((userId: number): string => {
    const userData = userMap.get(userId);
    if (userData?.avatar_url) {
      return userData.avatar_url;
    }
    return '';
  }, [userMap]);

  // Helper to get initials for a user ID (used as fallback when no avatar)
  const getInitials = React.useCallback((userId: number): string => {
    const displayName = getDisplayName(userId);
    if (displayName === 'You') return 'Y';
    if (displayName.startsWith('User')) return displayName.replace('User', '');
    const words = displayName.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }, [getDisplayName]);

  const sortMenuRef = React.useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleToggleLike = async (track: PlaylistTrack) => {
    let currentLikedSongsId = likedSongsPlaylistId;

    if (currentLikedSongsId === null) {
        try {
            const newPlaylist = await playlistAPI.create({
                name: "Liked Songs",
                visibility: "private",
                is_liked_songs: true
            });
            currentLikedSongsId = String(newPlaylist.id);
            setLikedSongsPlaylistId(currentLikedSongsId);
            setUserPlaylists(prev => [...prev, { id: String(newPlaylist.id), name: newPlaylist.name }]);
            window.dispatchEvent(new Event('local_playlists_updated'));
            toast.success("Created Liked Songs playlist");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create Liked Songs playlist");
            return;
        }
    }

    const isLiked = likedTrackSongIds.has(track.song.id);
    try {
        if (isLiked) {
            const trackIdInLiked = likedSongTrackIdsMap.get(track.song.id);
            if (trackIdInLiked) {
                await trackAPI.remove(Number(currentLikedSongsId), trackIdInLiked);
                setLikedTrackSongIds(prev => {
                    const next = new Set(prev);
                    next.delete(track.song.id);
                    return next;
                });
                setLikedSongTrackIdsMap(prev => {
                    const next = new Map(prev);
                    next.delete(track.song.id);
                    return next;
                });
                toast.success("Removed from Liked Songs");
            }
        } else {
            const res = await trackAPI.add(Number(currentLikedSongsId), track.song.id);
            setLikedTrackSongIds(prev => new Set(prev).add(track.song.id));
            if (res && res.id) {
                setLikedSongTrackIdsMap(prev => new Map(prev).set(track.song.id, res.id));
            }
            toast.success("Added to Liked Songs");
        }
    } catch (err) {
        console.error(err);
        toast.error("Failed to update Liked Songs");
    }
  };

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setReorderedTracks(prev => {
      const oldIndex = prev.findIndex(t => t.id === active.id);
      const newIndex = prev.findIndex(t => t.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const enterReorderMode = React.useCallback(() => {
    setReorderedTracks([...tracks]);
    setIsReorderMode(true);
    setSortConfig(null);
  }, [tracks]);

  const cancelReorderMode = React.useCallback(() => {
    setIsReorderMode(false);
    setReorderedTracks([]);
  }, []);

  const saveReorder = React.useCallback(async () => {
    if (!playlist) return;
    const numericId = Number(playlist.id);
    if (!Number.isFinite(numericId)) return;
    setIsSavingOrder(true);
    try {
      await trackAPI.reorder(numericId, reorderedTracks.map(t => t.id));
      setTracks(reorderedTracks);
      setIsReorderMode(false);
      setReorderedTracks([]);
      toast.success('Track order saved');
    } catch {
      toast.error('Failed to save order');
    } finally {
      setIsSavingOrder(false);
    }
  }, [playlist, reorderedTracks]);

  const handleRemoveInReorder = React.useCallback((trackId: number) => {
    setReorderedTracks(prev => prev.filter(t => t.id !== trackId));
  }, []);

  const handleSort = React.useCallback(async (field: TrackSortField, order: SortOrder) => {
    if (!playlist) return;
    const numericId = Number(playlist.id);
    if (!Number.isFinite(numericId)) return;
    setIsSorting(true);
    try {
      const sorted = await trackAPI.sort(numericId, field, order);
      const sortedData = sorted as unknown;
      const tracks = Array.isArray(sorted)
        ? sorted
        : (sortedData && typeof sortedData === 'object' && 'tracks' in sortedData && Array.isArray((sortedData as Record<string, unknown>).tracks)
          ? (sortedData as Record<string, unknown>).tracks as PlaylistTrack[]
          : []);
      setTracks(tracks);
      setSortConfig({ field, order });
      setIsAdvancedSortOpen(false);
    } catch {
      toast.error('Failed to sort tracks');
    } finally {
      setIsSorting(false);
    }
  }, [playlist]);

  const handleClearSort = React.useCallback(async () => {
    if (!playlist) return;
    const numericId = Number(playlist.id);
    if (!Number.isFinite(numericId)) return;
    setIsSorting(true);
    try {
      const sorted = await trackAPI.sort(numericId, 'custom', 'asc');
      const sortedData = sorted as unknown;
      const tracks = Array.isArray(sorted)
        ? sorted
        : (sortedData && typeof sortedData === 'object' && 'tracks' in sortedData && Array.isArray((sortedData as Record<string, unknown>).tracks)
          ? (sortedData as Record<string, unknown>).tracks as PlaylistTrack[]
          : []);
      setTracks(tracks);
      setSortConfig(null);
      setIsAdvancedSortOpen(false);
    } catch {
      toast.error('Failed to clear sort');
    } finally {
      setIsSorting(false);
    }
  }, [playlist]);

  const handleColumnSort = React.useCallback((field: TrackSortField) => {
    if (sortConfig?.field === field) {
      handleSort(field, sortConfig.order === 'asc' ? 'desc' : 'asc');
    } else {
      handleSort(field, 'asc');
    }
  }, [sortConfig, handleSort]);

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setIsPlaceholderMode(false);

      if (id.startsWith("local-")) {
        const localDraft = getLocalDraftPlaylistById(id);

        if (isMounted) {
          if (localDraft) {
            setPlaylist({
              id: localDraft.id,
              name: localDraft.name,
              description: localDraft.description || "Your playlist.",
              visibility: localDraft.visibility,
              playlistType: "solo",
              ownerText: "You",
              createdAt: localDraft.created_at,
              isLocalDraft: true,
            });
          } else {
            setPlaylist({
              id,
              name: "Draft Playlist",
              description: "This local draft could not be found.",
              visibility: "private",
              playlistType: "solo",
              ownerText: "You",
              isLocalDraft: true,
            });
          }
          setTracks([]);
          setIsLoading(false);
        }
        return;
      }

      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        if (isMounted) {
          setPlaylist({
            id,
            name: "Feel-good Bangla",
            description: "A smooth evening mix.",
            visibility: "public",
            playlistType: "solo",
            ownerText: "Raiyan.Pumal",
            coverUrl:
              "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?w=500&h=500&fit=crop",
          });
          setTracks(PLACEHOLDER_TRACKS);
          setIsPlaceholderMode(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const [playlistData, trackData] = await Promise.all([
          playlistAPI.get(numericId, true),
          trackAPI.list(numericId),
        ]);

        // Debug logging to see what backend returns
        console.log('🔍 Backend playlist data:', playlistData);
        console.log('🔍 playlist_type type:', typeof playlistData.playlist_type);
        console.log('🔍 playlist_type value:', playlistData.playlist_type);

        if (!isMounted) return;

        // Defensive: Handle cases where backend returns Artist object instead of string
        const isCollaborative = typeof playlistData.playlist_type === 'string'
            ? playlistData.playlist_type === "collaborative"
            : false;

        const playlistName = typeof playlistData.name === 'string'
            ? playlistData.name
            : (playlistData.name as Record<string, unknown>)?.name as string || 'Untitled Playlist';

        let archivedStatus = false;
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.id === playlistData.owner_id) {
                    const unarchivedRes = await playlistAPI.getUserPlaylists(user.id, false);
                    let unarchived: unknown[] = [];
                    if (Array.isArray(unarchivedRes)) {
                        unarchived = unarchivedRes;
                    } else if (unarchivedRes && typeof unarchivedRes === 'object' && 'playlists' in unarchivedRes) {
                        unarchived = (unarchivedRes as Record<string, unknown>).playlists as unknown[];
                    }
                    archivedStatus = !unarchived.some((p: unknown) => (p as Record<string, unknown>).id === playlistData.id);
                }
            }
        } catch {
            // Ignore parse errors from localStorage and silent fetch failures
        }

        setPlaylist({
          id: String(playlistData.id),
          name: playlistName,
          description: playlistData.description || "",
          visibility: playlistData.visibility,
          playlistType: isCollaborative ? "collaborative" : "solo",
          ownerText: isCollaborative ? "Collaborative" : "You",
          coverUrl: playlistData.cover_url || undefined,
          createdAt: playlistData.created_at,
        });
        setIsArchived(archivedStatus);
        setIsOnProfile(true); // Own playlists are always accessible
        setTracks(Array.isArray(trackData) ? trackData : []);

        // Build user map for "Added by" display by fetching profiles for all users who added tracks
        const tracksArray = Array.isArray(trackData) ? trackData : [];
        const uniqueUserIds = [...new Set(tracksArray.map((t: PlaylistTrack) => t.added_by_id))];

        if (uniqueUserIds.length > 0) {
          const map = new Map<number, { id: number; username: string; display_name?: string; avatar_url?: string }>();

          // Fetch profile data for each unique user who added tracks
          await Promise.all(
            uniqueUserIds.map(async (userId) => {
              try {
                const profile = await profileAPI.getPublicProfile(userId);
                console.log('🖼️ Profile for user', userId, ':', profile);
                map.set(userId, {
                  id: userId,
                  username: `user${userId}`,
                  display_name: profile.display_name,
                  avatar_url: profile.avatar_url,
                });
              } catch (error) {
                console.error('❌ Failed to fetch profile for user', userId, ':', error);
                // If profile fetch fails, use fallback data
                const displayName = `User${userId}`;
                map.set(userId, {
                  id: userId,
                  username: `user${userId}`,
                  display_name: displayName,
                });
              }
            })
          );
          console.log('👥 Final userMap:', Array.from(map.entries()));
          setUserMap(map);
        } else {
          setUserMap(new Map());
        }

        // Also fetch user's liked songs playlist if it exists
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            try {
                const playlistsResponse = await playlistAPI.getUserPlaylists(user.id, true);
                // Handle both array and object responses with playlists array
                let playlists: Playlist[] = [];
                if (Array.isArray(playlistsResponse)) {
                    playlists = playlistsResponse as Playlist[];
                } else if (playlistsResponse && typeof playlistsResponse === 'object' && 'playlists' in playlistsResponse) {
                    playlists = (playlistsResponse as Record<string, unknown>).playlists as Playlist[];
                }

                setUserPlaylists(playlists.map((p: Playlist) => ({ id: String(p.id), name: p.name })));

                const likedPlaylist = playlists.find((p: Playlist) => p.is_liked_songs);
                if (likedPlaylist) {
                    setLikedSongsPlaylistId(String(likedPlaylist.id));
                    // Get tracks in Liked Songs to show heart status
                    const likedTracks = await trackAPI.list(likedPlaylist.id);
                    if (Array.isArray(likedTracks)) {
                        setLikedTrackSongIds(new Set(likedTracks.map((t: PlaylistTrack) => t.song.id)));
                        const mapping = new Map<number, number>();
                        likedTracks.forEach((t: PlaylistTrack) => mapping.set(t.song.id, t.id));
                        setLikedSongTrackIdsMap(mapping);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch Liked Songs metadata:", err);
            }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load playlist. Showing placeholder preview:", error);

        if (!isMounted) return;

        setPlaylist({
          id,
          name: "Feel-good Bangla",
          description: "A smooth evening mix.",
          visibility: "public",
          playlistType: "solo",
          ownerText: "Raiyan.Pumal",
          coverUrl:
            "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?w=500&h=500&fit=crop",
        });
        setTracks(PLACEHOLDER_TRACKS);
        setIsPlaceholderMode(true);
        setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  React.useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!actionsMenuRef.current) return;
      if (!actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
        setIsShareSubmenuOpen(false);
      }
      if (!listMenuRef.current) return;
      if (!listMenuRef.current.contains(event.target as Node)) {
        setIsListMenuOpen(false);
      }
      // Close context menu when clicking outside of it
      if (contextMenu.isOpen && contextMenuRef.current) {
        if (!contextMenuRef.current.contains(event.target as Node)) {
          setContextMenu(prev => ({ ...prev, isOpen: false }));
        }
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsAdvancedSortOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [contextMenu.isOpen]);

  React.useEffect(() => {
    setIsActionsOpen(false);
    setIsDeleteConfirmOpen(false);
    setIsShareSubmenuOpen(false);
    setIsListMenuOpen(false);
    setDeleteError(null);
  }, [id]);

  const handleDeletePlaylist = async () => {
    if (!playlist) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      if (playlist.isLocalDraft || playlist.id.startsWith("local-")) {
        deleteLocalDraftPlaylistById(playlist.id);
      } else {
        const numericId = Number(playlist.id);
        if (!Number.isFinite(numericId)) {
          setIsDeleteConfirmOpen(false);
          setIsActionsOpen(false);
          navigate("/", { replace: true });
          return;
        }
        await playlistAPI.delete(numericId);
      }

      setIsDeleteConfirmOpen(false);
      setIsActionsOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Failed to delete playlist:", error);
      setDeleteError("Could not delete this playlist. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const displayedTracks = isReorderMode ? reorderedTracks : tracks;

  if (isLoading || !playlist) {
    return (
      <div className="relative min-h-full p-6 md:p-8">
        <DynamicMusicBackground
          variant="mixed"
          density="low"
          showGrid={false}
          showWave={false}
          iconClassName="text-white/18"
          orbOpacityClassName="opacity-70"
        />
        <div className="relative z-10 animate-pulse space-y-4">
          <div className="h-56 rounded-2xl bg-white/[0.08] border border-white/10" />
          <div className="h-8 w-72 rounded-lg bg-white/[0.08]" />
          <div className="h-56 rounded-2xl bg-white/[0.06] border border-white/10" />
        </div>
      </div>
    );
  }

  const heroGradient =
    "linear-gradient(180deg, rgba(97, 61, 168, 0.48) 0%, rgba(58, 35, 108, 0.28) 52%, rgba(7, 10, 20, 0) 100%)";
  const totalDurationSeconds = tracks.reduce(
    (sum, track) => sum + track.song.duration_seconds,
    0
  );
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const durationLabel =
    totalHours > 0 ? `about ${totalHours} hr ${totalMinutes} min` : `${totalMinutes} min`;

  return (
    <div className="relative min-h-full pb-10">
      <DynamicMusicBackground
        variant="mixed"
        density="low"
        showGrid={false}
        showWave={false}
        iconClassName="text-white/18"
        orbOpacityClassName="opacity-70"
      />
      <div className="relative z-10">
        <section className="relative px-6 md:px-8 pt-8 pb-6" style={{ background: heroGradient }}>
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-end gap-5 md:gap-6">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-md border border-white/15 bg-black/30 shadow-[0_24px_48px_rgba(0,0,0,0.45)] overflow-hidden shrink-0">
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/[0.05]">
                  <Music2 size={56} className="text-white/70" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/80 font-semibold mb-2">
                {playlist.visibility === "public" ? "Public Playlist" : "Private Playlist"}
              </p>
              <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-[0.95] break-words">
                {playlist.name}
              </h1>

              <div className="text-white/82 text-sm mt-3 max-w-3xl">
                {playlist.description || " "}
              </div>

              {playlist.playlistType === "collaborative" && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-[#1a1a2e] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      Y
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-[#1a1a2e] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      A
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-[#1a1a2e] bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                      S
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full border border-white/20 bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.10] transition-colors flex items-center justify-center">
                    <Plus size={16} />
                  </button>
                  <span className="text-white/65 text-xs ml-1">3 collaborators</span>
                </div>
              )}

              <p className="text-white/75 text-xs md:text-sm mt-3 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white/90">{playlist.ownerText}</span>
                <span>•</span>
                <span>{tracks.length} songs, {durationLabel}</span>
                {playlist.createdAt && (
                  <>
                    <span>•</span>
                    <span>Created {formatDate(playlist.createdAt)}</span>
                  </>
                )}
                {isPlaceholderMode && (
                  <>
                    <span>•</span>
                    <span className="text-white/55">Preview</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        <div className="px-6 md:px-8 pt-6">
          <section className="flex items-center gap-4 border-b border-white/10 pb-4">
            <button className="w-14 h-14 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-[0_10px_24px_rgba(30,185,84,0.38)] hover:scale-105 transition-transform">
              <Play size={24} fill="currentColor" className="translate-x-[1px]" />
            </button>

            <button className="w-9 h-9 rounded-full border border-white/20 bg-white/[0.03] text-white/75 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center">
              <Plus size={18} />
            </button>
            <button className="w-9 h-9 rounded-full border border-white/20 bg-white/[0.03] text-white/75 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center">
              <Shuffle size={17} />
            </button>
            <button className="w-9 h-9 rounded-full border border-white/20 bg-white/[0.03] text-white/75 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center">
              <UserPlus size={17} />
            </button>

            <div className="relative" ref={actionsMenuRef}>
              <button
                onClick={() => setIsActionsOpen((prev) => !prev)}
                className="w-9 h-9 rounded-full border border-white/20 bg-white/[0.03] text-white/75 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center"
                aria-label="Playlist actions"
              >
                <MoreHorizontal size={18} />
              </button>

              {isActionsOpen && (
                <div className="absolute left-0 top-11 z-40 w-[260px] py-1 bg-white/5 backdrop-blur-xl rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.50)] border border-white/15 animate-in fade-in zoom-in-95 duration-100">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left">
                    <ListPlus size={16} className="text-white/60 shrink-0" />
                    <span className="flex-1">Add to queue</span>
                  </button>
                  <div className="my-1 mx-3 border-t border-white/10" />
                  <button
                    onClick={async () => {
                        setIsActionsOpen(false);
                        const numericId = Number(playlist.id);
                        if (!Number.isFinite(numericId) || playlist.isLocalDraft) return;
                        try {
                            if (isOnProfile) {
                                await playlistAPI.unfollow(numericId);
                                setIsOnProfile(false);
                                toast.success("Removed from your profile");
                            } else {
                                await playlistAPI.follow(numericId);
                                setIsOnProfile(true);
                                toast.success("Added back to your profile");
                            }
                        } catch {
                            toast.error(`Failed to ${isOnProfile ? 'remove from' : 'add to'} profile`);
                        }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <UserMinus size={16} className="text-white/60 shrink-0" />
                    <span className="flex-1">{isOnProfile ? "Remove from profile" : "Add to profile"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsActionsOpen(false);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <Pencil size={16} className="text-white/60 shrink-0" />
                    <span className="flex-1">Edit details</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsActionsOpen(false);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <MinusCircle size={16} className="text-white/60 shrink-0" />
                    <span className="flex-1">Delete</span>
                  </button>
                  <div className="my-1 mx-3 border-t border-white/10" />
                  <button
                    onClick={async () => {
                      setIsActionsOpen(false);
                      const newVisibility = playlist.visibility === "public" ? "private" : "public";
                      try {
                        const numericId = Number(playlist.id);
                        if (Number.isFinite(numericId)) {
                          await playlistAPI.update(numericId, { visibility: newVisibility });
                        }
                        setPlaylist(prev => prev ? { ...prev, visibility: newVisibility } : null);
                        toast.success(`Playlist is now ${newVisibility}`);
                      } catch {
                        toast.error("Failed to update visibility");
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    {playlist.visibility === "public" ? (
                      <>
                        <Lock size={16} className="text-white/60 shrink-0" />
                        <span className="flex-1">Make private</span>
                      </>
                    ) : (
                      <>
                        <Globe size={16} className="text-white/60 shrink-0" />
                        <span className="flex-1">Make public</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      setIsActionsOpen(false);
                      const numericId = Number(playlist.id);
                      if (Number.isFinite(numericId)) {
                        try {
                           const invite = await collabAPI.generateInvite(numericId);
                           const inviteUrl = `${window.location.origin}/invite/${invite.token}`;
                           await navigator.clipboard.writeText(inviteUrl);
                           toast.success("Invite link copied to clipboard!");
                        } catch {
                           toast.error("Failed to generate invite link");
                        }
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <UserPlus size={16} className="text-white/60 shrink-0" />
                    <span className="flex-1">Invite collaborators</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left">
                    <XCircle size={16} className="text-white/60 shrink-0" />
                    <span className="flex-1">Exclude from your taste profile</span>
                  </button>
                  <div className="my-1 mx-3 border-t border-white/10" />
                  <button
                    onClick={async () => {
                        try {
                            const numericId = Number(playlist.id);
                            if (Number.isFinite(numericId)) {
                                if (isArchived) {
                                    await trackAPI.unarchivePlaylist(numericId);
                                    setIsArchived(false);
                                    toast.success("Playlist unhidden from profile", { icon: "👁️" });
                                } else {
                                    await trackAPI.archivePlaylist(numericId);
                                    setIsArchived(true);
                                    toast.success("Playlist hidden from profile", { icon: "🙈" });
                                }
                                window.dispatchEvent(new Event('local_playlists_updated'));
                            }
                        } catch {
                            toast.error(`Failed to ${isArchived ? 'unhide' : 'hide'} playlist`);
                        } finally {
                            setIsActionsOpen(false);
                        }
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isArchived ? (
                          <>
                              <Eye size={16} className="text-white/60 shrink-0" />
                              <span>Unhide playlist</span>
                          </>
                      ) : (
                          <>
                              <EyeOff size={16} className="text-white/60 shrink-0" />
                              <span>Hide playlist</span>
                          </>
                      )}
                    </div>
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isArchived) {
                          toast.error("Cannot share a hidden playlist");
                          return;
                        }
                        setIsShareSubmenuOpen((prev) => !prev);
                      }}
                      className={`w-full flex items-center px-3 py-2 text-sm text-left transition-colors ${
                        isArchived
                          ? "text-white/40 cursor-not-allowed bg-transparent"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Share size={16} className={isArchived ? "text-white/30 shrink-0" : "text-white/60 shrink-0"} />
                        <span>Share</span>
                      </div>
                      <ChevronRight size={14} className={isArchived ? "text-white/20" : "text-white/40"} />
                    </button>

                    {isShareSubmenuOpen && (
                      <div className="absolute left-full top-0 ml-1 z-50 w-56 py-1 bg-white/15 backdrop-blur-3xl rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.50)] border border-white/15 animate-in fade-in slide-in-from-left-1 duration-150">
                        <button
                          onClick={async () => {
                            try {
                              const numericId = Number(playlist.id);
                              if (Number.isFinite(numericId)) {
                                const shareData = await collabAPI.createShareLink(numericId);
                                const url = `${window.location.origin}/share/${shareData.token}`;
                                await navigator.clipboard.writeText(url);
                                toast.success("Share link copied to clipboard");
                              }
                            } catch {
                              toast.error("Failed to generate share link");
                            } finally {
                              setIsShareSubmenuOpen(false);
                              setIsActionsOpen(false);
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                        >
                          <Copy size={16} className="text-white/60 shrink-0" />
                          <span className="flex-1">Copy link to playlist</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="my-1 mx-3 border-t border-white/10" />
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left">
                    <SpotifyIcon size={16} className="text-white/60 shrink-0" />
                    <span className="flex-1">Open in Desktop app</span>
                  </button>
                </div>
              )}
            </div>

            {/* Advanced sort */}
            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => setIsAdvancedSortOpen(prev => !prev)}
                disabled={isReorderMode || isSorting}
                className={`w-9 h-9 rounded-full border transition-colors flex items-center justify-center ${
                  sortConfig
                    ? 'border-white/30 bg-white/10 text-white'
                    : 'border-white/20 bg-white/[0.03] text-white/75 hover:text-white hover:bg-white/[0.08]'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                aria-label="Sort"
              >
                <SlidersHorizontal size={17} />
              </button>

              {isAdvancedSortOpen && (
                <div className="absolute left-0 top-11 z-50 w-56 py-2 bg-white/5 backdrop-blur-xl rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.50)] border border-white/15 animate-in fade-in zoom-in-95 duration-100">
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-white/40 font-semibold">Sort by</p>
                  {(['title','artist','album','duration','added_at','year'] as TrackSortField[]).map(field => {
                    const isActive = sortConfig?.field === field;
                    const label: Record<string, string> = { title: 'Title', artist: 'Artist', album: 'Album', duration: 'Duration', added_at: 'Date Added', year: 'Release Year' };
                    return (
                      <button
                        key={field}
                        onClick={() => handleColumnSort(field)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left ${
                          isActive ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{label[field]}</span>
                        {isActive && (
                          sortConfig?.order === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                        )}
                      </button>
                    );
                  })}
                  {sortConfig && (
                    <>
                      <div className="my-1 mx-3 border-t border-white/10" />
                      <button
                        onClick={handleClearSort}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <span>Clear sort</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Reorder controls */}
            {!isReorderMode ? (
              <button
                onClick={enterReorderMode}
                disabled={tracks.length === 0 || isSorting || isPlaceholderMode}
                className="w-9 h-9 rounded-full border border-white/20 bg-white/[0.03] text-white/75 hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Reorder"
              >
                <GripVertical size={17} />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelReorderMode}
                  disabled={isSavingOrder}
                  className="px-4 py-2 rounded-full text-xs font-semibold border border-white/20 text-white/60 hover:text-white transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={saveReorder}
                  disabled={isSavingOrder}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-spotify-green text-black hover:bg-spotify-green/90 transition-colors disabled:opacity-60"
                >
                  <Save size={12} />
                  {isSavingOrder ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}

            <div className="relative ml-auto" ref={listMenuRef}>
              <button
                onClick={() => setIsListMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold transition-colors"
                aria-label="View mode"
              >
                <span>{viewMode === "compact" ? "Compact" : "List"}</span>
                {viewMode === "compact" ? <Menu size={16} /> : <List size={16} />}
              </button>

              {isListMenuOpen && (
                <div className="absolute right-0 top-8 z-40 w-48 py-1 bg-white/5 backdrop-blur-xl rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.50)] border border-white/15 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setViewMode("compact");
                      setIsListMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left ${
                      viewMode === "compact"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>Compact</span>
                    {viewMode === "compact" && <span className="text-white/80">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("normal");
                      setIsListMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left ${
                      viewMode === "normal"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>Normal</span>
                    {viewMode === "normal" && <span className="text-white/80">✓</span>}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            <div className={`px-4 py-3 text-xs uppercase tracking-wider text-white/45 grid gap-3 border-b border-white/10 ${
              viewMode === "compact"
                ? "grid-cols-[30px_minmax(120px,2fr)_minmax(120px,1.5fr)_minmax(120px,1.5fr)_minmax(120px,1fr)_70px_60px]"
                : playlist.playlistType === "collaborative"
                  ? "grid-cols-[38px_2fr_1.4fr_1fr_1.2fr_70px_68px]"
                  : "grid-cols-[38px_2fr_1.4fr_1fr_70px_68px]"
            }`}>
              <span className="text-white/45">{isReorderMode ? '' : '#'}</span>
              <button
                onClick={() => !isReorderMode && handleColumnSort('title')}
                className={`flex items-center gap-1 text-xs uppercase tracking-wider transition-colors ${!isReorderMode ? 'hover:text-white/70 cursor-pointer' : 'cursor-default'} ${sortConfig?.field === 'title' ? 'text-white/70' : ''}`}
              >
                Title
                {!isReorderMode && (sortConfig?.field === 'title'
                  ? (sortConfig.order === 'asc' ? <ArrowUp size={9}/> : <ArrowDown size={9}/>)
                  : <ArrowUpDown size={9} className="opacity-30"/>)}
              </button>
              {viewMode === "compact" && (
                <button onClick={() => !isReorderMode && handleColumnSort('artist')} className={`flex items-center gap-1 text-xs uppercase tracking-wider transition-colors ${!isReorderMode ? 'hover:text-white/70 cursor-pointer' : 'cursor-default'} ${sortConfig?.field === 'artist' ? 'text-white/70' : ''}`}>
                  Artist
                  {!isReorderMode && (sortConfig?.field === 'artist' ? (sortConfig.order === 'asc' ? <ArrowUp size={9}/> : <ArrowDown size={9}/>) : <ArrowUpDown size={9} className="opacity-30"/>)}
                </button>
              )}
              <button onClick={() => !isReorderMode && handleColumnSort('album')} className={`flex items-center gap-1 text-xs uppercase tracking-wider transition-colors ${!isReorderMode ? 'hover:text-white/70 cursor-pointer' : 'cursor-default'} ${sortConfig?.field === 'album' ? 'text-white/70' : ''}`}>
                Album
                {!isReorderMode && (sortConfig?.field === 'album' ? (sortConfig.order === 'asc' ? <ArrowUp size={9}/> : <ArrowDown size={9}/>) : <ArrowUpDown size={9} className="opacity-30"/>)}
              </button>
              {(playlist.playlistType === "collaborative" || viewMode === "compact") && <span>Added by</span>}
              {viewMode !== "compact" && (
                <button onClick={() => !isReorderMode && handleColumnSort('added_at')} className={`flex items-center gap-1 text-xs uppercase tracking-wider transition-colors ${!isReorderMode ? 'hover:text-white/70 cursor-pointer' : 'cursor-default'} ${sortConfig?.field === 'added_at' ? 'text-white/70' : ''}`}>
                  Date added
                  {!isReorderMode && (sortConfig?.field === 'added_at' ? (sortConfig.order === 'asc' ? <ArrowUp size={9}/> : <ArrowDown size={9}/>) : <ArrowUpDown size={9} className="opacity-30"/>)}
                </button>
              )}
              <span className="flex items-center justify-end">{isReorderMode ? '' : ''}</span>
              <span className="flex items-center justify-end">
                <button onClick={() => !isReorderMode && handleColumnSort('duration')} className={`flex items-center gap-1 transition-colors ${!isReorderMode ? 'hover:text-white/70 cursor-pointer' : 'cursor-default'}`}>
                  <Clock3 size={13} />
                  {!isReorderMode && (sortConfig?.field === 'duration' ? (sortConfig.order === 'asc' ? <ArrowUp size={9}/> : <ArrowDown size={9}/>) : null)}
                </button>
              </span>
            </div>

            {tracks.length === 0 ? (
              <div className="p-10 text-center">
                <div className="inline-flex w-14 h-14 rounded-2xl border border-white/16 bg-white/[0.05] items-center justify-center mb-4">
                  <Music2 size={24} className="text-white/70" />
                </div>
                <h3 className="text-white text-2xl font-bold tracking-tight mb-2">This playlist is empty</h3>
                <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base">
                  Add tracks to start building your mix.
                </p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={displayedTracks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div>
                    {displayedTracks.map((track, index) => (
                      <SortableItem key={track.id} id={track.id} disabled={!isReorderMode}>
                        {(dragHandleProps, isDragging) => (
                          <div
                            role={isReorderMode ? undefined : "button"}
                            className={`w-full group text-left px-4 grid gap-3 items-center border-b border-white/8 transition-colors ${
                              index === displayedTracks.length - 1 ? 'border-b-0' : ''
                            } ${
                              viewMode === "compact"
                                ? "py-1.5 grid-cols-[30px_minmax(120px,2fr)_minmax(120px,1.5fr)_minmax(120px,1.5fr)_minmax(120px,1fr)_70px_60px]"
                                : playlist.playlistType === "collaborative"
                                  ? "py-2.5 grid-cols-[38px_2fr_1.4fr_1fr_1.2fr_70px_68px]"
                                  : "py-2.5 grid-cols-[38px_2fr_1.4fr_1fr_70px_68px]"
                            } ${isDragging ? 'bg-white/[0.12] rounded-lg shadow-lg' : isReorderMode ? 'hover:bg-white/[0.05] cursor-grab' : 'hover:bg-white/[0.08] cursor-pointer'}`}
                          >
                            {/* # / drag handle column */}
                            {isReorderMode ? (
                              <span className="flex items-center">
                                <button
                                  {...dragHandleProps}
                                  className="text-white/40 hover:text-white/70 transition-colors touch-none cursor-grab active:cursor-grabbing"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <GripVertical size={16} />
                                </button>
                              </span>
                            ) : (
                              <span className="text-white/55 text-sm tabular-nums">{index + 1}</span>
                            )}

                            {/* Title column */}
                            <span className="flex items-center gap-3 min-w-0">
                              {viewMode !== "compact" && (
                                <img src={track.song.cover_url} alt={track.song.title} className="w-10 h-10 rounded object-cover border border-white/10 shrink-0" loading="lazy" />
                              )}
                              <span className="min-w-0">
                                <span className={`text-white text-sm truncate block ${viewMode === "compact" ? "font-normal" : "font-semibold"}`}>{track.song.title}</span>
                                {viewMode !== "compact" && (
                                  <span className="text-white/55 text-xs truncate block">{getArtistName(track.song.artist)}</span>
                                )}
                              </span>
                            </span>

                            {/* Artist (compact mode) */}
                            {viewMode === "compact" && (
                              <span className="text-white/50 text-sm truncate">{getArtistName(track.song.artist)}</span>
                            )}

                            {/* Album */}
                            <span className="text-white/50 text-sm truncate">{getAlbumName(track.song.album)}</span>

                            {/* Added by (collaborative or compact) */}
                            {(playlist.playlistType === "collaborative" || viewMode === "compact") && (
                              <span className="text-white/45 text-sm truncate flex items-center gap-2">
                                {getAvatarUrl(track.added_by_id) ? (
                                  <img
                                    src={getAvatarUrl(track.added_by_id)}
                                    alt={getDisplayName(track.added_by_id)}
                                    className="w-5 h-5 rounded-full object-cover shrink-0"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                    {getInitials(track.added_by_id)}
                                  </div>
                                )}
                                <span className="truncate">{getDisplayName(track.added_by_id)}</span>
                              </span>
                            )}

                            {/* Date added (normal mode) */}
                            {viewMode !== "compact" && (
                              <span className="text-white/45 text-sm truncate">{formatDate(track.added_at)}</span>
                            )}

                            {/* Actions column */}
                            {isReorderMode ? (
                              <span className="flex items-center justify-end pr-1">
                                <button
                                  onClick={e => { e.stopPropagation(); handleRemoveInReorder(track.id); }}
                                  className="text-white/40 hover:text-red-400 transition-colors flex items-center justify-center"
                                  title="Remove from playlist"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </span>
                            ) : (
                              <span className="flex items-center justify-end gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                <button
                                  onClick={async (e) => { e.stopPropagation(); await handleToggleLike(track); }}
                                  className={`transition-colors flex items-center justify-center ${likedTrackSongIds.has(track.song.id) ? "text-spotify-green" : "text-white/60 hover:text-white"}`}
                                >
                                  {likedTrackSongIds.has(track.song.id) ? <CheckCircle2 size={18} /> : <PlusCircle size={18} />}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setContextMenu({ isOpen: true, track, x: rect.left - 180, y: rect.bottom + 10 });
                                  }}
                                  className="text-white/60 hover:text-white transition-colors flex items-center justify-center font-bold"
                                >
                                  <MoreHorizontal size={18} />
                                </button>
                              </span>
                            )}

                            {/* Duration */}
                            <span className="text-white/45 text-sm text-right tabular-nums">
                              {formatDuration(track.song.duration_seconds)}
                            </span>
                          </div>
                        )}
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </section>
        </div>
      </div>

      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => !isDeleting && setIsDeleteConfirmOpen(false)}
        title="Delete playlist"
        maxWidthClassName="max-w-md"
      >
        <p className="text-white/80 text-sm leading-relaxed">
          Delete <span className="text-white font-semibold">{playlist.name}</span>? This action cannot be undone.
        </p>
        {deleteError && (
          <p className="mt-3 text-sm text-red-300">{deleteError}</p>
        )}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => setIsDeleteConfirmOpen(false)}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeletePlaylist}
            disabled={isDeleting}
            className="px-6 py-2 text-sm font-semibold rounded-full bg-red-500 text-white hover:bg-red-400 disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>

      <EditPlaylistModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        playlistId={playlist.id}
        initialName={playlist.name}
        initialDescription={playlist.description}
        initialCoverUrl={playlist.coverUrl}
        onSave={async (name, description, coverUrl) => {
          const numericId = Number(playlist.id);
          if (Number.isFinite(numericId)) {
            await playlistAPI.update(numericId, { name, description });
            if (coverUrl !== undefined && coverUrl !== playlist.coverUrl) {
              await playlistAPI.updateCover(numericId, coverUrl);
            }
          }
          setPlaylist((prev) => prev ? { ...prev, name, description, ...(coverUrl ? { coverUrl } : {}) } : null);
          toast.success("Playlist details updated!");
        }}
      />

      <TrackContextMenu
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        track={contextMenu.track}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        isLiked={contextMenu.track ? likedTrackSongIds.has(contextMenu.track.song.id) : false}
        onToggleLike={handleToggleLike}
        onAddToPlaylist={async (track, playlistId) => {
            try {
                if (!playlistId) {
                    // Create a new playlist and add the track to it
                    const newPlaylist = await playlistAPI.create({
                        name: `My Playlist`,
                        visibility: "private",
                    });
                    await trackAPI.add(newPlaylist.id, track.song.id);
                    setUserPlaylists(prev => [...prev, { id: String(newPlaylist.id), name: newPlaylist.name }]);
                    window.dispatchEvent(new Event('local_playlists_updated'));
                    toast.success(`Created "My Playlist" and added ${track.song.title}`);
                } else {
                    await trackAPI.add(Number(playlistId), track.song.id);
                    toast.success("Added to playlist");
                }
            } catch {
                toast.error("Failed to add to playlist");
            }
        }}
        onRemoveFromPlaylist={playlist && playlist.id ? async (track) => {
            try {
                await trackAPI.remove(Number(playlist.id), track.id);
                setTracks(prev => prev.filter(t => t.id !== track.id));
                toast.success("Removed from playlist");
            } catch {
                toast.error("Failed to remove track");
            }
        } : undefined}
        menuRef={contextMenuRef}
        playlists={userPlaylists}
        currentPlaylistId={playlist.id}
        onGoToArtist={async (artistName) => {
          try {
            const artists = await searchAPI.searchArtists(artistName);
            if (artists.length > 0) {
              const artist = artists[0];
              // Generate slug from artist name (matching ArtistPage's slug format)
              const slug = artist.name
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
              // Navigate using slug instead of ID
              navigate(`/artist/${slug}`);
            } else {
              // If no artist found, fallback to search page
              navigate(`/search?q=${encodeURIComponent(artistName)}`);
            }
          } catch {
            // If search fails, fallback to search page
            navigate(`/search?q=${encodeURIComponent(artistName)}`);
          }
        }}
      />
    </div>
  );
};
