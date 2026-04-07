import React from 'react';

interface BackgroundArtProps {
  coverUrl: string;
  isActive: boolean;
}

const BackgroundArt: React.FC<BackgroundArtProps> = ({ coverUrl, isActive }) => {
  if (!coverUrl) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <img
        src={coverUrl}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(80px) brightness(0.4)',
          transform: 'scale(1.1)',
          opacity: isActive ? 1 : 0,
          transition: 'opacity 500ms ease-in-out',
        }}
      />
    </div>
  );
};

export default BackgroundArt;
