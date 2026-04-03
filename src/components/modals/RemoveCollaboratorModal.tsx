import React from "react";
import { Modal } from "../ui/Modal";
import { UserMinus } from "lucide-react";
import type { Collaborator } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  collaborator: Collaborator;
  userMap: Map<number, { username: string; display_name?: string }>;
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
    return userInfo?.username || userInfo?.display_name || 'Unknown User';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove collaborator" maxWidthClassName="max-w-md">
      <div className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-blue-500 flex items-center justify-center text-white text-xl font-bold">
            {getUsername().charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white text-lg font-medium">{getUsername()}</p>
            <p className="text-white/50 text-sm">Collaborator</p>
          </div>
        </div>

        <p className="text-white/80 text-sm mb-6">
          Are you sure you want to remove <span className="font-semibold text-white">{getUsername()}</span> from this playlist?
          They will lose access to this collaborative playlist.
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isRemoving}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white/75 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isRemoving}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isRemoving ? (
              <>
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
