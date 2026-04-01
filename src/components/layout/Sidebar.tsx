import React, { useEffect, useMemo, useState } from "react";
import { Library, Plus, Search, List, Wand2 } from "lucide-react";
import { playlistAPI } from "../../api/playlists";
import { CreatePlaylistModal } from "../modals/CreatePlaylistModal";
import { GeneratePlaylistModal } from "../modals/GeneratePlaylistModal";
import {
    getLocalDraftPlaylists,
    LOCAL_PLAYLISTS_UPDATED_EVENT,
} from "../../utils/localPlaylists";
import { SidebarLibraryList } from "./SidebarLibraryList";


export const Sidebar: React.FC = () => {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [followedPlaylists, setFollowedPlaylists] = useState<any[]>([]);
    const [localDraftPlaylists, setLocalDraftPlaylists] = useState(
        getLocalDraftPlaylists()
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isLibrarySearchOpen, setIsLibrarySearchOpen] = useState(false);
    const [librarySearchQuery, setLibrarySearchQuery] = useState("");
    const librarySearchInputRef = React.useRef<HTMLInputElement>(null);

    // Playlist filter: 'all' | 'spotify' | 'you' | 'hidden' | 'followed'
    const [playlistFilter, setPlaylistFilter] = React.useState<'all' | 'spotify' | 'you' | 'hidden' | 'followed'>('all');
    const [showPlaylistFilters, setShowPlaylistFilters] = React.useState(false);

    const fetchPlaylists = async () => {
        setIsLoading(true);
        try {
            // Get current user ID from localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setPlaylists([]);
                setIsLoading(false);
                return;
            }
            const user = JSON.parse(userStr);
            const userId = user.id;

            if (!userId) {
                setPlaylists([]);
                setIsLoading(false);
                return;
            }

            // Fetch user's playlists using getUserPlaylists
            const [unarchivedRes, allRes] = await Promise.all([
                playlistAPI.getUserPlaylists(userId, false),
                playlistAPI.getUserPlaylists(userId, true)
            ]) as any;

            const unarchived = Array.isArray(unarchivedRes?.playlists) ? unarchivedRes.playlists : [];
            const all = Array.isArray(allRes?.playlists) ? allRes.playlists : [];

            const unarchivedIds = new Set(unarchived.map((p: any) => p.id));
            const playlistsWithArchiveFlag = all.map((p: any) => ({
                ...p,
                is_archived: !unarchivedIds.has(p.id)
            }));

            setPlaylists(playlistsWithArchiveFlag);

            // Fetch followed playlists separately
            try {
                const followedRes = await playlistAPI.list({ filter: 'followed' }) as any;
                const followed = Array.isArray(followedRes) ? followedRes : [];
                setFollowedPlaylists(followed);
            } catch {
                setFollowedPlaylists([]);
            }
        } catch (error) {
            console.error("Failed to fetch playlists:", error);
            setPlaylists([]);
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

    // Separate playlists into categories
    const playlistCategories = useMemo(() => {
        const draftItems = localDraftPlaylists.map((playlist) => ({
            id: playlist.id,
            title: playlist.name,
            subtitle: `Playlist • You${playlist.visibility === "private" ? " • Private" : ""}`,
            imageUrl: undefined,
            isCollaborative: false,
            isPrivate: playlist.visibility === "private",
            isSystemGenerated: false,
            isLikedSongs: false,
            isArchived: false,
        }));

        const apiItems = playlists.map((playlist: any) => {
            // Defensive: Check if playlist_type is an object (Artist) instead of string
            const isCollaborative = typeof playlist.playlist_type === 'string'
                ? playlist.playlist_type === "collaborative"
                : false;

            // Defensive: Ensure name is a string, not an object
            const playlistName = typeof playlist.name === 'string'
                ? playlist.name
                : (playlist.name?.name || 'Untitled Playlist');

            return {
                id: String(playlist.id),
                title: playlistName,
                subtitle: `Playlist • ${isCollaborative ? "Collaborative" : "You"}`,
                imageUrl: playlist.cover_url || undefined,
                isCollaborative,
                isPrivate: playlist.visibility === "private",
                isSystemGenerated: playlist.is_system_generated || false,
                isLikedSongs: playlist.is_liked_songs || false,
                isArchived: playlist.is_archived || false,
            };
        });

        const allItems = [...draftItems, ...apiItems];

        const archived = allItems.filter((p) => p.isArchived);
        const activeItems = allItems.filter((p) => !p.isArchived);

        // Liked Songs (always at top if exists)
        const likedSongs = activeItems.filter((p) => p.isLikedSongs);

        // By Spotify (system-generated but not Liked Songs)
        const bySpotify = activeItems.filter((p) => p.isSystemGenerated && !p.isLikedSongs);

        // By You (user-created)
        const byYou = activeItems.filter((p) => !p.isSystemGenerated && !p.isLikedSongs);

        // Followed playlists from other users
        const followed = followedPlaylists.map((playlist: Record<string, unknown>) => ({
            id: String(playlist.id),
            title: typeof playlist.name === 'string' ? playlist.name : 'Untitled Playlist',
            subtitle: `Playlist • Followed`,
            imageUrl: typeof playlist.cover_url === 'string' ? playlist.cover_url : undefined,
            isCollaborative: false,
            isPrivate: playlist.visibility === 'private',
            isSystemGenerated: false,
            isLikedSongs: false,
            isArchived: false,
        }));

        return { likedSongs, bySpotify, byYou, archived, followed };
    }, [playlists, localDraftPlaylists, followedPlaylists]);

    useEffect(() => {
        if (isLibrarySearchOpen) {
            librarySearchInputRef.current?.focus();
        } else {
            setLibrarySearchQuery("");
        }
    }, [isLibrarySearchOpen]);

    useEffect(() => {
        const syncDrafts = () => {
            setLocalDraftPlaylists(getLocalDraftPlaylists());
        };

        window.addEventListener(LOCAL_PLAYLISTS_UPDATED_EVENT, syncDrafts);
        window.addEventListener("storage", syncDrafts);

        return () => {
            window.removeEventListener(LOCAL_PLAYLISTS_UPDATED_EVENT, syncDrafts);
            window.removeEventListener("storage", syncDrafts);
        };
    }, []);

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

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]"
                            aria-label="Create playlist"
                            title="Create playlist"
                        >
                            <Plus size={16} />
                        </button>

                        <button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/6"
                            aria-label="Generate playlist"
                            title="Generate playlist with AI"
                        >
                            <Wand2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Filters - Only Playlists with expandable options */}
                <div className="flex items-center gap-2 mb-3 px-1 flex-wrap">
                    <button
                        onClick={() => {
                            setShowPlaylistFilters(!showPlaylistFilters);
                            // Reset filter when clicking Playlists
                            if (!showPlaylistFilters) {
                                setPlaylistFilter('all');
                            }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            playlistFilter === 'all'
                                ? 'bg-white/10 text-white border-white/16'
                                : 'bg-white/6 text-white/80 border-white/12 hover:bg-white/10'
                        }`}
                    >
                        Playlists
                    </button>

                    {showPlaylistFilters && (
                        <>
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <button
                                onClick={() => setPlaylistFilter('spotify')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                    playlistFilter === 'spotify'
                                        ? 'bg-white/10 text-white border-white/16'
                                        : 'bg-white/6 text-white/80 border-white/12 hover:bg-white/10'
                                }`}
                            >
                                By Spotify
                            </button>
                            <button
                                onClick={() => setPlaylistFilter('you')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                    playlistFilter === 'you'
                                        ? 'bg-white/[0.10] text-white border-white/16'
                                        : 'bg-white/[0.06] text-white/80 border-white/12 hover:bg-white/[0.1]'
                                }`}
                            >
                                By You
                            </button>
                            <button
                                onClick={() => setPlaylistFilter('hidden')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                    playlistFilter === 'hidden'
                                        ? 'bg-white/[0.10] text-white border-white/16'
                                        : 'bg-white/[0.06] text-white/80 border-white/12 hover:bg-white/[0.1]'
                                }`}
                            >
                                Hidden
                            </button>
                            <button
                                onClick={() => setPlaylistFilter('followed')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                    playlistFilter === 'followed'
                                        ? 'bg-white/[0.10] text-white border-white/16'
                                        : 'bg-white/[0.06] text-white/80 border-white/12 hover:bg-white/[0.1]'
                                }`}
                            >
                                Followed
                            </button>
                        </>
                    )}
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
                <SidebarLibraryList
                    isLoading={isLoading}
                    categories={playlistCategories}
                    filter={playlistFilter}
                    searchQuery={librarySearchQuery}
                />
            </aside>

            <CreatePlaylistModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={refreshPlaylists}
            />

            <GeneratePlaylistModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onSuccess={refreshPlaylists}
            />
        </>
    );
};

export default Sidebar;
