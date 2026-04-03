import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Music2, Pencil, Check } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  initialName: string;
  initialDescription: string;
  initialCoverUrl?: string;
  onSave: (name: string, description: string, coverUrl?: string) => Promise<void>;
}

export const EditPlaylistModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialName,
  initialDescription,
  initialCoverUrl,
  onSave,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCoverUrlModalOpen, setIsCoverUrlModalOpen] = useState(false);
  const [tempCoverUrl, setTempCoverUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setCoverUrl(initialCoverUrl);
      setError(null);
    }
  }, [isOpen, initialName, initialDescription, initialCoverUrl]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Playlist name is required");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(name, description, coverUrl);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save playlist details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverUrlSave = () => {
    setCoverUrl(tempCoverUrl);
    setIsCoverUrlModalOpen(false);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit details" maxWidthClassName="max-w-md">
        <div className="flex gap-4 mt-4">
          <div
            onClick={() => {
              setTempCoverUrl(coverUrl || "");
              setIsCoverUrlModalOpen(true);
            }}
            className="w-32 h-32 shrink-0 bg-white/5 rounded-md border border-white/10 flex items-center justify-center shadow-md overflow-hidden group relative cursor-pointer"
          >
            {coverUrl ? (
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <Music2 size={40} className="text-white/40" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
              <Pencil size={24} className="text-white" />
              <span className="text-xs text-white mt-2 font-medium">Choose photo</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add a name"
              className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional description"
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder:white/50 focus:outline-none focus:border-white/40 transition-colors resize-none"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-white text-black font-semibold text-sm rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>

      {/* Cover URL Modal */}
      <Modal
        isOpen={isCoverUrlModalOpen}
        onClose={() => setIsCoverUrlModalOpen(false)}
        title="Choose cover photo"
        maxWidthClassName="max-w-md"
      >
        <div className="mt-4">
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
            <input
              type="text"
              value={tempCoverUrl}
              onChange={(e) => setTempCoverUrl(e.target.value)}
              placeholder="Paste an image URL or leave blank to remove"
              className="flex-1 bg-transparent text-white/90 text-sm outline-none placeholder:text-white/50"
              autoFocus
            />
            <button
              onClick={handleCoverUrlSave}
              className="flex items-center gap-2 px-4 py-2 bg-spotify-green text-black rounded-full font-semibold text-sm hover:bg-spotify-green/90 transition-colors"
            >
              <Check size={18} />
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
