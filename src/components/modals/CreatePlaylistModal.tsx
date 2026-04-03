import React from "react";
import { Globe, Lock, Sparkles, Loader2, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../ui/Modal";
import { playlistAPI } from "../../api/playlists";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Visibility = "public" | "private";
type PlaylistType = "solo" | "collaborative";

export const CreatePlaylistModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [visibility, setVisibility] = React.useState<Visibility>("public");
  const [playlistType, setPlaylistType] = React.useState<PlaylistType>("solo");
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setVisibility("public");
      setPlaylistType("solo");
      setError("");
    }
  }, [isOpen]);

  const handleCreate = async () => {
    setIsCreating(true);
    setError("");

    try {
      const created = await playlistAPI.create({
        name: name.trim(),
        description: description.trim(),
        visibility,
        playlist_type: playlistType,
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
      navigate(`/playlist/${created.id}`);
    } catch (err) {
      console.error("Failed to create playlist:", err);
      setError("Failed to create playlist. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create playlist" maxWidthClassName="max-w-2xl">
      <div className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-200 flex items-center gap-2">
              {error}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-white/14 bg-gradient-to-r from-spotify-green/18 via-spotify-green/10 to-transparent px-4 py-3">
          <p className="text-sm text-white/85 flex items-center gap-2">
            <Sparkles size={14} className="text-spotify-green shrink-0" />
            Create a new playlist and start adding your favorite tracks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Playlist name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My next favorite mix"
              className="w-full rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2.5
              text-sm text-white placeholder:text-white/45 outline-none focus:border-spotify-green"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short vibe or mood for this playlist"
              rows={4}
              className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2.5
              text-sm text-white placeholder:text-white/45 outline-none focus:border-spotify-green"
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
            Visibility
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => !isCreating && setVisibility("public")}
              disabled={isCreating}
              className={`rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-center gap-2 justify-center ${
                visibility === "public"
                  ? "border-spotify-green bg-spotify-green/20 text-spotify-green"
                  : "border-white/15 bg-white/[0.07] text-white/75 hover:text-white"
              } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Globe size={14} /> Public
            </button>
            <button
              type="button"
              onClick={() => !isCreating && setVisibility("private")}
              disabled={isCreating}
              className={`rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-center gap-2 justify-center ${
                visibility === "private"
                  ? "border-spotify-green bg-spotify-green/20 text-spotify-green"
                  : "border-white/15 bg-white/[0.07] text-white/75 hover:text-white"
              } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Lock size={14} /> Private
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-white/60">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => !isCreating && setPlaylistType("solo")}
              disabled={isCreating}
              className={`rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-center gap-2 justify-center ${
                playlistType === "solo"
                  ? "border-purple-400 bg-purple-400/20 text-purple-300"
                  : "border-white/15 bg-white/[0.07] text-white/75 hover:text-white"
              } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <User size={14} /> Solo
            </button>
            <button
              type="button"
              onClick={() => !isCreating && setPlaylistType("collaborative")}
              disabled={isCreating}
              className={`rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-center gap-2 justify-center ${
                playlistType === "collaborative"
                  ? "border-purple-400 bg-purple-400/20 text-purple-300"
                  : "border-white/15 bg-white/[0.07] text-white/75 hover:text-white"
              } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Users size={14} /> Collaborative
            </button>
          </div>
          <p className="text-xs text-white/50 mt-1">
            {playlistType === "solo"
              ? "Only you can modify this playlist"
              : "Others can contribute and edit"}
          </p>
        </div>

        <div className="pt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white/75 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-spotify-green text-black hover:bg-spotify-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create playlist"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
