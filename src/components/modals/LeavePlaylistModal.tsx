import React from "react";
import { Modal } from "../ui/Modal";
import { LogOut, AlertTriangle } from "lucide-react";

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
      // Only close if onConfirm succeeds (it should navigate away)
      // onClose will be called by the parent after navigation
    } catch (error) {
      setIsLeaving(false);
      // Let the parent handle the error display
      console.error('Leave playlist failed:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidthClassName="max-w-md" showHeader={false}>
      <div className="py-8 px-2">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-3">
          Leave Collaborative Playlist
        </h2>

        {/* Message */}
        <div className="text-center mb-8 space-y-2">
          <p className="text-white/80 text-base">
            Are you sure you want to leave <span className="font-semibold text-white">"{playlistName}"</span>?
          </p>
          <p className="text-white/50 text-sm">
            You'll lose access to this playlist and won't be able to contribute unless re-invited.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            disabled={isLeaving}
            className="px-6 py-3 rounded-full text-sm font-semibold text-white hover:bg-white/5 transition-all border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLeaving}
            className="px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px] shadow-lg shadow-red-500/25"
          >
            {isLeaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
