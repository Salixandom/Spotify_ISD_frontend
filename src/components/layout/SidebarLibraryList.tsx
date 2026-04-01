import React from "react";
import { NavLink } from "react-router-dom";
import { Music, Heart } from "lucide-react";
import { getDemoPlaylistRoute } from "../../utils/playlistRoutes";

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
    };
    filter: 'all' | 'spotify' | 'you';
    searchQuery: string;
}

export const SidebarLibraryList: React.FC<SidebarLibraryListProps> = ({
    isLoading,
    categories,
    filter,
    searchQuery,
}) => {
    // Determine which playlists to show based on filter and search query
    const filteredPlaylists = React.useMemo(() => {
        let base: PlaylistItem[] = [];

        // First apply category filter
        if (filter === 'spotify') {
            // Show Liked Songs + Spotify playlists
            base = [...categories.likedSongs, ...categories.bySpotify];
        } else if (filter === 'you') {
            // Show Liked Songs + User playlists
            base = [...categories.likedSongs, ...categories.byYou];
        } else {
            // Show all
            base = [
                ...categories.likedSongs,
                ...categories.bySpotify,
                ...categories.byYou,
            ];
        }

        // Then apply search filter if any
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            return base.filter((playlist) =>
                playlist.title.toLowerCase().includes(query) ||
                playlist.subtitle.toLowerCase().includes(query)
            );
        }

        return base;
    }, [categories, filter, searchQuery]);

    if (isLoading) {
        return (
            <div className="space-y-1.5">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-white/[0.02]">
                        <div className="w-12 h-12 rounded-md bg-white/[0.04] animate-pulse" />
                        <div className="flex-1">
                            <div className="h-3.5 w-3/4 bg-white/[0.04] rounded mb-1.5 animate-pulse" />
                            <div className="h-2.5 w-1/2 bg-white/[0.04] rounded animate-pulse" />
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

    return (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="space-y-1.5">
                {filteredPlaylists.map((playlist) => (
                    <NavLink
                        key={playlist.id}
                        to={getDemoPlaylistRoute()}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? "bg-white/[0.10] border border-white/14 text-white"
                                    : "text-white/70 hover:text-white hover:bg-white/[0.06]"
                            }`
                        }
                    >
                        {/* Cover / icon */}
                        <div className="w-12 h-12 rounded-md overflow-hidden border border-white/10 bg-white/[0.04] shrink-0">
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
                            <p className="truncate text-sm font-medium">{playlist.title}</p>
                            <p className="truncate text-xs text-white/65">{playlist.subtitle}</p>
                        </div>

                        {playlist.isPrivate && (
                            <span className="text-[10px] opacity-70">🔒</span>
                        )}
                    </NavLink>
                ))}
            </div>
        </div>
    );
};
