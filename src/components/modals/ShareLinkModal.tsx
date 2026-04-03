<<<<<<< HEAD
import React from "react";
import { Check, Copy, Link as LinkIcon } from "lucide-react";
import { Modal } from "../ui/Modal";
=======
import React, { useState, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { collabAPI } from '../../api/collaboration';
import toast from 'react-hot-toast';
import { Copy, Check } from 'lucide-react';
>>>>>>> origin/main

interface Props {
  isOpen: boolean;
  onClose: () => void;
<<<<<<< HEAD
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
=======
  playlistId: number;
}

export const ShareLinkModal: React.FC<Props> = ({ isOpen, onClose, playlistId }) => {
  const [link, setLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generate link when modal opens
  React.useEffect(() => {
    if (isOpen && playlistId) {
      setIsLoading(true);
      setCopied(false);

      collabAPI
        .createShareLink(playlistId)
        .then((shareData) => {
          const shareUrl = `${window.location.origin}/share/${shareData.token}`;
          setLink(shareUrl);
        })
        .catch((error) => {
          console.error('Failed to generate share link:', error);
          toast.error('Failed to generate share link');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, playlistId]);

  const handleCopy = useCallback(async () => {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Link copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  }, [link]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share playlist">
      <div className="space-y-4">
        <p className="text-white/80 text-sm">
          Share this playlist with anyone using this link. Anyone with the link can view and follow this playlist.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-white/20 border-t-spotify-green rounded-full animate-spin" />
          </div>
        ) : link ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
              <input
                type="text"
                value={link}
                readOnly
                className="flex-1 bg-transparent text-white/90 text-sm outline-none"
                onClick={(e) => e.currentTarget.select()}
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-spotify-green text-black rounded-full font-semibold text-sm hover:bg-spotify-green/90 transition-colors"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex items-start gap-2 text-xs text-white/60">
              <span className="text-spotify-green">ℹ</span>
              <p>Anyone with this link can view this playlist. They can choose to follow it to add it to their library.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-white/60 text-sm">
            Failed to generate share link
          </div>
        )}
>>>>>>> origin/main
      </div>
    </Modal>
  );
};
