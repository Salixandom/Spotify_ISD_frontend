/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { createPortal } from "react-dom";
import {
    Heart,
    Ban,
    Radio,
    Mic2,
    Disc3,
    FileText,
    Share2,
    Monitor,
    ListPlus,
    ChevronRight,
    Plus,
    Search as SearchIcon,
    Loader2,
    Check,
} from "lucide-react";

interface PlaylistOption {
    id: string;
    name: string;
}

interface ContextPosition {
    top: number;
    left: number;
}

interface Props {
    isOpen: boolean;
    contextPos: ContextPosition;
    artists: string[];
    playlists: PlaylistOption[];
    song?: any; // The current song being operated on
    songPlaylistIds?: Set<string>; // Which playlists this song is already in
    isLoadingMemberships?: boolean; // Loading state for fetching memberships
    onClose: () => void;
    onArtistSelect: (artist: string) => void;
    onAddToPlaylist?: (song: any, playlistId?: string) => void;
    onToggleLike?: (song: any) => void;
    isLiked?: boolean;
}

export const SearchTrackContextMenuModal: React.FC<Props> = ({
    isOpen,
    contextPos,
    artists,
    playlists,
    song,
    songPlaylistIds = new Set(),
    isLoadingMemberships = false,
    onClose,
    onArtistSelect,
    onAddToPlaylist,
    onToggleLike,
    isLiked = false,
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

    if (!isOpen) return null;

    return (
        <>
            {createPortal(
                <div
                    className="fixed z-[999999] w-56 py-1
                    bg-white/5 backdrop-blur-xl rounded-lg
                    shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                    border border-white/15
                    animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextPos.top, left: contextPos.left }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseLeave={closeAllSubmenus}
                >
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2
                        text-sm text-white/80 hover:text-white hover:bg-white/10
                        transition-colors text-left"
                        onMouseEnter={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setPlaylistSubmenuPos({ top: rect.top, left: rect.right + 4 });
                            setPlaylistSearch("");
                            setShowPlaylistSubmenu(true);
                            setShowArtistSubmenu(false);
                        }}
                    >
                        <ListPlus size={16} className="text-white/60 shrink-0" />
                        <span className="flex-1">Add to playlist</span>
                        <ChevronRight size={14} className="text-white/40" />
                    </button>

                    <div className="my-1 mx-3 border-t border-white/10" />

                    <button
                        onMouseEnter={closeAllSubmenus}
                        onClick={() => {
                            onToggleLike?.(song);
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm
                        text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                        {isLiked ? (
                            <Heart size={16} fill="#1db954" stroke="#1db954" />
                        ) : (
                            <Heart size={16} className="text-white/60 shrink-0" />
                        )}
                        <span className="flex-1">{isLiked ? "Remove from Liked Songs" : "Save to your Liked Songs"}</span>
                    </button>

                    <button
                        onMouseEnter={closeAllSubmenus}
                        onClick={onClose}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm
                        text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                        <Ban size={16} className="text-white/60 shrink-0" />
                        <span className="flex-1">Exclude from your taste profile</span>
                    </button>

                    <div className="my-1 mx-3 border-t border-white/10" />

                    <button
                        onMouseEnter={closeAllSubmenus}
                        onClick={onClose}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm
                        text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                        <Radio size={16} className="text-white/60 shrink-0" />
                        <span className="flex-1">Go to song radio</span>
                    </button>

                    {artists.length > 0 && (
                        <button
                            className="w-full flex items-center gap-3 px-3 py-2
                            text-sm text-white/80 hover:text-white hover:bg-white/10
                            transition-colors text-left"
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

                    {[
                        { icon: Disc3, label: "Go to album" },
                        { icon: FileText, label: "View credits" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onMouseEnter={closeAllSubmenus}
                            onClick={onClose}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm
                            text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                            <item.icon size={16} className="text-white/60 shrink-0" />
                            <span className="flex-1">{item.label}</span>
                        </button>
                    ))}

                    <div className="my-1 mx-3 border-t border-white/10" />

                    {[
                        { icon: Share2, label: "Share", hasArrow: true },
                        { icon: Monitor, label: "Open in Desktop app" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onMouseEnter={closeAllSubmenus}
                            onClick={onClose}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm
                            text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                            <item.icon size={16} className="text-white/60 shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {item.hasArrow && <ChevronRight size={14} className="text-white/40" />}
                        </button>
                    ))}
                </div>,
                document.body
            )}

            {showPlaylistSubmenu &&
                createPortal(
                    <div
                        className="fixed z-[9999999] w-64 py-2
                        bg-white/5 backdrop-blur-xl rounded-lg
                        shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                        border border-white/15
                        animate-in fade-in slide-in-from-left-1 duration-150"
                        style={{ top: playlistSubmenuPos.top, left: playlistSubmenuPos.left }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseEnter={() => setShowPlaylistSubmenu(true)}
                    >
                        <div className="px-2 pb-2">
                            <div className="flex items-center gap-2 px-3 py-2
                            bg-white/10 border border-white/15 rounded-lg">
                                <SearchIcon size={14} className="text-white/50 shrink-0" />
                                <input
                                    type="text"
                                    value={playlistSearch}
                                    onChange={(e) => setPlaylistSearch(e.target.value)}
                                    placeholder="Find a playlist"
                                    autoFocus
                                    className="flex-1 bg-transparent outline-none text-sm
                                    text-white placeholder:text-white/40"
                                />
                            </div>
                        </div>

                        <div className="mx-3 mb-1 border-t border-white/10" />

                        <button
                            onClick={() => {
                                onAddToPlaylist?.(song, undefined); // undefined creates new playlist
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2
                            text-sm text-white/80 hover:text-white hover:bg-white/10
                            transition-colors text-left"
                        >
                            <span className="w-6 h-6 rounded-sm bg-white/15 border border-white/20
                            flex items-center justify-center shrink-0">
                                <Plus size={14} />
                            </span>
                            New playlist
                        </button>

                        <div className="mx-3 my-1 border-t border-white/10" />

                        <div className="max-h-48 overflow-y-auto">
                            {isLoadingMemberships ? (
                                <div className="px-3 py-4 flex items-center justify-center">
                                    <Loader2 size={16} className="animate-spin text-spotify-green" />
                                    <span className="ml-2 text-sm text-white/60">Checking playlists...</span>
                                </div>
                            ) : (
                                <>
                                    {Array.isArray(playlists) && playlists
                                        .filter((playlist) => {
                                            // Filter out "Liked Songs" and apply search
                                            const isLikedSongs = playlist.name === "Liked Songs";
                                            const matchesSearch = playlist.name.toLowerCase().includes(playlistSearch.toLowerCase());
                                            return !isLikedSongs && matchesSearch;
                                        })
                                        .slice(0, 10)
                                        .map((playlist) => {
                                            const isAlreadyInPlaylist = songPlaylistIds.has(playlist.id);

                                            return (
                                            <button
                                                key={playlist.id}
                                                onClick={() => {
                                                    if (!isAlreadyInPlaylist) {
                                                        onAddToPlaylist?.(song, playlist.id);
                                                        onClose();
                                                    }
                                                }}
                                                disabled={isAlreadyInPlaylist}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-sm
                                                    transition-colors text-left
                                                    ${isAlreadyInPlaylist
                                                        ? 'text-white/40 cursor-default'
                                                        : 'text-white/80 hover:text-white hover:bg-white/10 cursor-pointer'
                                                    }`}
                                            >
                                                <span className="truncate flex-1">{playlist.name}</span>
                                                {isAlreadyInPlaylist && <Check size={14} className="text-spotify-green shrink-0 ml-2" />}
                                            </button>
                                            );
                                        })}

                                    {(!Array.isArray(playlists) || playlists.filter((playlist) => {
                                        const isLikedSongs = playlist.name === "Liked Songs";
                                        const matchesSearch = playlist.name.toLowerCase().includes(playlistSearch.toLowerCase());
                                        return !isLikedSongs && matchesSearch;
                                    }).slice(0, 10).length === 0) && (
                                        <div className="px-3 py-3 text-sm text-white/40 text-center">
                                            No playlists found
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>,
                    document.body
                )}

            {showArtistSubmenu &&
                createPortal(
                    <div
                        className="fixed z-[9999999] w-52 py-1
                        bg-white/5 backdrop-blur-xl rounded-lg
                        shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                        border border-white/15
                        animate-in fade-in slide-in-from-left-1 duration-150"
                        style={{ top: artistSubmenuPos.top, left: artistSubmenuPos.left }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseEnter={() => setShowArtistSubmenu(true)}
                    >
                        {artists.map((artist, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    onArtistSelect(artist);
                                    onClose();
                                }}
                                className="w-full flex items-center px-4 py-2.5 text-sm
                                text-white/80 hover:text-white hover:bg-white/10
                                transition-colors text-left"
                            >
                                {artist}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </>
    );
};
