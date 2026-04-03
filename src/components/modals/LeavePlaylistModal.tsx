import React from "react";
import { Modal } from "../ui/Modal";
import { LogOut } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  playlistName: string;
}

export const LeavePlaylistModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  playlistName,
}) => {
  const [isLeaving, setIsLeaving] = React.useState(false);

  const handleConfirm = async () => {
    setIsLeaving(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setIsLeaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave playlist" maxWidthClassName="max-w-md">
      <div className="py-6">
        <div className="mb-6">
          <p className="text-white/80 text-sm">
            Are you sure you want to leave <span className="font-semibold text-white">"{playlistName}"</span>?
          </p>
          <p className="text-white/50 text-xs mt-2">
            You will lose access to this collaborative playlist.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isLeaving}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white/75 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLeaving}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLeaving ? (
              <>
                <span>Leaving...</span>
              </>
            ) : (
              <>
                <LogOut size={16} />
                <span>Leave</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
