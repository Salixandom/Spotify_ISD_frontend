import React from "react";
import { NavLink } from "react-router-dom";
import { Music, Heart, Lock, Pin } from "lucide-react";
import { getPlaylistRoute } from "../../utils/playlistRoutes";

interface PlaylistItem {
    id: string;
    title: string;
    subtitle: string;
    imageUrl?: string;
    isCollaborative?: boolean;
    isPrivate?: boolean;
    isSystemGenerated?: boolean;
    isLikedSongs?: boolean;
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
    INITIAL_DISPLAY_COUNT?: number;
}

export const SidebarLibraryList: React.FC<SidebarLibraryListProps> = ({
    isLoading,
    categories,
    filter,
    searchQuery,
    INITIAL_DISPLAY_COUNT = 50,
}) => {
    const [displayCount, setDisplayCount] = React.useState(INITIAL_DISPLAY_COUNT);

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

        // Always pin Liked Songs to the top for all views except 'hidden'
        // If we're already showing likedSongs via a category filter, don't duplicate them.
        if (filter !== 'hidden') {
            const likedSongs = categories.likedSongs.filter(ls => {
                // Only add if not already in results
                return !results.some(r => r.id === ls.id);
            });
            return [...likedSongs, ...results];
        }

        return results;
    }, [categories, filter, searchQuery]);

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
                                    width: `${Math.max(40, Math.random() * 80)}%`,
                                    animationDelay: `${i * 50}ms`,
                                }}
                            />
                            <div
                                className="h-2.5 bg-white/[0.04] rounded animate-pulse"
                                style={{
                                    width: `${Math.max(30, Math.random() * 60)}%`,
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

    // Row renderer for react-window
    const Row = React.memo(({ index, style, data }: ListChildComponentProps) => {
        const playlist = data[index];
        const navigate = React.useMemo(() => (id: string) => {
            window.location.href = getPlaylistRoute(id);
        }, []);

        return (
            <div
                style={style}
                className="pr-1"
                onClick={() => navigate(playlist.id)}
            >
                <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer text-white/70 hover:text-white hover:bg-white/6">
                    {/* Cover / icon */}
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-white/10 bg-white/4 shrink-0">
                        {playlist.isLikedSongs ? (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center">
                                <Heart size={18} className="text-white" fill="currentColor" />
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
                                <Music size={18} className="text-white/55" />
                            </div>
                        )}
                    </div>

                    {/* Title + subtitle */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <p className="truncate text-sm font-medium">{playlist.title}</p>
                            {playlist.isLikedSongs && (
                                <Pin size={14} className="text-spotify-green shrink-0" style={{ transform: 'rotate(45deg)' }} />
                            )}
                        </div>
                        <p className="truncate text-xs text-white/65">{playlist.subtitle}</p>
                    </div>

                    {playlist.isPrivate && (
                        <Lock size={12} className="text-white/50 shrink-0" />
                    )}
                </div>
            </div>
        );
    });

    // Simple pagination: show initial count + "Show more" button
    const visiblePlaylists = filteredPlaylists.slice(0, displayCount);
    const hasMore = filteredPlaylists.length > displayCount;

    return (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="space-y-1.5">
                {visiblePlaylists.map((playlist) => (
                    <NavLink
                        key={playlist.id}
                        to={getPlaylistRoute(playlist.id)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? "bg-white/10 border border-white/14 text-white"
                                    : "text-white/70 hover:text-white hover:bg-white/6"
                            }`
                        }
                    >
                        {/* Cover / icon */}
                        <div className="w-12 h-12 rounded-md overflow-hidden border border-white/10 bg-white/4 shrink-0">
                            {playlist.isLikedSongs ? (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center">
                                    <Heart size={18} className="text-white" fill="currentColor" />
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
                                    <Music size={18} className="text-white/55" />
                                </div>
                            )}
                        </div>

                        {/* Title + subtitle */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <p className="truncate text-sm font-medium">{playlist.title}</p>
                                {playlist.isLikedSongs && (
                                    <Pin size={14} className="text-spotify-green shrink-0" style={{ transform: 'rotate(45deg)' }} />
                                )}
                            </div>
                            <p className="truncate text-xs text-white/65">{playlist.subtitle}</p>
                        </div>

                        {playlist.isPrivate && (
                            <Lock size={12} className="text-white/50 shrink-0" />
                        )}
                    </NavLink>
                ))}

                {/* Show more button */}
                {hasMore && (
                    <button
                        onClick={() => setDisplayCount(prev => prev + INITIAL_DISPLAY_COUNT)}
                        className="w-full text-center text-xs text-white/55 hover:text-white py-2 px-2.5 rounded-xl hover:bg-white/5 transition-all"
                    >
                        Show {Math.min(INITIAL_DISPLAY_COUNT, filteredPlaylists.length - displayCount)} more playlists...
                    </button>
                )}
            </div>
        </div>
    );
};
