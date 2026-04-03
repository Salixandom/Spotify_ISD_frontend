import React, { useEffect, useMemo, useState } from "react";
import { Library, Plus, Search, List, Wand2, ChevronDown, LayoutGrid, LayoutList, Grid3x3, ArrowUpAZ, ArrowUpZA, Music } from "lucide-react";
import { playlistAPI } from "../../api/playlists";
import { CreatePlaylistModal } from "../modals/CreatePlaylistModal";
import { GeneratePlaylistModal } from "../modals/GeneratePlaylistModal";
import {
    getLocalDraftPlaylists,
    LOCAL_PLAYLISTS_UPDATED_EVENT,
} from "../../utils/localPlaylists";
import { SidebarLibraryList } from "./SidebarLibraryList";
import {
    getPinnedPlaylists,
    PINNED_PLAYLISTS_UPDATED_EVENT,
} from "../../utils/pinnedPlaylists";


export const Sidebar: React.FC = () => {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [followedPlaylists, setFollowedPlaylists] = useState<any[]>([]);
    const [localDraftPlaylists, setLocalDraftPlaylists] = useState(
        getLocalDraftPlaylists()
    );
    const [pinnedPlaylistIds, setPinnedPlaylistIds] = useState<Set<string>>(
        new Set(getPinnedPlaylists().map(p => p.id))
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

    // Sort and view options
    const [showSortMenu, setShowSortMenu] = React.useState(false);
    const [sortBy, setSortBy] = React.useState<'recents' | 'alphabetical' | 'reverseAlphabetical' | 'creator'>('recents');
    const [viewMode, setViewMode] = React.useState<'default-list' | 'compact-list' | 'default-grid' | 'compact-grid'>('default-list');
    const sortMenuRef = React.useRef<HTMLDivElement>(null);

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

    // Close sort menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setShowSortMenu(false);
            }
        };

        if (showSortMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSortMenu]);

    useEffect(() => {
        const syncDrafts = () => {
            setLocalDraftPlaylists(getLocalDraftPlaylists());
        };

        const syncPinned = () => {
            const pinned = getPinnedPlaylists();
            setPinnedPlaylistIds(new Set(pinned.map(p => p.id)));
        };

        window.addEventListener(LOCAL_PLAYLISTS_UPDATED_EVENT, syncDrafts);
        window.addEventListener("storage", syncDrafts);
        window.addEventListener(PINNED_PLAYLISTS_UPDATED_EVENT, syncPinned);

        return () => {
            window.removeEventListener(LOCAL_PLAYLISTS_UPDATED_EVENT, syncDrafts);
            window.removeEventListener("storage", syncDrafts);
            window.removeEventListener(PINNED_PLAYLISTS_UPDATED_EVENT, syncPinned);
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

                {/* Search + sort row */}
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

                    {/* Sort dropdown */}
                    <div className="relative" ref={sortMenuRef}>
                        <button
                            onClick={() => setShowSortMenu((prev) => !prev)}
                            className={`inline-flex items-center gap-1 transition-colors text-xs font-medium ${
                                showSortMenu
                                    ? "text-white bg-white/[0.08] px-2 py-1 rounded"
                                    : "text-white/60 hover:text-white px-2 py-1 rounded hover:bg-white/[0.06]"
                            }`}
                            title="Sort and view options"
                            aria-label="Sort and view options"
                        >
                            {sortBy === 'recents' && 'Recents'}
                            {sortBy === 'alphabetical' && 'Alphabetical'}
                            {sortBy === 'reverseAlphabetical' && 'Reverse Alpha'}
                            {sortBy === 'creator' && 'Creator'}
                            <ChevronDown size={12} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showSortMenu && (
                            <div className="absolute top-full right-0 mt-1 w-56 bg-[#282828]/95 backdrop-blur-xl rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
                                {/* Sort by section */}
                                <div className="p-1">
                                    <div className="px-2 py-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                                        Sort by
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSortBy('recents');
                                            setShowSortMenu(false);
                                        }}
                                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2 ${
                                            sortBy === 'recents'
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/70 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <List size={14} />
                                        Recents
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortBy('alphabetical');
                                            setShowSortMenu(false);
                                        }}
                                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2 ${
                                            sortBy === 'alphabetical'
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/70 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <ArrowUpAZ size={14} />
                                        Alphabetical
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortBy('reverseAlphabetical');
                                            setShowSortMenu(false);
                                        }}
                                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2 ${
                                            sortBy === 'reverseAlphabetical'
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/70 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <ArrowUpZA size={14} />
                                        Reverse Alphabetical
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortBy('creator');
                                            setShowSortMenu(false);
                                        }}
                                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2 ${
                                            sortBy === 'creator'
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/70 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <Music size={14} />
                                        Creator
                                    </button>
                                </div>

                                <div className="h-px bg-white/10 mx-1" />

                                {/* View as section */}
                                <div className="p-1">
                                    <div className="px-2 py-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                                        View as
                                    </div>
                                    <div className="grid grid-cols-4 gap-0.5">
                                        <button
                                            onClick={() => {
                                                setViewMode('compact-list');
                                                setShowSortMenu(false);
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded transition-colors ${
                                                viewMode === 'compact-list'
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                            }`}
                                            title="Compact list"
                                        >
                                            <List size={16} />
                                            <span className="text-[9px] font-medium">Compact</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setViewMode('default-list');
                                                setShowSortMenu(false);
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded transition-colors ${
                                                viewMode === 'default-list'
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                            }`}
                                            title="Default list"
                                        >
                                            <LayoutList size={16} />
                                            <span className="text-[9px] font-medium">List</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setViewMode('compact-grid');
                                                setShowSortMenu(false);
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded transition-colors ${
                                                viewMode === 'compact-grid'
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                            }`}
                                            title="Compact grid"
                                        >
                                            <Grid3x3 size={16} />
                                            <span className="text-[9px] font-medium">Grid</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setViewMode('default-grid');
                                                setShowSortMenu(false);
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded transition-colors ${
                                                viewMode === 'default-grid'
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                            }`}
                                            title="Default grid"
                                        >
                                            <LayoutGrid size={16} />
                                            <span className="text-[9px] font-medium">Cards</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Library list */}
                <SidebarLibraryList
                    isLoading={isLoading}
                    categories={playlistCategories}
                    filter={playlistFilter}
                    searchQuery={librarySearchQuery}
                    sortBy={sortBy}
                    viewMode={viewMode}
                    pinnedPlaylistIds={pinnedPlaylistIds}
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
