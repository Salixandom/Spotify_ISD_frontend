import React from 'react';
import { Modal } from '../ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePlaylistModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const handleClose = () => {
    onClose();
    // Call onSuccess if provided (for when form is implemented)
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create playlist">
      <div className="space-y-4">
        <p className="text-spotify-subtext text-sm">
          Playlist creation form — Role 2 implements this
        </p>
        <div className="p-4 bg-spotify-elevated rounded-lg text-center">
          <p className="text-spotify-subtext text-sm">
            🎵 Coming soon! This feature will be implemented by Role 2
          </p>
        </div>
      </div>
    </Modal>
  );
};
