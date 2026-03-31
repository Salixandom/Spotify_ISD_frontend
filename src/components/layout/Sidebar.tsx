import React, { useEffect, useMemo, useState } from "react";
import { Library, Music, Users, Plus, Heart, Search, List } from "lucide-react";
import { NavLink } from "react-router-dom";
import { playlistAPI } from "../../api/playlists";
import type { Playlist } from "../../types";
import { TrackRowSkeleton } from "../ui/LoadingSkeleton";
import { CreatePlaylistModal } from "../modals/CreatePlaylistModal";

type PlaceholderLibraryItemType = "playlist" | "artist" | "album";

interface PlaceholderLibraryItem {
    id: string;
    title: string;
    subtitle: string;
    type: PlaceholderLibraryItemType;
    imageUrl?: string;
    isLikedSongs?: boolean;
    isCollaborative?: boolean;
    isPrivate?: boolean;
}

const PLACEHOLDER_LIBRARY_ITEMS: PlaceholderLibraryItem[] = [
    {
        id: "ph-liked",
        title: "Liked Songs",
        subtitle: "Playlist • 38 songs",
        type: "playlist",
        isLikedSongs: true,
    },
    {
        id: "ph-1",
        title: "PooRai",
        subtitle: "Playlist • Raiyan.Pumal",
        type: "playlist",
        imageUrl:
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop",
    },
    {
        id: "ph-2",
        title: "3 am bangla",
        subtitle: "Playlist • Raiyan.Pumal",
        type: "playlist",
        imageUrl:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    },
    {
        id: "ph-3",
        title: "Your Top Songs 2025",
        subtitle: "Playlist • Made for Raiyan.Pumal",
        type: "playlist",
        imageUrl:
            "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=200&h=200&fit=crop",
    },
    {
        id: "ph-4",
        title: "Discover Weekly",
        subtitle: "Playlist • Made for Raiyan.Pumal",
        type: "playlist",
        imageUrl:
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop",
    },
    {
        id: "ph-5",
        title: "On Repeat",
        subtitle: "Playlist • Made for Raiyan.Pumal",
        type: "playlist",
        imageUrl:
            "https://images.unsplash.com/photo-1444824775686-4185f172c44b?w=200&h=200&fit=crop",
    },
    {
        id: "ph-6",
        title: "Arcane Season 1 & 2 Soundtrack",
        subtitle: "Playlist • Cosmic Vibes",
        type: "playlist",
        imageUrl:
            "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=200&h=200&fit=crop",
    },
    {
        id: "ph-7",
        title: "Feel-good Bangla",
        subtitle: "Playlist • Raiyan.Pumal",
        type: "playlist",
        imageUrl:
            "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?w=200&h=200&fit=crop",
    },
    {
        id: "ph-8",
        title: "My Playlist #11",
        subtitle: "Playlist • Raiyan.Pumal",
        type: "playlist",
    },
    {
        id: "ph-9",
        title: "EXO",
        subtitle: "Artist",
        type: "artist",
        imageUrl:
            "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=200&fit=crop",
    },
    {
        id: "ph-10",
        title: "KPop Demon Hunters (Soundtrack)",
        subtitle: "Album • KPop Demon Hunters Cast",
        type: "album",
        imageUrl:
            "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=200&h=200&fit=crop",
    },
    {
        id: "ph-11",
        title: "Anupam for Prosoon",
        subtitle: "Playlist • Raiat",
        type: "playlist",
        imageUrl:
            "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=200&h=200&fit=crop",
    },
];

export const Sidebar: React.FC = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLibrarySearchOpen, setIsLibrarySearchOpen] = useState(false);
    const [librarySearchQuery, setLibrarySearchQuery] = useState("");
    const [hasApiError, setHasApiError] = useState(false);
    const librarySearchInputRef = React.useRef<HTMLInputElement>(null);

    const fetchPlaylists = async () => {
        setIsLoading(true);
        setHasApiError(false);
        try {
            const data = await playlistAPI.list();
            setPlaylists(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch playlists:", error);
            setPlaylists([]);
            setHasApiError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const refreshPlaylists = () => {
        fetchPlaylists();
    };

    const showPlaceholderItems =
        !isLoading && (hasApiError || playlists.length === 0);

    const playlistItems = useMemo(() => {
        return playlists.map((playlist) => ({
            id: String(playlist.id),
            title: playlist.name,
            subtitle:
                playlist.description?.trim() ||
                `Playlist • ${playlist.playlist_type === "collaborative" ? "Collaborative" : "Created by you"}`,
            imageUrl: playlist.cover_url || undefined,
            isCollaborative: playlist.playlist_type === "collaborative",
            isPrivate: playlist.visibility === "private",
        }));
    }, [playlists]);

    const normalizedQuery = librarySearchQuery.trim().toLowerCase();

    const filteredPlaylistItems = useMemo(() => {
        if (!normalizedQuery) return playlistItems;

        return playlistItems.filter((playlist) =>
            playlist.title.toLowerCase().includes(normalizedQuery) ||
            playlist.subtitle.toLowerCase().includes(normalizedQuery)
        );
    }, [playlistItems, normalizedQuery]);

    const filteredPlaceholderItems = useMemo(() => {
        if (!normalizedQuery) return PLACEHOLDER_LIBRARY_ITEMS;

        return PLACEHOLDER_LIBRARY_ITEMS.filter((item) =>
            item.title.toLowerCase().includes(normalizedQuery) ||
            item.subtitle.toLowerCase().includes(normalizedQuery)
        );
    }, [normalizedQuery]);

    useEffect(() => {
        if (isLibrarySearchOpen) {
            librarySearchInputRef.current?.focus();
        } else {
            setLibrarySearchQuery("");
        }
    }, [isLibrarySearchOpen]);

    return (
        <>
            <aside
                className="h-full w-full bg-transparent flex flex-col p-3 shrink-0"
                aria-label="Library sidebar"
            >
                {/* Library header */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 text-white/75">
                        <Library size={18} />
                        <span className="font-semibold text-sm">
                            Your Library
                        </span>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]"
                        aria-label="Create playlist"
                        title="Create playlist"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* Filters (visual-only for now) */}
                <div className="flex items-center gap-2 mb-3 px-1">
                    <button className="px-3 py-1.5 rounded-full bg-white/[0.10] text-white text-xs font-semibold border border-white/16">
                        Playlists
                    </button>
                    <button className="px-3 py-1.5 rounded-full bg-white/[0.06] text-white/80 text-xs font-semibold border border-white/12 hover:bg-white/[0.1] transition-colors">
                        Artists
                    </button>
                    <button className="px-3 py-1.5 rounded-full bg-white/[0.06] text-white/80 text-xs font-semibold border border-white/12 hover:bg-white/[0.1] transition-colors">
                        Albums
                    </button>
                </div>

                {/* Search + sort row (visual-only for now) */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            onClick={() => setIsLibrarySearchOpen((prev) => !prev)}
                            className={`transition-colors p-1 rounded ${
                                isLibrarySearchOpen
                                    ? "text-white bg-white/[0.08]"
                                    : "text-white/60 hover:text-white"
                            }`}
                            title="Search in your library"
                            aria-label="Search in your library"
                        >
                            <Search size={16} />
                        </button>

                        <div
                            className={`overflow-hidden transition-all duration-300 ease-out ${
                                isLibrarySearchOpen
                                    ? "max-w-[184px] opacity-100"
                                    : "max-w-0 opacity-0"
                            }`}
                        >
                            <div className="w-[170px] h-8 rounded-full border border-white/16 bg-white/[0.08] backdrop-blur-xl px-3 flex items-center">
                                <input
                                    ref={librarySearchInputRef}
                                    type="text"
                                    value={librarySearchQuery}
                                    onChange={(e) => setLibrarySearchQuery(e.target.value)}
                                    placeholder="Search playlists"
                                    className="w-full bg-transparent text-xs text-white placeholder:text-white/45 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        className="inline-flex items-center gap-1 text-white/60 hover:text-white transition-colors text-xs font-medium"
                        title="Sort"
                        aria-label="Sort"
                    >
                        Recents <List size={14} />
                    </button>
                </div>

                {/* Library list */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                    {isLoading ? (
                        <>
                            <TrackRowSkeleton />
                            <TrackRowSkeleton />
                            <TrackRowSkeleton />
                            <TrackRowSkeleton />
                        </>
                    ) : showPlaceholderItems ? (
                        <div className="space-y-1.5">
                            {filteredPlaceholderItems.map((item) => (
                                <button
                                    key={item.id}
                                    className="w-full text-left flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200
                                    text-white/80 hover:text-white hover:bg-white/[0.06]"
                                    title={item.title}
                                >
                                    {/* Artwork / icon */}
                                    <div className="w-12 h-12 rounded-md shrink-0 overflow-hidden border border-white/10 bg-white/[0.04]">
                                        {item.isLikedSongs ? (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center">
                                                <Heart
                                                    size={18}
                                                    className="text-white"
                                                    fill="currentColor"
                                                />
                                            </div>
                                        ) : item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Music
                                                    size={18}
                                                    className="text-white/55"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[15px] font-semibold text-white truncate">
                                            {item.title}
                                        </p>
                                        <p className="text-sm text-white/65 truncate">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </button>
                            ))}

                            {filteredPlaceholderItems.length === 0 && (
                                <div className="px-2 py-6 text-center text-sm text-white/45">
                                    No matching items in your library.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {filteredPlaylistItems.map((playlist) => (
                                <NavLink
                                    key={playlist.id}
                                    to={`/playlist/${playlist.id}`}
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
                                        {playlist.imageUrl ? (
                                            <img
                                                src={playlist.imageUrl}
                                                alt={playlist.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : playlist.isCollaborative ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Users
                                                    size={18}
                                                    className="text-white/65"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Music
                                                    size={18}
                                                    className="text-white/65"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Title + subtitle */}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {playlist.title}
                                        </p>
                                        <p className="truncate text-xs text-white/65">
                                            {playlist.subtitle}
                                        </p>
                                    </div>

                                    {playlist.isPrivate && (
                                        <span className="text-[10px] opacity-70">
                                            🔒
                                        </span>
                                    )}
                                </NavLink>
                            ))}

                            {filteredPlaylistItems.length === 0 && (
                                <div className="px-2 py-6 text-center text-sm text-white/45">
                                    No matching playlists found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            <CreatePlaylistModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={refreshPlaylists}
            />
        </>
    );
};

export default Sidebar;
