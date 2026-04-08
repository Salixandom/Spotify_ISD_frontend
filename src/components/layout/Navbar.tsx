/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import {
    ChevronLeft,
    ChevronRight,
    Home,
    Search,
    Bell,
    Users,
    Download,
    LogOut,
    User,
    FolderOpen,
    Plus,
    X,
    MoreHorizontal,
    ChevronRight as ChevronRightIcon,
    Mic2,
    Disc3,
    ListPlus,
    Loader2,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { searchAPI } from "../../api/search";
import { SearchTrackContextMenuModal } from "../modals/SearchTrackContextMenuModal";
import toast from "react-hot-toast";

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    // Determine active page
    const currentPath = location.pathname;
    const isHomeActive = currentPath === "/";
    const isSearchActive = currentPath === "/search";
    const isBrowseActive = currentPath === "/browse";

    const [searchValue, setSearchValue] = React.useState("");
    const [showSearchDropdown, setShowSearchDropdown] = React.useState(false);
    const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
    type SearchResult = {
        id: string;
        type: "track" | "artist" | "album" | "playlist";
        title: string;
        subtitle: string;
        imageUrl: string;
    };
    const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [openContextMenuId, setOpenContextMenuId] = React.useState<string | null>(null);
    const [contextMenuPos, setContextMenuPos] = React.useState({ top: 0, left: 0 });
    const [userDisplayName, setUserDisplayName] = React.useState<string>("");
    const [playlists, setPlaylists] = React.useState<any[]>([]);
    const [songPlaylistIds, setSongPlaylistIds] = React.useState<Set<string>>(new Set());
    const [isLoadingMemberships, setIsLoadingMemberships] = React.useState(false);
    const [isLiked, setIsLiked] = React.useState(false);
    const [showArtistSubmenu, setShowArtistSubmenu] = React.useState(false);
    const [artistSubmenuPos, setArtistSubmenuPos] = React.useState({ top: 0, left: 0 });
    const searchRef = React.useRef<HTMLDivElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const contextMenuRef = React.useRef<HTMLDivElement>(null);
    const artistSubmenuRef = React.useRef<HTMLDivElement>(null);

    // Fetch user playlists from localStorage
    const fetchUserPlaylists = React.useCallback(() => {
        try {
            const userData = localStorage.getItem("user");
            if (!userData) return [];

            const user = JSON.parse(userData);
            const playlistsData = localStorage.getItem(`playlists_${user.id}`);
            if (!playlistsData) return [];

            const allPlaylists = JSON.parse(playlistsData);
            return allPlaylists.filter((p: any) => p.owner_id === user.id || p.collaborative);
        } catch (error) {
            console.error("Failed to fetch playlists:", error);
            return [];
        }
    }, []);

    // Fetch which playlists a song is already in
    const fetchSongPlaylistMemberships = React.useCallback(async (songId: string) => {
        setIsLoadingMemberships(true);
        try {
            const userData = localStorage.getItem("user");
            if (!userData) {
                setSongPlaylistIds(new Set());
                setIsLoadingMemberships(false);
                return;
            }

            const user = JSON.parse(userData);
            const membershipsData = localStorage.getItem(`playlist_memberships_${user.id}`);
            if (!membershipsData) {
                setSongPlaylistIds(new Set());
                setIsLoadingMemberships(false);
                return;
            }

            const memberships = JSON.parse(membershipsData);
            const songMemberships = memberships[songId] || [];
            setSongPlaylistIds(new Set(songMemberships));
        } catch (error) {
            console.error("Failed to fetch playlist memberships:", error);
            setSongPlaylistIds(new Set());
        } finally {
            setIsLoadingMemberships(false);
        }
    }, []);

    // Check if song is liked
    const checkIfLiked = React.useCallback((songId: string) => {
        try {
            const userData = localStorage.getItem("user");
            if (!userData) return false;

            const user = JSON.parse(userData);
            const likedSongsData = localStorage.getItem(`liked_songs_${user.id}`);
            if (!likedSongsData) return false;

            const likedSongs = JSON.parse(likedSongsData);
            return likedSongs.some((song: any) => song.id === songId);
        } catch (error) {
            console.error("Failed to check if song is liked:", error);
            return false;
        }
    }, []);

    // Load playlists on mount
    React.useEffect(() => {
        const userPlaylists = fetchUserPlaylists();
        setPlaylists(userPlaylists);
    }, [fetchUserPlaylists]);

    const toArtistRouteId = (artistName: string) =>
        artistName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const getArtistsForResult = (result: SearchResult): string[] => {
        if (result.type === "artist") return [result.title];
        if (result.type === "album") {
            const match = result.subtitle.match(/Album\s*•\s*(.+)/);
            return match ? match[1].split(", ") : [result.subtitle];
        }
        return result.subtitle.split(", ").filter(Boolean);
    };

    // Load recent searches and user display name from localStorage on mount
    React.useEffect(() => {
        const saved = localStorage.getItem("recentSearches");
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (error) {
                console.error("Failed to parse recent searches:", error);
            }
        }

        // Load user display name
        try {
            const user = JSON.parse(localStorage.getItem("user") || "null");
            if (user?.displayName) {
                setUserDisplayName(user.displayName);
            } else if (user?.username) {
                setUserDisplayName(user.username);
            }
        } catch (error) {
            console.error("Failed to load user display name:", error);
        }
    }, []);

    // Debounced search effect - fetch results from API
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchValue.trim().length > 0) {
                setIsSearching(true);
                try {
                    const results = await searchAPI.search(searchValue.trim());

                    // Transform API results to display format
                    const transformedResults: any[] = [];

                    // Add songs
                    results.songs?.slice(0, 3).forEach((song: any) => {
                        transformedResults.push({
                            id: `song-${song.id}`,
                            type: 'track',
                            title: song.title,
                            subtitle: typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown Artist',
                            imageUrl: song.cover_url || song.imageUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
                        });
                    });

                    // Add artists
                    results.artists?.slice(0, 2).forEach((artist: any) => {
                        transformedResults.push({
                            id: `artist-${artist.id}`,
                            type: 'artist',
                            title: artist.name,
                            subtitle: 'Artist',
                            imageUrl: artist.image_url || artist.imageUrl || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=200&fit=crop',
                        });
                    });

                    // Add albums
                    results.albums?.slice(0, 2).forEach((album: any) => {
                        transformedResults.push({
                            id: `album-${album.id}`,
                            type: 'album',
                            title: album.name,
                            subtitle: `Album • ${typeof album.artist === 'string' ? album.artist : album.artist?.name || 'Unknown Artist'}`,
                            imageUrl: album.cover_url || album.imageUrl || 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=200&h=200&fit=crop',
                        });
                    });

                    // Add playlists
                    results.playlists?.slice(0, 2).forEach((playlist: any) => {
                        transformedResults.push({
                            id: `playlist-${playlist.id}`,
                            type: 'playlist',
                            title: playlist.name || playlist.title,
                            subtitle: `Playlist • ${playlist.owner_id || 'Spotify'}`,
                            imageUrl: playlist.cover_image || playlist.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
                        });
                    });

                    setSearchResults(transformedResults.slice(0, 5)); // Show max 5 results
                } catch (error) {
                    console.error('Search failed:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchValue]);

    // Save recent searches to localStorage when they change
    const saveRecentSearch = (search: string) => {
        const trimmed = search.trim();
        if (!trimmed) return;

        setRecentSearches(prev => {
            const filtered = prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
            const updated = [trimmed, ...filtered].slice(0, 10); // Keep max 10
            localStorage.setItem("recentSearches", JSON.stringify(updated));
            return updated;
        });
    };

    const runSearch = (rawSearch: string) => {
        const trimmed = rawSearch.trim();
        if (!trimmed) return;

        saveRecentSearch(trimmed);
        setSearchValue(trimmed);
        setShowSearchDropdown(false);
        setOpenContextMenuId(null);
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    };

    const updateSearchDropdownPosition = React.useCallback(() => {
        const searchElement = searchRef.current;
        if (!searchElement) return;
        // Dropdown positioning is handled by inline styles
    }, []);

    // Keep input synced with route/history.
    // - On /search, show the query from URL so browser back restores it.
    // - On other pages, clear the search box.
    React.useEffect(() => {
        if (location.pathname === "/search") {
            const routeQuery = new URLSearchParams(location.search).get("q") || "";
            setSearchValue(routeQuery);
        } else {
            setSearchValue("");
        }

        setShowSearchDropdown(false);
        setOpenContextMenuId(null);
    }, [location.pathname, location.search]);

    // Close dropdown when clicking outside (portals stop propagation internally)
    React.useEffect(() => {
        const handleClickOutside = () => {
            setShowSearchDropdown(false);
            setOpenContextMenuId(null);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    React.useEffect(() => {
        if (!showSearchDropdown) return;

        updateSearchDropdownPosition();

        window.addEventListener("resize", updateSearchDropdownPosition);
        window.addEventListener("scroll", updateSearchDropdownPosition, true);

        return () => {
            window.removeEventListener("resize", updateSearchDropdownPosition);
            window.removeEventListener("scroll", updateSearchDropdownPosition, true);
        };
    }, [showSearchDropdown, updateSearchDropdownPosition]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runSearch(searchValue);
    };

    const handleBrowseClick = () => {
        navigate("/browse");
    };

    return (
        <header
            className="h-16 px-3 md:px-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-transparent"
            aria-label="Top navigation"
        >
            {/* LEFT: logo + history */}
            <div className="justify-self-start flex items-center gap-3 min-w-0">
                <button
                    onClick={() => navigate("/")}
                    className="w-10 h-10 rounded-full bg-white/92 text-black
                     flex items-center justify-center shadow-md shadow-black/30
                     hover:scale-105 transition-transform shrink-0"
                    aria-label="Spotify Home"
                    title="Spotify"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.505 17.308a.747.747 0 0 1-1.028.246c-2.814-1.72-6.357-2.11-10.53-1.158a.747.747 0 1 1-.333-1.456c4.566-1.045 8.48-.605 11.643 1.33a.747.747 0 0 1 .248 1.038Zm1.47-3.271a.936.936 0 0 1-1.286.311c-3.22-1.98-8.124-2.552-11.934-1.392a.936.936 0 1 1-.545-1.79c4.277-1.302 9.61-.67 13.457 1.695a.936.936 0 0 1 .308 1.176Zm.127-3.405c-3.856-2.29-10.23-2.502-13.91-1.39a1.124 1.124 0 1 1-.65-2.152c4.225-1.279 11.247-1.033 15.707 1.62a1.124 1.124 0 0 1-1.147 1.922Z" />
                    </svg>
                </button>

                <div className="hidden sm:flex items-center gap-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15
                       text-white/85 hover:text-white hover:bg-white/[0.14] transition-colors
                       flex items-center justify-center"
                        aria-label="Go back"
                        title="Back"
                    >
                        <ChevronLeft size={17} />
                    </button>
                    <button
                        onClick={() => navigate(1)}
                        className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15
                       text-white/85 hover:text-white hover:bg-white/[0.14] transition-colors
                       flex items-center justify-center"
                        aria-label="Go forward"
                        title="Forward"
                    >
                        <ChevronRight size={17} />
                    </button>
                </div>
            </div>

            {/* CENTER: Spotify-style Home + Search + Browse (glassmorphism) */}
            <div className="justify-self-center w-[min(100%,920px)] min-w-[380px] flex items-center gap-2">
                {/* Home button with active state */}
                <button
                    onClick={() => navigate("/")}
                    className={`w-10 h-10 rounded-full border backdrop-blur-xl
                    flex items-center justify-center shrink-0 transition-all duration-200
                    ${isHomeActive
                        ? 'border-spotify-green bg-spotify-green/20 text-spotify-green shadow-[0_0_20px_rgba(30,185,84,0.3)]'
                        : 'border-white/20 bg-white/10 text-white hover:bg-white/15'
                    }`}
                    aria-label="Home"
                    title="Home"
                >
                    <Home size={18} />
                </button>

                {/* Search bar - with search icon left, browse button right */}
                <div ref={searchRef} className="flex-1 min-w-0 relative" onMouseDown={(e) => e.stopPropagation()}>
                    <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
                        <div
                            className={`h-11 rounded-full border backdrop-blur-2xl
                            flex items-center gap-3 px-4
                            shadow-[0_8px_20px_rgba(0,0,0,0.20)]
                            transition-all duration-200 relative overflow-hidden
                            ${isSearchActive || isBrowseActive ? 'border-spotify-green' : 'border-white/26 bg-white/10 hover:bg-white/13 hover:border-white/34'
                            }`}
                        >
                            {/* Search page gradient - left to right */}
                            {isSearchActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-spotify-green/30 via-spotify-green/15 to-transparent pointer-events-none" />
                            )}

                            {/* Browse page gradient - right to left */}
                            {isBrowseActive && (
                                <div className="absolute inset-0 bg-gradient-to-l from-spotify-green/30 via-spotify-green/15 to-transparent pointer-events-none" />
                            )}
                            {/* Search icon on the left */}
                            <button
                                type="button"
                                onClick={() => navigate("/search")}
                                className={`shrink-0 flex items-center justify-center
                                w-6 h-6 rounded-full hover:bg-white/10 transition-colors
                                ${isSearchActive ? 'text-spotify-green' : 'text-white/75'}`}
                                aria-label="Search"
                            >
                                <Search size={21} className="shrink-0" />
                            </button>

                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    setShowSearchDropdown(true);
                                }}
                                onFocus={() => setShowSearchDropdown(true)}
                                placeholder="What do you want to play?"
                                className="flex-1 min-w-0 bg-transparent outline-none
                                text-[28px] md:text-[18px] leading-none font-medium
                                text-white placeholder:text-white/65"
                                aria-label="Search"
                            />

                            {/* Divider */}
                            <div className="h-6 w-px bg-white/25 shrink-0" />

                            {/* Browse button on the right */}
                            <button
                                type="button"
                                onClick={handleBrowseClick}
                                className={`shrink-0 inline-flex items-center justify-center
                                w-9 h-9 rounded-full transition-colors
                                ${isBrowseActive
                                    ? 'text-spotify-green'
                                    : 'text-white/80 hover:text-white hover:bg-white/14'
                                }`}
                                aria-label="Browse"
                                title="Browse"
                            >
                                <FolderOpen size={18} />
                            </button>
                        </div>
                    </form>

                    {/* Search Dropdown - Portal to body for z-index */}
                    {showSearchDropdown && createPortal(
                        <div
                            ref={dropdownRef}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="fixed mt-2
                            bg-white/5 backdrop-blur-xl border border-white/15 rounded-lg
                            shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                            overflow-hidden z-[99999] animate-in slide-in-from-top-2
                            duration-200"
                            style={{
                                top: searchRef.current?.getBoundingClientRect().bottom ? searchRef.current.getBoundingClientRect().bottom + 8 : 0,
                                left: searchRef.current?.getBoundingClientRect().left,
                                width: searchRef.current?.offsetWidth,
                            }}
                        >
                            {/* Loading state */}
                            {isSearching && (
                                <div className="p-4 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-spotify-green animate-spin" />
                                    <span className="ml-2 text-sm text-white/60">Searching...</span>
                                </div>
                            )}

                            {/* Search Results - only show when there's a query and not loading */}
                            {!isSearching && searchValue.trim() && searchResults.length > 0 && (
                                <div className="p-2">
                                    <div className="px-3 py-2 text-sm font-semibold text-white/60 uppercase tracking-wider">
                                        Best result
                                    </div>
                                    {searchResults.slice(0, 3).map((result) => (
                                        <div
                                            key={result.id}
                                            className="group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                                        >
                                            {/* Image */}
                                            <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-gradient-to-br from-spotify-green/40 to-spotify-green/20">
                                                <img
                                                    src={result.imageUrl}
                                                    alt={result.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Info - expands to type tag, shrinks on hover */}
                                            <button
                                                onClick={() => {
                                                    if (result.type === "playlist") {
                                                        setShowSearchDropdown(false);
                                                        setOpenContextMenuId(null);
                                                        runSearch(result.title);
                                                        return;
                                                    }
                                                    runSearch(result.title);
                                                }}
                                                className="flex-1 min-w-0 text-left transition-all duration-200 group-hover:max-w-[140px]"
                                            >
                                                <div className="text-white font-medium truncate">
                                                    {result.title}
                                                </div>
                                                <div className="text-sm text-white/60 truncate">
                                                    {result.subtitle}
                                                </div>
                                            </button>

                                            {/* Action buttons - hidden by default, shown on hover */}
                                            <div className="flex items-center gap-2 opacity-0 w-0 overflow-hidden group-hover:opacity-100 group-hover:w-auto transition-all duration-200">
                                                {/* Add to Liked Songs - circled plus */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (result.type === "track") {
                                                            // Extract song ID from result.id (format: song-{id})
                                                            const songId = result.id.replace("song-", "");
                                                            const liked = checkIfLiked(songId);

                                                            try {
                                                                const userData = localStorage.getItem("user");
                                                                if (!userData) {
                                                                    toast.error("Please login to like songs");
                                                                    return;
                                                                }

                                                                const user = JSON.parse(userData);
                                                                const likedSongsKey = `liked_songs_${user.id}`;
                                                                let likedSongs = JSON.parse(localStorage.getItem(likedSongsKey) || "[]");

                                                                if (liked) {
                                                                    // Remove from liked
                                                                    likedSongs = likedSongs.filter((s: any) => s.id !== songId);
                                                                    localStorage.setItem(likedSongsKey, JSON.stringify(likedSongs));
                                                                    toast.success("Removed from Liked Songs");
                                                                } else {
                                                                    // Add to liked
                                                                    const songData = {
                                                                        id: songId,
                                                                        title: result.title,
                                                                        artist: result.subtitle,
                                                                        cover_url: result.imageUrl,
                                                                        added_at: new Date().toISOString()
                                                                    };
                                                                    likedSongs.push(songData);
                                                                    localStorage.setItem(likedSongsKey, JSON.stringify(likedSongs));
                                                                    toast.success("Added to Liked Songs");
                                                                }
                                                            } catch (error) {
                                                                console.error("Failed to toggle like:", error);
                                                                toast.error("Failed to update Liked Songs");
                                                            }
                                                        }
                                                    }}
                                                    className="w-8 h-8 rounded-full border border-white/40 hover:border-white
                                                    flex items-center justify-center text-white/70 hover:text-white
                                                    hover:scale-105 shrink-0"
                                                    aria-label="Save to Liked Songs"
                                                    title="Save to Liked Songs"
                                                >
                                                    <Plus size={15} />
                                                </button>

                                                {/* Three-dot context menu */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                        setContextMenuPos({
                                                            top: rect.bottom + 6,
                                                            left: rect.right - 220,
                                                        });

                                                        // If opening context menu for a track, fetch memberships and check if liked
                                                        if (result.type === "track") {
                                                            const songId = result.id.replace("song-", "");
                                                            fetchSongPlaylistMemberships(songId);
                                                            setIsLiked(checkIfLiked(songId));
                                                        }

                                                        setOpenContextMenuId(
                                                            openContextMenuId === result.id ? null : result.id
                                                        );
                                                    }}
                                                    className="w-8 h-8 rounded-full hover:bg-white/15
                                                    flex items-center justify-center text-white/70 hover:text-white shrink-0"
                                                    aria-label="More options"
                                                    title="More options"
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>

                                            {/* Type badge - always visible on far right */}
                                            <span className="text-xs text-white/40 uppercase px-2 py-1 bg-white/5 rounded shrink-0 whitespace-nowrap">
                                                {result.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Empty state when no results found */}
                            {!isSearching && searchValue.trim() && searchResults.length === 0 && (
                                <div className="p-4 text-center">
                                    <p className="text-white/60 text-sm">No results found for "{searchValue}"</p>
                                    <p className="text-white/40 text-xs mt-1">Try different keywords</p>
                                </div>
                            )}

                            {/* Recent searches - only show when no query */}
                            {!searchValue.trim() && (
                                <div className="p-2">
                                    <div className="px-3 py-2 text-sm font-semibold text-white/60 uppercase tracking-wider">
                                        Recent searches
                                    </div>
                                    {recentSearches.slice(0, 5).map((search, index) => (
                                        <div
                                            key={index}
                                            className="group flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                                        >
                                            <button
                                                onClick={() => {
                                                    runSearch(search);
                                                }}
                                                className="flex-1 flex items-center gap-3 text-left"
                                            >
                                                <Search size={16} className="text-white/50 shrink-0" />
                                                <span className="text-white/90 font-medium">
                                                    {search}
                                                </span>
                                            </button>

                                            {/* Remove button - only on recent searches */}
                                            <button
                                                onClick={() => {
                                                    const updated = recentSearches.filter(s => s !== search);
                                                    setRecentSearches(updated);
                                                    localStorage.setItem("recentSearches", JSON.stringify(updated));
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity
                                                w-8 h-8 rounded-full hover:bg-white/10
                                                flex items-center justify-center text-white/70 hover:text-white"
                                                aria-label="Remove from history"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {recentSearches.length === 0 && (
                                        <div className="px-3 py-5 text-sm text-white/45 text-center">
                                            Start typing to discover songs, artists, albums, and playlists.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Search suggestion */}
                            {searchValue.trim() && (
                                <div className="border-t border-white/10 p-2">
                                    <button
                                        onClick={() => {
                                            runSearch(searchValue);
                                        }}
                                        className="w-full px-3 py-2 rounded-md
                                          flex items-center gap-3 text-left
                                          hover:bg-white/10 transition-colors"
                                    >
                                        <Search size={16} className="text-spotify-green shrink-0" />
                                        <span className="text-white font-medium">
                                            Search for "<span className="text-spotify-green">{searchValue}</span>"
                                        </span>
                                    </button>
                                </div>
                            )}

                            {/* Keyboard shortcuts hint */}
                            <div className="border-t border-white/10 px-3 py-2 flex items-center justify-between text-xs text-white/40">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑↓</kbd>
                                        to navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↵</kbd>
                                        to select
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setRecentSearches([]);
                                        localStorage.removeItem("recentSearches");
                                    }}
                                    className="hover:text-white/70 transition-colors flex items-center gap-1"
                                >
                                    <X size={12} />
                                    Clear history
                                </button>
                            </div>
                        </div>,
                        document.body
                    )}

                    {/* Context menu for tracks - use SearchTrackContextMenuModal */}
                    {openContextMenuId && (() => {
                        const activeResult = searchResults.find(r => r.id === openContextMenuId);
                        if (!activeResult) return null;

                        // For tracks, use the full SearchTrackContextMenuModal
                        if (activeResult.type === "track") {
                            const songId = activeResult.id.replace("song-", "");
                            const artists = getArtistsForResult(activeResult);

                            return (
                                <SearchTrackContextMenuModal
                                    isOpen={!!openContextMenuId}
                                    contextPos={contextMenuPos}
                                    artists={artists}
                                    playlists={playlists}
                                    song={{
                                        id: songId,
                                        title: activeResult.title,
                                        artist: activeResult.subtitle,
                                        album: { name: "Unknown Album" }, // Search results don't include album info
                                        imageUrl: activeResult.imageUrl
                                    }}
                                    songPlaylistIds={songPlaylistIds}
                                    isLoadingMemberships={isLoadingMemberships}
                                    onClose={() => {
                                        setOpenContextMenuId(null);
                                    }}
                                    onArtistSelect={(artist) => {
                                        setOpenContextMenuId(null);
                                        navigate(`/artist/${toArtistRouteId(artist)}`);
                                    }}
                                    onAddToPlaylist={(song, playlistId) => {
                                        try {
                                            const userData = localStorage.getItem("user");
                                            if (!userData) {
                                                toast.error("Please login to add songs to playlists");
                                                return;
                                            }

                                            const user = JSON.parse(userData);

                                            if (playlistId === undefined) {
                                                // Create new playlist
                                                const playlistName = prompt("Enter playlist name:");
                                                if (!playlistName) return;

                                                const newPlaylist = {
                                                    id: `playlist_${Date.now()}`,
                                                    name: playlistName,
                                                    owner_id: user.id,
                                                    songs: [song],
                                                    cover_image: song.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
                                                    created_at: new Date().toISOString()
                                                };

                                                const playlistsData = localStorage.getItem(`playlists_${user.id}`);
                                                const allPlaylists = playlistsData ? JSON.parse(playlistsData) : [];
                                                allPlaylists.push(newPlaylist);
                                                localStorage.setItem(`playlists_${user.id}`, JSON.stringify(allPlaylists));

                                                // Update memberships
                                                const membershipsKey = `playlist_memberships_${user.id}`;
                                                const memberships = JSON.parse(localStorage.getItem(membershipsKey) || "{}");
                                                if (!memberships[song.id]) memberships[song.id] = [];
                                                memberships[song.id].push(newPlaylist.id);
                                                localStorage.setItem(membershipsKey, JSON.stringify(memberships));

                                                toast.success(`Added to ${playlistName}`);
                                            } else {
                                                // Add to existing playlist
                                                const playlistsData = localStorage.getItem(`playlists_${user.id}`);
                                                const allPlaylists = playlistsData ? JSON.parse(playlistsData) : [];
                                                const playlist = allPlaylists.find((p: any) => p.id === playlistId);

                                                if (playlist) {
                                                    if (!playlist.songs) playlist.songs = [];
                                                    if (!playlist.songs.some((s: any) => s.id === song.id)) {
                                                        playlist.songs.push(song);

                                                        // Update memberships
                                                        const membershipsKey = `playlist_memberships_${user.id}`;
                                                        const memberships = JSON.parse(localStorage.getItem(membershipsKey) || "{}");
                                                        if (!memberships[song.id]) memberships[song.id] = [];
                                                        memberships[song.id].push(playlistId);
                                                        localStorage.setItem(membershipsKey, JSON.stringify(memberships));

                                                        localStorage.setItem(`playlists_${user.id}`, JSON.stringify(allPlaylists));
                                                        toast.success(`Added to ${playlist.name}`);
                                                    }
                                                }
                                            }

                                            // Refresh playlists list
                                            setPlaylists(fetchUserPlaylists());
                                        } catch (error) {
                                            console.error("Failed to add to playlist:", error);
                                            toast.error("Failed to add to playlist");
                                        }
                                    }}
                                    onToggleLike={(song) => {
                                        try {
                                            const userData = localStorage.getItem("user");
                                            if (!userData) {
                                                toast.error("Please login to like songs");
                                                return;
                                            }

                                            const user = JSON.parse(userData);
                                            const likedSongsKey = `liked_songs_${user.id}`;
                                            let likedSongs = JSON.parse(localStorage.getItem(likedSongsKey) || "[]");

                                            const likedIndex = likedSongs.findIndex((s: any) => s.id === song.id);
                                            if (likedIndex >= 0) {
                                                likedSongs.splice(likedIndex, 1);
                                                localStorage.setItem(likedSongsKey, JSON.stringify(likedSongs));
                                                toast.success("Removed from Liked Songs");
                                            } else {
                                                const songData = {
                                                    id: song.id,
                                                    title: song.title,
                                                    artist: song.artist,
                                                    cover_url: song.imageUrl,
                                                    added_at: new Date().toISOString()
                                                };
                                                likedSongs.push(songData);
                                                localStorage.setItem(likedSongsKey, JSON.stringify(likedSongs));
                                                toast.success("Added to Liked Songs");
                                            }

                                            setIsLiked(!isLiked);
                                        } catch (error) {
                                            console.error("Failed to toggle like:", error);
                                            toast.error("Failed to update Liked Songs");
                                        }
                                    }}
                                    isLiked={isLiked}
                                />
                            );
                        }

                        // For albums/artists/playlists, show simpler context menu
                        const artists = getArtistsForResult(activeResult);
                        return (
                            <div
                                ref={contextMenuRef}
                                className="fixed z-[999999] w-56 py-1
                                bg-white/5 backdrop-blur-xl rounded-lg
                                shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                                border border-white/15 animate-in fade-in zoom-in-95 duration-100"
                                style={{ top: contextMenuPos.top, left: contextMenuPos.left }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onMouseLeave={() => setOpenContextMenuId(null)}
                            >
                                {/* Type-specific options */}
                                {activeResult.type === "album" && (
                                    <>
                                        <button
                                            onMouseEnter={() => {}}
                                            onClick={() => {
                                                setOpenContextMenuId(null);
                                                const toSlug = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                                                const slug = toSlug(activeResult.title);
                                                navigate(`/album/${slug}`);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm
                                            text-white/80 hover:text-white hover:bg-white/10
                                            transition-colors text-left"
                                        >
                                            <Disc3 size={16} className="text-white/60 shrink-0" />
                                            <span className="flex-1">Go to album</span>
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
                                                }}
                                            >
                                                <Mic2 size={16} className="text-white/60 shrink-0" />
                                                <span className="flex-1">Go to artist</span>
                                                <ChevronRightIcon size={14} className="text-white/40" />
                                            </button>
                                        )}
                                    </>
                                )}

                                {activeResult.type === "artist" && (
                                    <button
                                        onMouseEnter={() => {}}
                                        onClick={() => {
                                            setOpenContextMenuId(null);
                                            navigate(`/artist/${toArtistRouteId(activeResult.title)}`);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm
                                        text-white/80 hover:text-white hover:bg-white/10
                                        transition-colors text-left"
                                    >
                                        <Mic2 size={16} className="text-white/60 shrink-0" />
                                        <span className="flex-1">Go to artist</span>
                                    </button>
                                )}

                                {activeResult.type === "playlist" && (
                                    <button
                                        onMouseEnter={() => {}}
                                        onClick={() => {
                                            setOpenContextMenuId(null);
                                            runSearch(activeResult.title);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm
                                        text-white/80 hover:text-white hover:bg-white/10
                                        transition-colors text-left"
                                    >
                                        <ListPlus size={16} className="text-white/60 shrink-0" />
                                        <span className="flex-1">Open playlist</span>
                                    </button>
                                )}
                            </div>
                        );
                    })()}

                    {/* Artist submenu portal for albums/artists/playlists */}
                    {showArtistSubmenu && openContextMenuId && createPortal(
                        (() => {
                            const activeResult = searchResults.find(r => r.id === openContextMenuId);
                            const artists = activeResult ? getArtistsForResult(activeResult) : [];
                            return (
                                <div
                                    ref={artistSubmenuRef}
                                    className="fixed z-[9999999] w-52 py-1
                                    bg-white/5 backdrop-blur-xl rounded-lg
                                    shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                                    border border-white/15 animate-in fade-in slide-in-from-left-1 duration-150"
                                    style={{ top: artistSubmenuPos.top, left: artistSubmenuPos.left }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseEnter={() => setShowArtistSubmenu(true)}
                                    onMouseLeave={() => setShowArtistSubmenu(false)}
                                >
                                    {artists.map((artist, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setOpenContextMenuId(null);
                                                setShowArtistSubmenu(false);
                                                navigate(`/artist/${toArtistRouteId(artist)}`);
                                            }}
                                            className="w-full flex items-center px-4 py-2.5
                                            text-sm text-white/80 hover:text-white hover:bg-white/10
                                            transition-colors text-left"
                                        >
                                            {artist}
                                        </button>
                                    ))}
                                </div>
                            );
                        })(),
                        document.body
                    )}
                </div>
            </div>

            {/* RIGHT: utility + account */}
            <div className="justify-self-end flex items-center gap-1 md:gap-2 min-w-0">
                <button
                    className="hidden lg:inline-flex items-center gap-2 px-3 py-2 rounded-full
                     bg-white/[0.08] border border-white/15 text-white text-sm font-semibold
                     hover:bg-white/[0.14] transition-colors whitespace-nowrap"
                    aria-label="Install app"
                >
                    <Download size={15} />
                    Install App
                </button>

                <button
                    className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15
                     text-white/75 hover:text-white hover:bg-white/[0.14] transition-colors
                     flex items-center justify-center"
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <Bell size={15} />
                </button>

                <button
                    className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15
                     text-white/75 hover:text-white hover:bg-white/[0.14] transition-colors
                     flex items-center justify-center"
                    aria-label="Friend activity"
                    title="Friend activity"
                >
                    <Users size={15} />
                </button>

                {user ? (
                    <div className="flex items-center gap-2 ml-1">
                        <button
                            onClick={() => navigate("/profile")}
                            className="h-9 rounded-full bg-white/[0.08] border border-white/15
                         pl-1 pr-3 flex items-center gap-2
                         hover:bg-white/[0.14] transition-colors"
                            aria-label="View profile"
                            title="View profile"
                        >
                            <div className="w-7 h-7 rounded-full bg-spotify-green flex items-center justify-center text-black">
                                <User size={13} />
                            </div>
                            <span className="hidden md:block text-sm font-semibold text-white max-w-[120px] truncate">
                                {userDisplayName || user.username}
                            </span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15
                         text-white/75 hover:text-white hover:bg-white/[0.14] transition-colors
                         flex items-center justify-center"
                            aria-label="Logout"
                            title="Logout"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold
                       hover:scale-105 transition-transform whitespace-nowrap"
                    >
                        Log in
                    </button>
                )}
            </div>
        </header>
    );
};

export default Navbar;
