import React from "react";
import { Modal } from "../ui/Modal";
import { UserMinus, AlertCircle } from "lucide-react";
import type { Collaborator } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  collaborator: Collaborator;
  userMap: Map<number, { username: string; display_name?: string; avatar_url?: string }>;
}

export const RemoveCollaboratorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  collaborator,
  userMap,
}) => {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleConfirm = async () => {
    setIsRemoving(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setIsRemoving(false);
    }
  };

  const getUsername = () => {
    const userInfo = userMap.get(collaborator.user_id);
    return userInfo?.display_name || userInfo?.username || collaborator.display_name || collaborator.username || 'Unknown User';
  };

  const getAvatarUrl = () => {
    const userInfo = userMap.get(collaborator.user_id);
    return userInfo?.avatar_url;
  };

  const getInitials = () => {
    const name = getUsername();
    if (name === 'You') return 'Y';
    if (name.startsWith('User')) return name.replace('User', '');
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove collaborator" maxWidthClassName="max-w-md" showHeader={true}>
      <div className="py-6">
        {/* User Profile Section */}
        <div className="flex items-center gap-4 mb-6">
          {getAvatarUrl() ? (
            <img
              src={getAvatarUrl()}
              alt={getUsername()}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-blue-500 flex items-center justify-center text-white text-xl font-bold">
              {getInitials()}
            </div>
          )}
          <div>
            <p className="text-white text-lg font-medium">{getUsername()}</p>
            <p className="text-white/50 text-sm">Collaborator</p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-white/90 text-sm leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-white">{getUsername()}</span> from this collaborative playlist?
              </p>
              <p className="text-white/60 text-xs mt-2">
                They will immediately lose access and won't be able to view or edit this playlist.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isRemoving}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:bg-white/5 transition-all border border-white/20 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isRemoving}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/25 min-w-[140px] justify-center"
          >
            {isRemoving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <UserMinus size={16} />
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
