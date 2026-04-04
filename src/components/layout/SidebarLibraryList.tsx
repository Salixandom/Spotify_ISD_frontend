import React from "react";
import { NavLink } from "react-router-dom";
import { Music, Heart, Lock, Pin } from "lucide-react";
import { getPlaylistRoute } from "../../utils/playlistRoutes";
import { togglePlaylistPin } from "../../utils/pinnedPlaylists";

interface PlaylistItem {
    id: string;
    title: string;
    subtitle: string;
    imageUrl?: string;
    isCollaborative?: boolean;
    isPrivate?: boolean;
    isSystemGenerated?: boolean;
    isLikedSongs?: boolean;
    isPinned?: boolean;
}

interface SidebarLibraryListProps {
    isLoading: boolean;
    categories: {
        likedSongs: PlaylistItem[];
        bySpotify: PlaylistItem[];
        byYou: PlaylistItem[];
        archived: PlaylistItem[];
        followed: PlaylistItem[];
    };
    filter: 'all' | 'spotify' | 'you' | 'hidden' | 'followed';
    searchQuery: string;
    sortBy: 'recents' | 'alphabetical' | 'reverseAlphabetical' | 'creator';
    viewMode: 'default-list' | 'compact-list' | 'default-grid' | 'compact-grid';
    pinnedPlaylistIds: Set<string>;
    INITIAL_DISPLAY_COUNT?: number;
}

export const SidebarLibraryList: React.FC<SidebarLibraryListProps> = ({
    isLoading,
    categories,
    filter,
    searchQuery,
    sortBy,
    viewMode,
    pinnedPlaylistIds,
    INITIAL_DISPLAY_COUNT = 50,
}) => {
    const [displayCount, setDisplayCount] = React.useState(INITIAL_DISPLAY_COUNT);
    const [contextMenuPlaylist, setContextMenuPlaylist] = React.useState<PlaylistItem | null>(null);
    const [contextMenuPosition, setContextMenuPosition] = React.useState<{ x: number; y: number } | null>(null);

    // Close context menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => {
            setContextMenuPlaylist(null);
            setContextMenuPosition(null);
        };

        if (contextMenuPosition) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [contextMenuPosition]);

    // Determine which playlists to show based on filter and search query
    const filteredPlaylists = React.useMemo(() => {
        let base: PlaylistItem[] = [];

        // First apply category filter
        if (filter === 'hidden') {
            base = [...categories.archived];
        } else if (filter === 'followed') {
            base = [...categories.followed];
        } else if (filter === 'spotify') {
            // Show Liked Songs + Spotify playlists
            base = [...categories.likedSongs, ...categories.bySpotify];
        } else if (filter === 'you') {
            // Show Liked Songs + User playlists
            base = [...categories.likedSongs, ...categories.byYou];
        } else {
            // Show all (excluding hidden)
            base = [
                ...categories.likedSongs,
                ...categories.bySpotify,
                ...categories.byYou,
            ];
        }

        let results: PlaylistItem[] = [];
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            results = base.filter((playlist) =>
                playlist.title.toLowerCase().includes(query) ||
                playlist.subtitle.toLowerCase().includes(query)
            );
        } else {
            results = base;
        }

        // Mark pinned playlists
        results = results.map(p => ({
            ...p,
            isPinned: pinnedPlaylistIds.has(p.id),
        }));

        // Separate pinned and unpinned (excluding Liked Songs from pinning logic)
        const likedSongs = results.filter(p => p.isLikedSongs);
        const pinned = results.filter(p => p.isPinned && !p.isLikedSongs);
        const unpinned = results.filter(p => !p.isPinned && !p.isLikedSongs);

        // Sort unpinned playlists
        const sortedUnpinned = [...unpinned];
        if (sortBy === 'alphabetical') {
            sortedUnpinned.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'reverseAlphabetical') {
            sortedUnpinned.sort((a, b) => b.title.localeCompare(a.title));
        } else if (sortBy === 'creator') {
            sortedUnpinned.sort((a, b) => a.subtitle.localeCompare(b.subtitle));
        }
        // 'recents' keep original order (already sorted by last played from API)

        // Always pin Liked Songs to the top for all views except 'hidden'
        if (filter !== 'hidden') {
            return [...likedSongs, ...pinned, ...sortedUnpinned];
        }

        return [...pinned, ...sortedUnpinned];
    }, [categories, filter, searchQuery, sortBy, pinnedPlaylistIds]);

    if (isLoading) {
        return (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-white/2"
                    >
                        {/* Cover placeholder */}
                        <div className="w-12 h-12 rounded-md overflow-hidden border border-white/10 bg-white/4 shrink-0">
                            <div className="w-full h-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] animate-pulse" />
                        </div>

                        {/* Text placeholders with staggered animation */}
                        <div className="min-w-0 flex-1">
                            <div
                                className="h-3.5 bg-white/[0.06] rounded mb-1.5 animate-pulse"
                                style={{
                                    width: `${40 + ((i * 17) % 41)}%`,
                                    animationDelay: `${i * 50}ms`,
                                }}
                            />
                            <div
                                className="h-2.5 bg-white/[0.04] rounded animate-pulse"
                                style={{
                                    width: `${30 + ((i * 13) % 31)}%`,
                                    animationDelay: `${i * 50 + 100}ms`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (filteredPlaylists.length === 0) {
        return (
            <div className="px-2 py-6 text-center text-sm text-white/45">
                No playlists found. Create your first playlist!
            </div>
        );
    }

    // Simple pagination: show initial count + "Show more" button
    const visiblePlaylists = filteredPlaylists.slice(0, displayCount);
    const hasMore = filteredPlaylists.length > displayCount;

    // Determine layout based on viewMode
    const isGridView = viewMode.includes('grid');
    const isCompact = viewMode.includes('compact');

    // Grid vs List container classes
    const containerClass = isGridView
        ? `grid gap-2 pr-2 ${isCompact ? 'grid-cols-3' : 'grid-cols-2'}`
        : "space-y-1.5 pr-1";

    // Handle context menu
    const handleContextMenu = (e: React.MouseEvent, playlist: PlaylistItem) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenuPlaylist(playlist);
        setContextMenuPosition({ x: e.pageX, y: e.pageY });
    };

    const closeContextMenu = () => {
        setContextMenuPlaylist(null);
        setContextMenuPosition(null);
    };

    const handleTogglePin = () => {
        if (contextMenuPlaylist) {
            togglePlaylistPin(contextMenuPlaylist.id, contextMenuPlaylist.title);
            closeContextMenu();
        }
    };

    return (
        <div className="flex-1 min-h-0 overflow-y-auto">
            <div className={`${containerClass} pb-2`}>
                {visiblePlaylists.map((playlist) => (
                    <div
                        key={playlist.id}
                        onContextMenu={(e) => handleContextMenu(e, playlist)}
                    >
                        <NavLink
                            to={getPlaylistRoute(playlist.id)}
                            className={({ isActive }) => {
                            const baseClasses = "transition-all duration-200 relative group";
                            const activeClasses = isActive
                                ? "bg-white/10 border border-white/14 text-white"
                                : "text-white/70 hover:text-white hover:bg-white/6";

                            if (isGridView && isCompact) {
                                // Compact grid - card style
                                return `${baseClasses} ${activeClasses} rounded-lg p-2 flex flex-col gap-2 border border-white/8 hover:border-white/12 h-full`;
                            } else if (isGridView && !isCompact) {
                                // Default grid - larger card style
                                return `${baseClasses} ${activeClasses} rounded-lg p-3 flex flex-col gap-2.5 border border-white/8 hover:border-white/12 h-full`;
                            } else if (isCompact) {
                                // Compact list layout
                                return `${baseClasses} ${activeClasses} flex items-center gap-2 px-2.5 py-1.5 rounded-xl`;
                            } else {
                                // Default list layout
                                return `${baseClasses} ${activeClasses} flex items-center gap-3 px-2.5 py-2 rounded-xl`;
                            }
                        }
                        }
                    >
                        {/* Cover / icon */}
                        <div className={`
                            rounded-md overflow-hidden border border-white/10 bg-white/4 shrink-0
                            ${isGridView ? 'w-full aspect-square' : ''}
                            ${!isGridView && isCompact ? 'w-10 h-10' : ''}
                            ${!isGridView && !isCompact ? 'w-12 h-12' : ''}
                        `}>
                            {playlist.isLikedSongs ? (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center">
                                    <Heart size={isGridView ? 28 : 18} className="text-white" fill="currentColor" />
                                </div>
                            ) : playlist.imageUrl ? (
                                <img
                                    src={playlist.imageUrl}
                                    alt={playlist.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Music size={isGridView ? 28 : 18} className="text-white/55" />
                                </div>
                            )}
                        </div>

                        {/* Title + subtitle */}
                        {isGridView ? (
                            // Grid view - show info below image
                            <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                    <p className="truncate text-xs font-semibold leading-tight">
                                        {playlist.title}
                                    </p>
                                    {playlist.isPrivate && (
                                        <Lock size={10} className="text-white/50 shrink-0" />
                                    )}
                                </div>
                                <p className="truncate text-[10px] text-white/55 mt-0.5">
                                    {playlist.subtitle}
                                </p>
                            </div>
                        ) : isCompact ? (
                            // Compact list - show title only
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                    <p className="truncate text-xs font-medium">{playlist.title}</p>
                                    {playlist.isLikedSongs && (
                                        <Pin size={12} className="text-spotify-green shrink-0" style={{ transform: 'rotate(45deg)' }} />
                                    )}
                                    {playlist.isPrivate && (
                                        <Lock size={10} className="text-white/50 shrink-0" />
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Default list - show full details
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <p className="truncate text-sm font-medium">{playlist.title}</p>
                                    {playlist.isLikedSongs && (
                                        <Pin size={14} className="text-spotify-green shrink-0" style={{ transform: 'rotate(45deg)' }} />
                                    )}
                                </div>
                                <p className="truncate text-xs text-white/65">{playlist.subtitle}</p>
                            </div>
                        )}

                        {/* Lock icon for default list */}
                        {!isGridView && !isCompact && playlist.isPrivate && (
                            <Lock size={12} className="text-white/50 shrink-0" />
                        )}
                        </NavLink>
                    </div>
                ))}

                {/* Show more button - full width in list view */}
                {hasMore && !isGridView && (
                    <button
                        onClick={() => setDisplayCount(prev => prev + INITIAL_DISPLAY_COUNT)}
                        className="w-full text-center text-xs text-white/55 hover:text-white py-2 px-2.5 rounded-xl hover:bg-white/5 transition-all"
                    >
                        Show {Math.min(INITIAL_DISPLAY_COUNT, filteredPlaylists.length - displayCount)} more playlists...
                    </button>
                )}
            </div>

            {/* Context Menu */}
            {contextMenuPosition && contextMenuPlaylist && (
                <>
                    <div
                        className="fixed inset-0 z-50"
                        onClick={closeContextMenu}
                    />
                    <div
                        className="fixed z-[100] bg-[#282828]/95 backdrop-blur-xl rounded-lg shadow-xl border border-white/10 py-1 min-w-[180px]"
                        style={{
                            left: `${contextMenuPosition.x}px`,
                            top: `${contextMenuPosition.y}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={handleTogglePin}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                        >
                            <Pin size={14} className={contextMenuPlaylist.isPinned ? "text-spotify-green" : ""} />
                            {contextMenuPlaylist.isPinned ? 'Unpin from Library' : 'Pin to Library'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
