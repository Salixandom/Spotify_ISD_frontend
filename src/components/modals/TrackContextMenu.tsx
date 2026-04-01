import React from "react";
import ReactDOM from "react-dom";
import {
  Music2,
  Plus,
  PlusCircle,
  Trash2,
  Mic2,
  ExternalLink,
  Heart,
  ChevronRight,
  Search as SearchIcon,
  Check,
} from "lucide-react";
import type { PlaylistTrack } from "../../types";
import { getArtistName } from "../../utils/trackHelpers";

interface PlaylistOption {
  id: string;
  name: string;
}

interface TrackContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  track: PlaylistTrack | null;
  onAddToPlaylist: (track: PlaylistTrack, playlistId?: string) => void;
  onRemoveFromPlaylist?: (track: PlaylistTrack) => void;
  onToggleLike: (track: PlaylistTrack) => void;
  isLiked: boolean;
  position: { x: number; y: number };
  menuRef?: React.RefObject<HTMLDivElement | null>;
  playlists?: PlaylistOption[];
  currentPlaylistId?: string;
  onGoToArtist?: (artistName: string) => void;
}

export const TrackContextMenu: React.FC<TrackContextMenuProps> = ({
  isOpen,
  onClose,
  track,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onToggleLike,
  isLiked,
  position,
  menuRef,
  playlists = [],
  currentPlaylistId,
  onGoToArtist,
}) => {
  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = React.useState(false);
  const [showArtistSubmenu, setShowArtistSubmenu] = React.useState(false);
  const [playlistSubmenuPos, setPlaylistSubmenuPos] = React.useState({ top: 0, left: 0 });
  const [artistSubmenuPos, setArtistSubmenuPos] = React.useState({ top: 0, left: 0 });
  const [playlistSearch, setPlaylistSearch] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) {
      setShowPlaylistSubmenu(false);
      setShowArtistSubmenu(false);
      setPlaylistSearch("");
    }
  }, [isOpen]);

  const closeAllSubmenus = React.useCallback(() => {
    setShowPlaylistSubmenu(false);
    setShowArtistSubmenu(false);
  }, []);

  if (!isOpen || !track) return null;

  // Extract individual artist names for the submenu
  const artists: string[] = (() => {
    const artist = track.song.artist;
    if (typeof artist === "string") {
      return artist.split(",").map((a) => a.trim()).filter(Boolean);
    }
    if (artist && typeof artist === "object") {
      const name = (artist as Record<string, unknown>).name;
      if (typeof name === "string") return [name];
    }
    return [];
  })();

  const menuWidth = 224; // w-56
  const menuX = Math.max(10, Math.min(position.x, window.innerWidth - menuWidth - 10));
  const menuY = Math.max(10, Math.min(position.y, window.innerHeight - 420));

  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(playlistSearch.toLowerCase())
  );

  return ReactDOM.createPortal(
    <>
      {/* Main menu */}
      <div
        ref={(el) => {
          if (menuRef) (menuRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        style={{ top: menuY, left: menuX }}
        className="fixed z-[9999] w-56 py-1 bg-white/5 backdrop-blur-xl rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.50)] border border-white/15 animate-in fade-in zoom-in-95 duration-100"
        onMouseDown={(e) => e.stopPropagation()}
        onMouseLeave={closeAllSubmenus}
      >
        {/* Track header */}
        <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center gap-3">
          <img
            src={track.song.cover_url}
            alt={track.song.title}
            className="w-10 h-10 rounded shadow-lg object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate">{track.song.title}</p>
            <p className="text-white/60 text-xs truncate">{getArtistName(track.song.artist)}</p>
          </div>
        </div>

        {/* Add to playlist */}
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
          onMouseEnter={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setPlaylistSubmenuPos({ top: rect.top, left: rect.right + 4 });
            setPlaylistSearch("");
            setShowPlaylistSubmenu(true);
            setShowArtistSubmenu(false);
          }}
        >
          <Plus size={16} className="text-white/60 shrink-0" />
          <span className="flex-1">Add to playlist</span>
          <ChevronRight size={14} className="text-white/40" />
        </button>

        {/* Remove from this playlist */}
        {onRemoveFromPlaylist && (
          <button
            onClick={() => { onRemoveFromPlaylist(track); onClose(); }}
            onMouseEnter={closeAllSubmenus}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
          >
            <Trash2 size={16} className="text-white/60 shrink-0" />
            <span>Remove from this playlist</span>
          </button>
        )}

        {/* Save / Remove from Liked Songs */}
        <button
          onClick={() => { onToggleLike(track); onClose(); }}
          onMouseEnter={closeAllSubmenus}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
        >
          {isLiked ? (
            <Heart size={16} fill="#1db954" stroke="#1db954" />
          ) : (
            <PlusCircle size={16} className="text-white/60 shrink-0" />
          )}
          <span>{isLiked ? "Remove from Liked Songs" : "Save to your Liked Songs"}</span>
        </button>

        <div className="h-px bg-white/10 my-1" />

        {/* Go to artist */}
        {artists.length > 0 && (
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
            onMouseEnter={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setArtistSubmenuPos({ top: rect.top, left: rect.right + 4 });
              setShowArtistSubmenu(true);
              setShowPlaylistSubmenu(false);
            }}
          >
            <Mic2 size={16} className="text-white/60 shrink-0" />
            <span className="flex-1">Go to artist</span>
            <ChevronRight size={14} className="text-white/40" />
          </button>
        )}

        {/* Go to album */}
        <button
          onMouseEnter={closeAllSubmenus}
          onClick={onClose}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
        >
          <Music2 size={16} className="text-white/60 shrink-0" />
          <span>Go to album</span>
        </button>

        <div className="h-px bg-white/10 my-1" />

        {/* Open in Desktop app */}
        <button
          onMouseEnter={closeAllSubmenus}
          onClick={onClose}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
        >
          <ExternalLink size={16} className="text-white/60 shrink-0" />
          <span>Open in Desktop app</span>
        </button>
      </div>

      {/* Add to playlist submenu */}
      {showPlaylistSubmenu && (
        <div
          className="fixed z-[9999999] w-64 py-2 bg-white/5 backdrop-blur-xl rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.50)] border border-white/15 animate-in fade-in slide-in-from-left-1 duration-150"
          style={{ top: playlistSubmenuPos.top, left: playlistSubmenuPos.left }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={() => setShowPlaylistSubmenu(true)}
        >
          <div className="px-2 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/15 rounded-lg">
              <SearchIcon size={14} className="text-white/50 shrink-0" />
              <input
                type="text"
                value={playlistSearch}
                onChange={(e) => setPlaylistSearch(e.target.value)}
                placeholder="Find a playlist"
                autoFocus
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="mx-3 mb-1 border-t border-white/10" />

          <button
            onClick={() => { onAddToPlaylist(track); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
          >
            <span className="w-6 h-6 rounded-sm bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <Plus size={14} />
            </span>
            New playlist
          </button>

          <div className="mx-3 my-1 border-t border-white/10" />

          <div className="max-h-48 overflow-y-auto">
            {filteredPlaylists.slice(0, 10).map((playlist) => {
              const isCurrent = playlist.id === currentPlaylistId;
              return (
                <button
                  key={playlist.id}
                  onClick={() => {
                    if (!isCurrent) {
                      onAddToPlaylist(track, playlist.id);
                      onClose();
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left ${
                    isCurrent
                      ? "text-white/40 cursor-default"
                      : "text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                  }`}
                >
                  <span className="truncate flex-1">{playlist.name}</span>
                  {isCurrent && <Check size={14} className="text-spotify-green shrink-0 ml-2" />}
                </button>
              );
            })}
            {filteredPlaylists.length === 0 && (
              <div className="px-3 py-3 text-sm text-white/40 text-center">
                No playlists found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Go to artist submenu */}
      {showArtistSubmenu && artists.length > 0 && (
        <div
          className="fixed z-[9999999] w-52 py-1 bg-white/5 backdrop-blur-xl rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.50)] border border-white/15 animate-in fade-in slide-in-from-left-1 duration-150"
          style={{ top: artistSubmenuPos.top, left: artistSubmenuPos.left }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={() => setShowArtistSubmenu(true)}
        >
          {artists.map((artist, i) => (
            <button
              key={i}
              onClick={() => {
                if (onGoToArtist) {
                  onGoToArtist(artist);
                }
                onClose();
              }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
            >
              {artist}
            </button>
          ))}
        </div>
      )}
    </>,
    document.body
  );
};
