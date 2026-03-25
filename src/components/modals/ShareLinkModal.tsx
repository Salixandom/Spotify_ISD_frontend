import React from 'react';
import { Modal } from '../ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playlistId?: number;
}

export const ShareLinkModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share">
      <p className="text-spotify-subtext text-sm">
        Share link panel — Role 5 implements this
      </p>
    </Modal>
  );
};
