import React, { useState, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { collabAPI } from '../../api/collaboration';
import toast from 'react-hot-toast';
import { Copy, Check, Users } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playlistId: number;
}

export const CollabInviteModal: React.FC<Props> = ({ isOpen, onClose, playlistId }) => {
  const [link, setLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generate invite link when modal opens
  React.useEffect(() => {
    if (isOpen && playlistId) {
      setIsLoading(true);
      setCopied(false);

      collabAPI
        .generateInvite(playlistId)
        .then((inviteData) => {
          const inviteUrl = `${window.location.origin}/invite/${inviteData.token}`;
          setLink(inviteUrl);
        })
        .catch((error) => {
          console.error('Failed to generate invite link:', error);
          toast.error('Failed to generate invite link');
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
      toast.success('Invite link copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  }, [link]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite collaborators">
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-spotify-green/20 flex items-center justify-center">
            <Users size={24} className="text-spotify-green" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Collaborative Playlist</h3>
            <p className="text-white/60 text-sm">Invite others to contribute to this playlist</p>
          </div>
        </div>

        <p className="text-white/80 text-sm">
          Share this invite link with others. Anyone with the link can join as a collaborator and add, remove, or reorder tracks.
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

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-white/60">
                <span className="text-spotify-green">ℹ</span>
                <p>Collaborators can add, remove, and reorder tracks in this playlist.</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-white/60">
                <span className="text-spotify-green">ℹ</span>
                <p>This invite link will expire after 24 hours for security.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-white/60 text-sm">
            Failed to generate invite link
          </div>
        )}
      </div>
    </Modal>
  );
};
