import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collabAPI } from '../api/collaboration';
import { useAuthStore } from '../store/authStore';

export const SharedPlaylistPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    // Check authentication first - similar to InvitePage
    const hasToken = localStorage.getItem('access_token');

    if (!isAuthenticated && !hasToken) {
      // Not logged in - redirect to login with redirect URL
      console.log('User not authenticated, redirecting to login');
      navigate(`/login?redirect=/share/${token}`, { replace: true });
      return;
    }

    // If we have a token but authStore hasn't been initialized yet, proceed anyway
    if (!isAuthenticated && hasToken) {
      console.log('Token exists in localStorage, proceeding with validation');
    }

    const validateShareLink = async () => {
      try {
        const result = await collabAPI.validateShareToken(token);
        setStatus('valid');

        // Redirect to playlist page with shared mode
        setTimeout(() => {
          navigate(`/playlist/${result.playlist_id}?mode=shared&source=share_link`, {
            replace: true
          });
        }, 500);
      } catch (error) {
        console.error('Invalid share link:', error);
        setStatus('invalid');
      }
    };

    validateShareLink();
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading shared playlist...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <svg
              className="w-20 h-20 text-gray-600 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Invalid Share Link
          </h1>
          <p className="text-gray-400 mb-8">
            This share link is invalid, has expired, or the playlist may have been hidden.
            <br />
            <br />
            Please check the link or contact the person who shared it with you.
          </p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-all hover:scale-105"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};
