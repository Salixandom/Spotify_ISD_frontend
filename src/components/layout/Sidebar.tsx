import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-spotify-black flex flex-col gap-2 p-2 shrink-0">
      {/* Main Nav */}
      <nav className="bg-spotify-surface rounded-lg p-4 flex flex-col gap-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-4 p-2 rounded-md font-semibold transition-colors
            ${isActive ? 'text-white' : 'text-spotify-subtext hover:text-white'}`
          }
        >
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex items-center gap-4 p-2 rounded-md font-semibold transition-colors
            ${isActive ? 'text-white' : 'text-spotify-subtext hover:text-white'}`
          }
        >
          <Search size={24} />
          <span>Search</span>
        </NavLink>
      </nav>

      {/* Library */}
      <div className="bg-spotify-surface rounded-lg p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 text-spotify-subtext mb-4">
          <Library size={24} />
          <span className="font-semibold">Your Library</span>
        </div>
        {/* Playlist list will be populated by Role 2 */}
        <div className="flex-1 overflow-y-auto text-spotify-subtext text-sm">
          <p>No playlists yet</p>
        </div>
      </div>
    </aside>
  );
};
