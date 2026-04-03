import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Crown } from "lucide-react";
import type { Collaborator } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newOwnerId: number, stayAsCollaborator: boolean) => Promise<void>;
  collaborators: Collaborator[];
  currentOwnerId: number;
  userMap: Map<number, { username: string; display_name?: string }>;
}

export const TransferOwnershipModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  collaborators,
  currentOwnerId,
  userMap,
}) => {
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const [stayAsCollaborator, setStayAsCollaborator] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);

  // Filter out current owner from the list
  const potentialOwners = collaborators.filter(c => c.user_id !== currentOwnerId);

  const handleConfirm = async () => {
    if (!selectedOwnerId) return;

    setIsTransferring(true);
    try {
      await onConfirm(selectedOwnerId, stayAsCollaborator);
      onClose();
      // Reset form
      setSelectedOwnerId(null);
      setStayAsCollaborator(true);
    } catch {
      setIsTransferring(false);
    }
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedOwnerId(null);
      setStayAsCollaborator(true);
    }
  }, [isOpen]);

  const getUsername = (userId: number) => {
    const userInfo = userMap.get(userId);
    return userInfo?.username || userInfo?.display_name || 'Unknown User';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer ownership" maxWidthClassName="max-w-md">
      <div className="py-6 space-y-5">
        {/* Select new owner */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2 block">
            Select new owner
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {potentialOwners.map((collaborator) => (
              <button
                key={collaborator.id}
                onClick={() => setSelectedOwnerId(collaborator.user_id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                  selectedOwnerId === collaborator.user_id
                    ? 'border-spotify-green bg-spotify-green/10'
                    : 'border-white/15 bg-white/[0.03] hover:border-white/30'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {getUsername(collaborator.user_id).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{getUsername(collaborator.user_id)}</p>
                  <p className="text-xs text-white/50">Collaborator</p>
                </div>
                {selectedOwnerId === collaborator.user_id && (
                  <Crown size={18} className="text-spotify-green" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stay as collaborator option */}
        {selectedOwnerId && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2 block">
              After transferring ownership
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setStayAsCollaborator(true)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  stayAsCollaborator
                    ? 'border-spotify-green bg-spotify-green/10'
                    : 'border-white/15 bg-white/[0.03] hover:border-white/30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  stayAsCollaborator ? 'border-spotify-green' : 'border-white/30'
                }`}>
                  {stayAsCollaborator && (
                    <div className="w-2.5 h-2.5 rounded-full bg-spotify-green" />
                  )}
                </div>
                <span className="text-white">Stay as a collaborator</span>
              </button>
              <button
                onClick={() => setStayAsCollaborator(false)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  !stayAsCollaborator
                    ? 'border-spotify-green bg-spotify-green/10'
                    : 'border-white/15 bg-white/[0.03] hover:border-white/30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  !stayAsCollaborator ? 'border-spotify-green' : 'border-white/30'
                }`}>
                  {!stayAsCollaborator && (
                    <div className="w-2.5 h-2.5 rounded-full bg-spotify-green" />
                  )}
                </div>
                <span className="text-white">Leave completely</span>
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={isTransferring}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white/75 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedOwnerId || isTransferring}
            className="px-5 py-2 rounded-full text-sm font-semibold bg-spotify-green text-black hover:bg-spotify-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTransferring ? (
              <>
                <span>Transferring...</span>
              </>
            ) : (
              <>
                <Crown size={16} />
                <span>Transfer & Leave</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
