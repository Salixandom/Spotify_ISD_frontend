import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Check } from 'lucide-react';
import { authAPI } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Client-side validation
  const validateForm = (): boolean => {
    let isValid = true;
    setUsernameError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setApiError(null);

    // Username validation
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      isValid = false;
    }

    // Password validation
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    // Clear previous errors
    setApiError(null);

    // Validate
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.register(username, password);
      // On success, navigate to login (do NOT auto-login)
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      const error = err as { response?: { status?: number; data?: { detail?: string } } };
      if (error.response?.status === 400) {
        setApiError('Username already taken. Please choose another.');
      } else if (error.response?.data?.detail) {
        setApiError(error.response.data.detail);
      } else {
        setApiError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spotify-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {/* Spotify Logo - Green Circle */}
            <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center shadow-2xl">
              <svg
                viewBox="0 0 24 24"
                fill="black"
                className="w-10 h-10"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.261 9.899-.599 13.561 1.74.42.24.6.899.3 1.32zm.12-3.36c-3.84-2.28-10.14-2.461-13.8-1.38-.54.18-1.14-.12-1.32-.66-.18-.54.12-1.14.66-1.32 4.2-1.26 11.16-1.02 15.54 1.62.48.3.6.96.3 1.44-.3.48-.96.6-1.44.3z" />
              </svg>
            </div>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Spotify</h1>
          <p className="text-spotify-subtext text-sm">Create your account</p>
        </div>

        {/* Register Form Card */}
        <div className="bg-spotify-surface rounded-xl p-8 shadow-2xl">
          <div className="space-y-4">
            {/* Username Input */}
            <Input
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
              error={usernameError}
              autoComplete="username"
              icon={<User size={18} className="text-spotify-subtext" />}
              disabled={isLoading}
            />

            {/* Password Input */}
            <Input
              label="Password"
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              error={passwordError}
              autoComplete="new-password"
              icon={<Lock size={18} className="text-spotify-subtext" />}
              disabled={isLoading}
            />

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError(null);
              }}
              error={confirmPasswordError}
              autoComplete="new-password"
              icon={<Lock size={18} className="text-spotify-subtext" />}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRegister();
                }
              }}
            />

            {/* API Error Message */}
            {apiError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span className="text-sm text-red-500">{apiError}</span>
              </div>
            )}

            {/* Register Button */}
            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full py-3 text-base"
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Button>
          </div>

          {/* Log In Link */}
          <div className="mt-6 text-center">
            <p className="text-spotify-subtext text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-spotify-green hover:text-spotify-green-hover font-semibold underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>

        {/* Password Requirements Info */}
        <div className="mt-6 bg-spotify-surface/50 rounded-lg p-4">
          <h3 className="text-white text-sm font-semibold mb-2">Password requirements:</h3>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 text-xs text-spotify-subtext">
              <Check size={14} className={password.length >= 6 ? 'text-spotify-green' : 'text-spotify-border'} />
              At least 6 characters
            </li>
            <li className="flex items-center gap-2 text-xs text-spotify-subtext">
              <Check size={14} className={password === confirmPassword && password.length > 0 ? 'text-spotify-green' : 'text-spotify-border'} />
              Passwords match
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-spotify-subtext text-xs">
            By signing up, you agree to Spotify's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};
