import React, { useState, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { collabAPI } from '../../api/collaboration';
import toast from 'react-hot-toast';
import { Copy, Check, Users, Lock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playlistId: number;
  playlistName: string;
  isPublic?: boolean;
}

export const ShareLinkModal: React.FC<Props> = ({
  isOpen,
  onClose,
  playlistId,
  playlistName,
  isPublic = true
}) => {
  const [link, setLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Generate link when modal opens
  React.useEffect(() => {
    if (isOpen && playlistId) {
      setIsLoading(true);
      setCopied(false);
      setError('');

      collabAPI
        .createShareLink(playlistId)
        .then((shareData) => {
          // Use the share_url returned from backend
          setLink(shareData.share_url);
        })
        .catch((err) => {
          console.error('Failed to generate share link:', err);
          const errorMsg = err.response?.data?.message || 'Failed to generate share link';
          setError(errorMsg);
          toast.error(errorMsg);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Share this playlist">
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-spotify-green/20 flex items-center justify-center">
            {isPublic ? (
              <Users size={24} className="text-spotify-green" />
            ) : (
              <Lock size={24} className="text-orange-500" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">{playlistName}</h3>
            <p className="text-white/60 text-sm">
              {isPublic
                ? 'Public playlist - anyone with the link can view'
                : 'Private playlist - only collaborators can access'}
            </p>
          </div>
        </div>

        {!isPublic ? (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <p className="text-orange-300 text-sm">
              <strong>Private Playlist:</strong> Make it public to generate a share link, or use an invite link to add collaborators.
            </p>
          </div>
        ) : (
          <>
            <p className="text-white/80 text-sm">
              Share this link with others. Anyone with the link can view and follow this playlist, but won't be able to add songs or make changes.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-white/20 border-t-spotify-green rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
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
                    <p>Anyone with the link can view and follow this playlist.</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-white/60">
                    <span className="text-spotify-green">ℹ</span>
                    <p>They won't be able to add songs or make changes to the playlist.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-white/60 text-sm">
                Failed to generate share link
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
