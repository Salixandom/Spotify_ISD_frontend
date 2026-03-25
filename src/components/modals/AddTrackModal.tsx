import React from 'react';
import { Modal } from '../ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playlistId?: number;
}

export const AddTrackModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to this playlist">
      <p className="text-spotify-subtext text-sm">
        Search and add songs — Role 4 implements this
      </p>
    </Modal>
  );
};
