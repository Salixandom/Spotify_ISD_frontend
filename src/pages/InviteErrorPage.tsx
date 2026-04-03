import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { InvalidInviteAnimation } from '../animations/InvalidInviteAnimation';

export const InviteErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900/20 to-black">
      <div className="max-w-md w-full mx-4 text-center px-6">
        {/* Animation */}
        <div className="mb-8">
          <InvalidInviteAnimation />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-3">
          Invalid Invite Link
        </h1>

        {/* Description */}
        <p className="text-white/70 text-base mb-2">
          This invite link is invalid or has expired.
        </p>

        <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto">
          Invite links expire after 24 hours for security. Please ask the playlist owner for a new link.
        </p>

        {/* Action Button */}
        <button
          onClick={() => navigate('/', { replace: true })}
          className="inline-flex items-center gap-2 px-6 py-3 bg-spotify-green text-black rounded-full font-semibold hover:bg-spotify-green/90 transition-all hover:scale-105 active:scale-95"
        >
          <Home size={18} />
          Go to Home
        </button>
      </div>
    </div>
  );
};
