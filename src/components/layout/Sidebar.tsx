import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Music, Users, Plus } from 'lucide-react';
import { playlistAPI } from '../../api/playlists';
import type { Playlist } from '../../types';
import { TrackRowSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { CreatePlaylistModal } from '../modals/CreatePlaylistModal';

export const Sidebar: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch playlists on mount
  const fetchPlaylists = async () => {
    setIsLoading(true);
    try {
      const data = await playlistAPI.list();
      setPlaylists(data);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Refresh playlists (called after modal creates a new playlist)
  const refreshPlaylists = () => {
    fetchPlaylists();
  };

  return (
    <>
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
          {/* Header with "+" button */}
          <div className="flex items-center justify-between text-spotify-subtext mb-4">
            <div className="flex items-center gap-2">
              <Library size={24} />
              <span className="font-semibold">Your Library</span>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-spotify-subtext hover:text-white transition-colors p-1 rounded-md hover:bg-spotify-elevated"
              aria-label="Create playlist"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Playlist List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              // Skeleton loading state
              <>
                <TrackRowSkeleton />
                <TrackRowSkeleton />
                <TrackRowSkeleton />
              </>
            ) : playlists.length === 0 ? (
              // Empty state
              <EmptyState
                title="No playlists yet"
                description="Create your first playlist to get started"
                icon={<Music size={48} />}
              />
            ) : (
              // Playlist list
              <div className="space-y-1">
                {playlists.map((playlist) => (
                  <NavLink
                    key={playlist.id}
                    to={`/playlist/${playlist.id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-2 rounded-md transition-colors
                      ${isActive ? 'bg-spotify-elevated text-white' : 'text-spotify-subtext hover:text-white hover:bg-spotify-elevated/50'}`
                    }
                  >
                    {/* Type icon */}
                    {playlist.playlist_type === 'collaborative' ? (
                      <Users size={18} className="shrink-0" />
                    ) : (
                      <Music size={18} className="shrink-0" />
                    )}

                    {/* Playlist name */}
                    <span className="truncate flex-1 text-sm font-medium">
                      {playlist.name}
                    </span>

                    {/* Visibility indicator */}
                    {playlist.visibility === 'private' && (
                      <span className="text-xs opacity-60">🔒</span>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Create Playlist Modal (placeholder) */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshPlaylists}
      />
    </>
  );
};
