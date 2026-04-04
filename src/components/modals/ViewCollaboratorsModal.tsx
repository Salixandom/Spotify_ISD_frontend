import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Users, Star, Loader2 } from "lucide-react";
import { collabAPI } from "../../api/collaboration";
import type { Collaborator } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playlistId: number;
  userRole: 'owner' | 'collaborator' | null;
  currentUserId: number;
  onRemoveClick: (collaborator: Collaborator) => void;
  onLeaveClick: () => void;
  userMap: Map<number, { username: string; display_name?: string }>;
}

export const ViewCollaboratorsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  playlistId,
  userRole,
  currentUserId,
  onRemoveClick,
  onLeaveClick,
  userMap,
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [isOpen, playlistId]);

  const fetchCollaborators = async () => {
    setLoading(true);
    setError(null);
    try {
      const members = await collabAPI.getMembers(playlistId);
      setCollaborators(members);
    } catch {
      setError("Failed to load collaborators");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getUsername = (collaborator: Collaborator) => {
    const userInfo = userMap.get(collaborator.user_id);
    return userInfo?.username || userInfo?.display_name || collaborator.username || collaborator.display_name || 'Unknown User';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="View collaborators" maxWidthClassName="max-w-md">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-spotify-green" size={32} />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={fetchCollaborators}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-spotify-green text-black hover:bg-spotify-green-hover transition-colors"
          >
            Retry
          </button>
        </div>
      ) : collaborators.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No collaborators yet</p>
        </div>
      ) : (
        <div className="space-y-3 py-4">
          {collaborators.map((collaborator) => {
            const isOwner = userRole === 'owner' && collaborator.user_id === currentUserId;
            const isCurrentUser = collaborator.user_id === currentUserId;

            return (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 ${
                      isOwner
                        ? 'border-purple-500 bg-gradient-to-br from-purple-500 to-pink-500'
                        : 'border-blue-500 bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}
                  >
                    {getUsername(collaborator).charAt(0).toUpperCase()}
                  </div>

                  {/* User info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {getUsername(collaborator)}
                      </span>
                      {isCurrentUser && (
                        <Star size={14} className="text-spotify-green fill-spotify-green" />
                      )}
                    </div>
                    <div className="text-xs text-white/50">
                      {isOwner ? 'Owner' : 'Collaborator'} • Joined {formatDate(collaborator.joined_at)}
                    </div>
                  </div>
                </div>

                {/* Remove button - only for owner, not for self */}
                {userRole === 'owner' && !isCurrentUser && (
                  <button
                    onClick={() => onRemoveClick(collaborator)}
                    className="px-2 py-1 rounded-full text-xs font-semibold border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Leave button - only for collaborators */}
      {userRole === 'collaborator' && !loading && !error && collaborators.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={onLeaveClick}
            className="w-full px-5 py-2.5 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Leave playlist
          </button>
        </div>
      )}
    </Modal>
  );
};
