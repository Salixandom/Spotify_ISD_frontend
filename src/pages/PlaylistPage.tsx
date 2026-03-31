import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock3,
  Download,
  List,
  MoreHorizontal,
  Music2,
  Play,
  Plus,
  Shuffle,
  Trash2,
  UserPlus,
} from "lucide-react";
import { playlistAPI } from "../api/playlists";
import { trackAPI } from "../api/tracks";
import type { PlaylistTrack } from "../types";
import { DynamicMusicBackground } from "../components/ui/DynamicMusicBackground";
import {
  deleteLocalDraftPlaylistById,
  getLocalDraftPlaylistById,
} from "../utils/localPlaylists";
import { Modal } from "../components/ui/Modal";

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

export const PlaylistPage: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = React.useState<PlaylistViewModel | null>(null);
  const [tracks, setTracks] = React.useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPlaceholderMode, setIsPlaceholderMode] = React.useState(false);
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const actionsMenuRef = React.useRef<HTMLDivElement>(null);

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
          playlistAPI.get(numericId),
          trackAPI.list(numericId),
        ]);

        if (!isMounted) return;

        setPlaylist({
          id: String(playlistData.id),
          name: playlistData.name,
          description: playlistData.description || "",
          visibility: playlistData.visibility,
          playlistType: playlistData.playlist_type,
          ownerText: playlistData.playlist_type === "collaborative" ? "Collaborative" : "You",
          coverUrl: playlistData.cover_url || undefined,
          createdAt: playlistData.created_at,
        });
        setTracks(Array.isArray(trackData) ? trackData : []);
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
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  React.useEffect(() => {
    setIsActionsOpen(false);
    setIsDeleteConfirmOpen(false);
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

  if (isLoading || !playlist) {
    return (
      <div className="relative min-h-full p-6 md:p-8">
        <DynamicMusicBackground />
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
      <DynamicMusicBackground />

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
              <Download size={17} />
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
                <div className="absolute left-0 top-11 z-40 w-60 rounded-xl border border-white/15 bg-black/55 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.45)] p-1.5">
                  <button className="w-full text-left px-3 py-2 text-sm text-white/85 hover:bg-white/[0.08] rounded-md transition-colors">
                    Add to queue
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-white/85 hover:bg-white/[0.08] rounded-md transition-colors">
                    Edit details
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={() => {
                      setIsActionsOpen(false);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Trash2 size={15} />
                    Delete playlist
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-white/85 hover:bg-white/[0.08] rounded-md transition-colors">
                    Share
                  </button>
                </div>
              )}
            </div>

            <div className="ml-auto inline-flex items-center gap-1.5 text-white/60 text-sm">
              <span>List</span>
              <List size={16} />
            </div>
          </section>

          <section className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            <div className="px-4 py-3 text-xs uppercase tracking-wider text-white/45 grid grid-cols-[38px_2fr_1.4fr_1fr_68px] gap-3 border-b border-white/10">
              <span>#</span>
              <span>Title</span>
              <span>Album</span>
              <span>Date added</span>
              <span className="flex items-center justify-end">
                <Clock3 size={13} />
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
              <div>
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    className="w-full text-left px-4 py-2.5 grid grid-cols-[38px_2fr_1.4fr_1fr_68px] gap-3 items-center border-b last:border-b-0 border-white/8 hover:bg-white/[0.08] transition-colors"
                  >
                    <span className="text-white/55 text-sm tabular-nums">{index + 1}</span>
                    <span className="flex items-center gap-3 min-w-0">
                      <img
                        src={track.song.cover_url}
                        alt={track.song.title}
                        className="w-10 h-10 rounded object-cover border border-white/10 shrink-0"
                        loading="lazy"
                      />
                      <span className="min-w-0">
                        <span className="text-white text-sm font-semibold truncate block">{track.song.title}</span>
                        <span className="text-white/55 text-xs truncate block">{track.song.artist}</span>
                      </span>
                    </span>
                    <span className="text-white/50 text-sm truncate">{track.song.album}</span>
                    <span className="text-white/45 text-sm truncate">{formatDate(track.added_at)}</span>
                    <span className="text-white/45 text-sm text-right tabular-nums">
                      {formatDuration(track.song.duration_seconds)}
                    </span>
                  </button>
                ))}
              </div>
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
    </div>
  );
};
