import React from 'react';
import { Modal } from '../ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  playlistId?: number;
}

export const CollabInviteModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite collaborators">
      <p className="text-spotify-subtext text-sm">
        Collab invite — Role 5 implements this
      </p>
    </Modal>
  );
};
