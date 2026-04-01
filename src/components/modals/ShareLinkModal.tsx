import React from "react";
import { Check, Copy, Link as LinkIcon } from "lucide-react";
import { Modal } from "../ui/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playlistName: string;
  shareLink: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRefreshLink?: () => void;
}

export const ShareLinkModal: React.FC<Props> = ({
  isOpen,
  onClose,
  playlistName,
  shareLink,
  isLoading = false,
  errorMessage,
  onRefreshLink,
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsCopied(false);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1400);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share playlist" maxWidthClassName="max-w-lg">
      <p className="text-white/80 text-sm mb-4">
        Anyone with this link can open <span className="text-white font-semibold">{playlistName}</span>.
      </p>

      <div className="rounded-xl border border-white/14 bg-white/[0.04] backdrop-blur-xl p-3 flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center text-white/75 shrink-0">
          <LinkIcon size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm truncate">{shareLink || "Generating link..."}</p>
        </div>
      </div>

      {errorMessage && (
        <p className="mt-3 text-xs text-amber-300">
          {errorMessage}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end gap-2">
        {onRefreshLink && (
          <button
            onClick={onRefreshLink}
            disabled={isLoading}
            className="px-3 py-2 text-sm text-white/75 hover:text-white disabled:opacity-60"
          >
            Refresh link
          </button>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-white/80 hover:text-white"
        >
          Close
        </button>
        <button
          onClick={handleCopy}
          disabled={isLoading || !shareLink}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-spotify-green text-black text-sm font-semibold hover:bg-spotify-green-hover disabled:opacity-60"
        >
          {isCopied ? <Check size={15} /> : <Copy size={15} />}
          {isCopied ? "Copied" : isLoading ? "Generating..." : "Copy link"}
        </button>
      </div>
    </Modal>
  );
};
