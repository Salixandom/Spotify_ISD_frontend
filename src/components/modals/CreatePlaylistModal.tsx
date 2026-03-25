import React from 'react';
import { Modal } from '../ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlaylistModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create playlist">
      <p className="text-spotify-subtext text-sm">
        Playlist creation form — Role 2 implements this
      </p>
    </Modal>
  );
};
