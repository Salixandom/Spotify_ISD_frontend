import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-transparent">
      {/* Navigation arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center
                     text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center
                     text-white hover:bg-black/70 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* User menu */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/50 rounded-full py-1 px-3">
            <div className="w-6 h-6 rounded-full bg-spotify-green flex items-center
                            justify-center text-black">
              <User size={14} />
            </div>
            <span className="text-sm font-semibold text-white">{user.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-spotify-subtext hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
};
