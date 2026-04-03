import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collabAPI } from '../api/collaboration';
import { InviteErrorPage } from './InviteErrorPage';
import { ValidatingAnimation } from '../animations/ValidatingAnimation';
import { useAuthStore } from '../store/authStore';

export const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    const validateInvite = async () => {
      // FIRST: Check if user is logged in (check both Zustand auth store AND localStorage)
      const hasToken = localStorage.getItem('access_token');

      if (!isAuthenticated && !hasToken) {
        // Not logged in at all - redirect to login with redirect URL
        console.log('User not authenticated, redirecting to login');
        navigate(`/login?redirect=/invite/${token}`, { replace: true });
        return;
      }

      // If we have a token but authStore hasn't been initialized yet, proceed anyway
      if (!isAuthenticated && hasToken) {
        console.log('Token exists in localStorage, proceeding with validation');
      }

      // Artificial delay to show the validating animation (REMOVE IN PRODUCTION)
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        // THEN: Validate the token with backend (user is logged in)
        const result = await collabAPI.validateToken(token);
        console.log('Invite validation result:', result);

        // Get user from auth store (has the actual user object)
        const { user } = useAuthStore.getState();
        console.log('Current user:', user);

        // Check if user is already a collaborator
        // Note: Backend should return collaborators array in validation response
        // For now, we'll check if user_id matches any collaborator
        const isAlreadyCollaborator = user && (result as any).collaborators?.some((c: {user_id: number}) => c.user_id === user.id);

        if (isAlreadyCollaborator) {
          // Already a collaborator - redirect with status
          console.log('User is already a collaborator');
          navigate(`/?invite=${token}&status=already_collaborator`, { replace: true });
        } else {
          // New collaborator - redirect to home
          console.log('User is a new collaborator');
          navigate(`/?invite=${token}`, { replace: true });
        }
      } catch (error) {
        console.error('Invite validation failed:', error);
        setStatus('invalid');
      }
    };

    validateInvite();
  }, [token, navigate]);

  if (status === 'invalid') {
    return <InviteErrorPage />;
  }

  // Show loading state while validating
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900/40 to-black/80">
      <div className="text-center">
        <ValidatingAnimation />
        <p className="text-white/70 mt-6 text-lg">Validating invite...</p>
      </div>
    </div>
  );
};
