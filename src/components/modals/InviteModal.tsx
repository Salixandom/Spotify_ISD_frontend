import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { collabAPI } from '../../api/collaboration';
import toast from 'react-hot-toast';
import { Users, UserPlus, Check, X, Loader2, Music, Clock } from 'lucide-react';
import type { InviteModalProps } from '../../types';

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  token,
  playlistName,
  inviterName,
  playlistId,
  isAlreadyCollaborator = false,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await collabAPI.join(token);
      toast.success('You are now a collaborator!');
      onClose();
      navigate(`/playlist/${playlistId}`, { replace: true });
    } catch (error) {
      console.error('Failed to join playlist:', error);
      toast.error('Failed to join playlist. The invite may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    onClose();
    navigate('/', { replace: true });
  };

  const handleGoToPlaylist = () => {
    onClose();
    navigate(`/playlist/${playlistId}`, { replace: true });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidthClassName="max-w-md"
      showHeader={false}
    >
      <div className="py-6">
        {isAlreadyCollaborator ? (
          <>
            {/* Already Collaborator State */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center">
                <Users size={28} className="text-blue-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white text-center mb-4">
              Already a Collaborator
            </h2>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-white/70 text-sm text-center">
                You're already a member of{' '}
                <span className="font-semibold text-blue-300">{playlistName}</span>
              </p>
            </div>

            <button
              onClick={handleGoToPlaylist}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-400 transition-colors disabled:opacity-50"
            >
              <Music size={18} />
              Go to Playlist
            </button>
          </>
        ) : (
          <>
            {/* New Invite State */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-spotify-green/20 to-green-500/20 border-2 border-spotify-green/40 flex items-center justify-center">
                  <UserPlus size={28} className="text-spotify-green" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Collaboration Invite</h2>
              <p className="text-white/70 text-sm">
                {inviterName ? (
                  <>{inviterName} invited you to collaborate on a playlist</>
                ) : (
                  <>You've been invited to collaborate on a playlist</>
                )}
              </p>
            </div>

            {/* Playlist Card */}
            <div className="bg-gradient-to-br from-spotify-green/5 to-green-500/5 border border-spotify-green/20 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Music size={20} className="text-spotify-green" />
                <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Playlist</p>
              </div>
              <p className="text-white font-bold text-2xl mb-3">{playlistName}</p>
              <div className="flex items-center gap-4 text-xs text-white/50">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>Collaborative</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>Active</span>
                </div>
              </div>
            </div>

            {/* What you can do */}
            <div className="mb-6">
              <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">You'll be able to</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <div className="w-5 h-5 rounded-full bg-spotify-green/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-spotify-green" />
                  </div>
                  <span>Add and remove tracks</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <div className="w-5 h-5 rounded-full bg-spotify-green/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-spotify-green" />
                  </div>
                  <span>Edit playlist details</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <div className="w-5 h-5 rounded-full bg-spotify-green/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-spotify-green" />
                  </div>
                  <span>Invite other collaborators</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="flex-1 px-5 py-3 rounded-full text-sm font-semibold text-white border border-white/20 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-spotify-green to-green-500 text-white rounded-full font-semibold hover:from-spotify-green/90 hover:to-green-500/90 transition-all shadow-lg shadow-spotify-green/25 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Accept</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
