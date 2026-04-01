import React from "react";
import { Globe, Lock, Music2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../ui/Modal";
import { createLocalDraftPlaylist } from "../../utils/localPlaylists";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Visibility = "public" | "private";

export const CreatePlaylistModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [visibility, setVisibility] = React.useState<Visibility>("public");

  React.useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setVisibility("public");
    }
  }, [isOpen]);

  const handleCreate = () => {
    const created = createLocalDraftPlaylist({
      name,
      description,
      visibility,
    });

    if (onSuccess) {
      onSuccess();
    }

    onClose();
    navigate(`/playlist/${created.id}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create playlist" maxWidthClassName="max-w-2xl">
      <div className="space-y-5">
        <div className="rounded-2xl border border-white/14 bg-gradient-to-r from-spotify-green/18 via-spotify-green/10 to-transparent px-4 py-3">
          <p className="text-sm text-white/85 flex items-center gap-2">
            <Sparkles size={14} className="text-spotify-green shrink-0" />
            Build a playlist shell now, then connect tracks and destination route in the next step.
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
              onClick={() => setVisibility("public")}
              className={`rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-center gap-2 justify-center ${
                visibility === "public"
                  ? "border-spotify-green bg-spotify-green/20 text-spotify-green"
                  : "border-white/15 bg-white/[0.07] text-white/75 hover:text-white"
              }`}
            >
              <Globe size={14} /> Public
            </button>
            <button
              type="button"
              onClick={() => setVisibility("private")}
              className={`rounded-xl border px-3 py-2.5 text-sm transition-colors flex items-center gap-2 justify-center ${
                visibility === "private"
                  ? "border-spotify-green bg-spotify-green/20 text-spotify-green"
                  : "border-white/15 bg-white/[0.07] text-white/75 hover:text-white"
              }`}
            >
              <Lock size={14} /> Private
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/12 bg-black/25 px-3 py-2.5 text-xs text-white/60 flex items-center gap-2">
          <Music2 size={13} className="text-spotify-green" />
          This currently creates a local demo playlist shell. API creation will be connected next.
        </div>

        <div className="pt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white/75 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-spotify-green text-black hover:bg-spotify-green-hover transition-colors"
          >
            Create playlist
          </button>
        </div>
      </div>
    </Modal>
  );
};
