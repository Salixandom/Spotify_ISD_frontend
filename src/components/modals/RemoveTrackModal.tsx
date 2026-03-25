import React from 'react';
import { Modal } from '../ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trackTitle?: string;
}

export const RemoveTrackModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  trackTitle,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove from playlist">
      <p className="text-spotify-subtext mb-6">
        Remove <span className="text-white font-semibold">{trackTitle}</span>
        {' '}from this playlist?
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-white hover:text-spotify-subtext"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 text-sm font-semibold bg-spotify-green
                     text-black rounded-full hover:bg-spotify-green-hover"
        >
          Remove
        </button>
      </div>
    </Modal>
  );
};
