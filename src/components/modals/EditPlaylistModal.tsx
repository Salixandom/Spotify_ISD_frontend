import React from 'react';
import { Modal } from '../ui/Modal';
import type { Playlist } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playlist?: Playlist;
}

export const EditPlaylistModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit details">
      <p className="text-spotify-subtext text-sm">
        Edit playlist form — Role 2 implements this
      </p>
    </Modal>
  );
};
