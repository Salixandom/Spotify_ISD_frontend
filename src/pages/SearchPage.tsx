import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Play, Plus, MoreHorizontal,
    Mic2, Disc3,
    Music2, Sparkles, Search as SearchIcon, Clock,
    Loader2,
} from "lucide-react";
import { DynamicMusicBackground } from "../components/ui/DynamicMusicBackground";
import { SearchTrackContextMenuModal } from "../components/modals/SearchTrackContextMenuModal";
import { searchAPI } from "../api/search";
import { playlistAPI } from "../api/playlists";

// ─── Types ────────────────────────────────────────────────────────────────────

type Track = { id: string; title: string; artist: string; album: string; duration: string; imageUrl: string };

// ─── Data ─────────────────────────────────────────────────────────────────────

const IMG = [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=600&h=600&fit=crop",
];

const FILTERS = ["All", "Songs", "Albums", "Playlists", "Artists"];

const toArtistRouteId = (artistName: string) =>
    artistName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle: React.FC<{
    title: string;
    icon?: React.ReactNode;
    subtitle?: string;
    onShowAll?: () => void;
}> = ({ title, icon, subtitle, onShowAll }) => (
    <div className="mb-5 flex items-end justify-between">
        <div>
            <h2 className="text-white text-2xl font-bold tracking-tight flex items-center gap-2">
                {icon}{title}
            </h2>
            {subtitle && <p className="text-white/65 text-sm mt-1">{subtitle}</p>}
        </div>
        {onShowAll && (
            <button
                onClick={onShowAll}
                className="text-white/60 text-sm font-semibold hover:text-white
                    transition-colors rounded-full border border-white/15 bg-white/[0.04] px-3 py-1"
            >
                Show all
            </button>
        )}
    </div>
);

// Artist card: play button lives OUTSIDE the overflow-hidden image so it never clips
const ArtistCard: React.FC<{
    imageUrl: string;
    name: string;
    followers: string;
    className?: string;
    onClick?: () => void;
}> = ({
    imageUrl, name, followers, className = "", onClick,
}) => (
    <button className={`group relative shrink-0 rounded-2xl p-3.5 ${className}
        border border-white/14 bg-white/[0.06] backdrop-blur-2xl
        shadow-[0_8px_24px_rgba(0,0,0,0.25)]
        hover:bg-white/[0.10] hover:border-white/24
        transition-all duration-300 text-left`}
        onClick={onClick}
    >
        {/* Circular image — overflow-hidden clips only the img */}
        <div className="relative mb-3 aspect-square rounded-full overflow-hidden
            border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <img
                src={imageUrl} alt={name}
                className="w-full h-full object-cover
                    transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient overlay for readability */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300 rounded-full"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent 55%)" }}
            />
        </div>

        {/* Play button — outside overflow-hidden, no clipping */}
        <div className="absolute right-4 bottom-[72px] z-20
            opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-300 pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-spotify-green text-black
                flex items-center justify-center
                shadow-[0_4px_20px_rgba(30,185,84,0.55)]">
                <Play size={16} fill="currentColor" />
            </div>
        </div>

        <p className="text-white font-semibold text-[14px] truncate">{name}</p>
        <p className="text-white/55 text-[12px] mt-0.5 truncate">{followers}</p>
    </button>
);

const MediaCard: React.FC<{
    imageUrl: string; title: string; subtitle: string; rounded?: boolean; onClick?: () => void;
}> = ({ imageUrl, title, subtitle, rounded = false, onClick }) => (
    <button onClick={onClick} className="group relative w-[160px] shrink-0 rounded-2xl p-3.5
        border border-white/14 bg-white/[0.06] backdrop-blur-2xl
        shadow-[0_8px_24px_rgba(0,0,0,0.25)]
        hover:bg-white/[0.10] hover:border-white/24
        transition-all duration-300 text-left"
    >
        <div className={`relative overflow-hidden mb-3 aspect-square
            border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]
            ${rounded ? "rounded-full" : "rounded-xl"}`}>
            <img
                src={imageUrl} alt={title}
                className="w-full h-full object-cover
                    transition-transform duration-500 group-hover:scale-105"
            />
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)" }}
            />
        </div>

        {/* Play button outside overflow-hidden */}
        <div className="absolute right-4 bottom-[72px] z-20
            opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-300 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-spotify-green text-black
                flex items-center justify-center
                shadow-[0_4px_16px_rgba(30,185,84,0.45)]">
                <Play size={16} fill="currentColor" />
            </div>
        </div>

        <p className="text-white font-semibold text-[14px] truncate">{title}</p>
        <p className="text-white/60 text-[12px] mt-1 truncate">{subtitle}</p>
    </button>
);

const HorizontalShelf: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="overflow-x-auto pb-2
        [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3 w-max">{children}</div>
    </div>
);

// Grid view for full-tab display (Albums / Playlists)
const MediaGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {children}
    </div>
);

// MediaCard but wider for grid layout
const GridCard: React.FC<{
    imageUrl: string; title: string; subtitle: string; rounded?: boolean; onClick?: () => void;
}> = ({ imageUrl, title, subtitle, rounded = false, onClick }) => (
    <button onClick={onClick} className="group relative w-full rounded-2xl p-3.5
        border border-white/14 bg-white/[0.06] backdrop-blur-2xl
        shadow-[0_8px_24px_rgba(0,0,0,0.25)]
        hover:bg-white/[0.10] hover:border-white/24
        transition-all duration-300 text-left"
    >
        <div className={`relative overflow-hidden mb-3 aspect-square
            border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]
            ${rounded ? "rounded-full" : "rounded-xl"}`}>
            <img
                src={imageUrl} alt={title}
                className="w-full h-full object-cover
                    transition-transform duration-500 group-hover:scale-105"
            />
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)" }}
            />
        </div>

        {/* Play button outside overflow-hidden */}
        <div className="absolute right-5 bottom-[80px] z-20
            opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-300 pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-spotify-green text-black
                flex items-center justify-center
                shadow-[0_6px_20px_rgba(30,185,84,0.5)]">
                <Play size={17} fill="currentColor" />
            </div>
        </div>

        <p className="text-white font-semibold text-[14px] truncate">{title}</p>
        <p className="text-white/60 text-[12px] mt-1 truncate">{subtitle}</p>
    </button>
);

// ─── Song row (reused in both All + Songs views) ──────────────────────────────

const SongRow: React.FC<{
    song: Track;
    index: number;
    showAlbumCol?: boolean;
    showOrderNumber?: boolean;
    onContextMenu: (e: React.MouseEvent, song: Track) => void;
}> = ({ song, index, showAlbumCol = false, showOrderNumber = false, onContextMenu }) => (
    <div
        className="group flex items-center gap-3 px-3 py-2 rounded-xl
            border border-transparent
            hover:bg-white/[0.07] hover:border-white/10
            transition-all duration-200 cursor-pointer"
        onMouseDown={(e) => e.stopPropagation()}
    >
        {showOrderNumber && (
            <span className="w-9 text-center text-sm font-semibold text-white/45 shrink-0 tabular-nums">
                {index + 1}
            </span>
        )}

        {/* Index / play */}
        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10">
            <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={13} className="text-white fill-white" />
            </div>
            {!showOrderNumber && (
                <span className="absolute inset-0 flex items-center justify-center
                    text-white/50 text-sm font-medium group-hover:opacity-0 transition-opacity">
                    {index + 1}
                </span>
            )}
        </div>

        {/* Title + artist */}
        <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-[14px] truncate">{song.title}</div>
            <div className="text-[12px] text-white/55 truncate">{song.artist || 'Unknown Artist'}</div>
        </div>

        {/* Album column (only in Songs tab full view) */}
        {showAlbumCol && (
            <span className="hidden md:block text-[13px] text-white/45 truncate w-[140px] shrink-0">
                {song.album || 'Unknown Album'}
            </span>
        )}

        {/* + circle — left of duration */}
        <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-all
                w-7 h-7 rounded-full border border-white/35
                hover:border-white hover:scale-105
                flex items-center justify-center
                text-white/65 hover:text-white shrink-0"
            aria-label="Save to Liked Songs"
        >
            <Plus size={13} />
        </button>

        {/* Duration */}
        <span className="text-sm text-white/45 tabular-nums shrink-0 w-9 text-right">
            {song.duration}
        </span>

        {/* ⋯ — right of duration */}
        <button
            onClick={(e) => onContextMenu(e, song)}
            className="opacity-0 group-hover:opacity-100 transition-all
                w-7 h-7 rounded-full hover:bg-white/15
                flex items-center justify-center
                text-white/65 hover:text-white shrink-0"
            aria-label="More options"
        >
            <MoreHorizontal size={15} />
        </button>
    </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q") || "";

    const [activeFilter, setActiveFilter] = React.useState("All");

    // API data state
    const [searchResults, setSearchResults] = useState<{
        songs: any[];
        artists: any[];
        albums: any[];
        playlists: any[];
    }>({ songs: [], artists: [], albums: [], playlists: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // User's own playlists for context menu
    const [userPlaylists, setUserPlaylists] = useState<any[]>([]);

    // Context menu
    const [contextMenu, setContextMenu] = React.useState<{
        id: string; top: number; left: number; songArtist?: string;
    } | null>(null);

    const closeAll = React.useCallback(() => {
        setContextMenu(null);
    }, []);

    React.useEffect(() => {
        document.addEventListener("mousedown", closeAll);
        return () => document.removeEventListener("mousedown", closeAll);
    }, [closeAll]);

    React.useEffect(() => { setActiveFilter("All"); }, [query]);

    // Fetch user's own playlists on mount
    useEffect(() => {
        const fetchUserPlaylists = async () => {
            try {
                // Get current user ID from localStorage
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    setUserPlaylists([]);
                    return;
                }
                const user = JSON.parse(userStr);
                const userId = user.id;

                if (!userId) {
                    setUserPlaylists([]);
                    return;
                }

                // Fetch user's own and collaborative playlists
                const response = await playlistAPI.getUserPlaylists(userId) as any;
                console.log('User playlists response:', response);

                // Extract playlists array from response (API returns { playlists: [], total, ... })
                const playlistArray = response?.playlists || [];
                setUserPlaylists(playlistArray);
            } catch (err) {
                console.error('Could not fetch user playlists:', err);
                setUserPlaylists([]);
            }
        };
        fetchUserPlaylists();
    }, []);

    // Fetch search results when query changes
    useEffect(() => {
        const fetchData = async () => {
            if (!query) {
                // No query - fetch featured content as default
                setLoading(true);
                setError(null);

                try {
                    // Fetch multiple content types in parallel
                    const [trending, artists, albums] = await Promise.all([
                        searchAPI.getTrending({ limit: 10 }),
                        searchAPI.searchArtists(''), // Get all artists
                        searchAPI.searchAlbums(''), // Get all albums
                    ]);

                    // Try to fetch playlists separately (requires auth)
                    let playlists: any[] = [];
                    try {
                        const playlistData = await playlistAPI.list();
                        playlists = playlistData || [];
                    } catch (playlistErr) {
                        // Silently fail if not authenticated - playlists will be empty
                        console.info('Playlists require authentication, skipping for now');
                    }

                    setSearchResults({
                        songs: trending.songs || [],
                        artists: (artists || []).slice(0, 10),
                        albums: (albums || []).slice(0, 10),
                        playlists: playlists.slice(0, 10)
                    });
                } catch (err) {
                    console.error("Failed to load featured content:", err);
                    setError("Failed to load featured content");
                    setSearchResults({ songs: [], artists: [], albums: [], playlists: [] });
                } finally {
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const results = await searchAPI.search(query);
                setSearchResults(results);
            } catch (err) {
                console.error("Search failed:", err);
                setError("Failed to load search results");
                setSearchResults({ songs: [], artists: [], albums: [], playlists: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query]);

    const openContextMenu = (e: React.MouseEvent, song: Track) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setContextMenu({
            id: song.id,
            top: rect.bottom + 4,
            left: Math.min(rect.right - 224, window.innerWidth - 240),
            songArtist: song.artist,
        });
    };

    const artistList = contextMenu?.songArtist?.split(", ").filter(Boolean) ?? [];

    // ── "All" view ──────────────────────────────────────────────────────────

    const renderAll = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-spotify-green animate-spin" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-white/60">{error}</p>
                </div>
            );
        }

        const hasResults = searchResults.songs.length > 0 ||
                          searchResults.artists.length > 0 ||
                          searchResults.albums.length > 0 ||
                          searchResults.playlists.length > 0;

        if (!hasResults && query) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <SearchIcon className="w-16 h-16 text-white/20 mb-4" />
                    <p className="text-white/60 text-lg">No results found for "{query}"</p>
                    <p className="text-white/40 text-sm mt-2">Try different keywords</p>
                </div>
            );
        }

        return (
        <div className="space-y-10">
            {/* Top result + Songs */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Top result */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Top result</h2>
                    {searchResults.songs.length > 0 && (
                        <div
                            className="group relative p-6 rounded-2xl overflow-hidden
                                border border-white/14 bg-white/[0.06] backdrop-blur-2xl
                                shadow-[0_8px_32px_rgba(0,0,0,0.35)]
                                hover:bg-white/[0.10] hover:border-white/24
                                transition-all duration-300 cursor-pointer"
                        >
                            {/* Ambient glow */}
                            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl
                                bg-spotify-green/12 pointer-events-none" />

                            <div className="relative">
                                {/* Art + title side by side */}
                                <div className="flex gap-4 items-center mb-5">
                                    <div className="w-[110px] h-[110px] rounded-xl overflow-hidden shrink-0
                                        shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-white/10">
                                        <img
                                            src={searchResults.songs[0].cover_url || searchResults.songs[0].imageUrl || IMG[0]}
                                            alt={searchResults.songs[0].title}
                                            className="w-full h-full object-cover
                                                transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="inline-block px-2 py-0.5 rounded-full mb-2
                                            bg-white/10 border border-white/15
                                            text-[10px] font-bold uppercase tracking-widest text-white/60">
                                            Song
                                        </span>
                                        <h3 className="text-[26px] font-bold text-white tracking-tight leading-tight truncate mb-1">
                                            {searchResults.songs[0].title}
                                        </h3>
                                        <p className="text-sm text-white/55 truncate">
                                            {typeof searchResults.songs[0].artist === 'string' ? searchResults.songs[0].artist : searchResults.songs[0].artist?.name || 'Unknown Artist'}
                                            <span className="mx-1.5 text-white/25">·</span>
                                            <span className="text-white/35">{typeof searchResults.songs[0].album === 'string' ? searchResults.songs[0].album : searchResults.songs[0].album?.name || searchResults.songs[0].album || 'Unknown Album'}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full
                                        bg-spotify-green text-black text-sm font-bold
                                        hover:scale-105 active:scale-95 transition-transform
                                        shadow-[0_4px_14px_rgba(30,185,84,0.4)]">
                                        <Play size={14} fill="currentColor" />
                                        Play
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); }}
                                        className="w-8 h-8 rounded-full border border-white/30
                                            flex items-center justify-center text-white/55
                                            hover:text-white hover:border-white transition-colors"
                                        aria-label="Save to Liked Songs">
                                        <Plus size={15} />
                                    </button>
                                    <button
                                        onClick={(e) => openContextMenu(e, {
                                            id: searchResults.songs[0].id,
                                            title: searchResults.songs[0].title,
                                            artist: typeof searchResults.songs[0].artist === 'string' ? searchResults.songs[0].artist : searchResults.songs[0].artist?.name || 'Unknown Artist',
                                            album: typeof searchResults.songs[0].album === 'string' ? searchResults.songs[0].album : searchResults.songs[0].album?.name || 'Unknown Album',
                                            duration: searchResults.songs[0].duration || "3:20",
                                            imageUrl: searchResults.songs[0].cover_url || searchResults.songs[0].imageUrl || IMG[0]
                                        })}
                                        className="w-8 h-8 rounded-full flex items-center justify-center
                                            text-white/35 hover:text-white transition-colors"
                                        aria-label="More options">
                                        <MoreHorizontal size={16} />
                                    </button>
                                <span className="ml-auto flex items-center gap-1.5 text-[11px] text-white/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-spotify-green shrink-0" />
                                    5.2B streams
                                </span>
                            </div>
                        </div>
                    </div>
                        )}
                </div>

                {/* Songs column */}
                {searchResults.songs.length > 0 && (
                <div>
                    <SectionTitle
                        title="Songs"
                        icon={<Music2 size={20} className="text-spotify-green" />}
                        onShowAll={() => setActiveFilter("Songs")}
                    />
                    <div className="flex flex-col gap-0.5">
                        {searchResults.songs.slice(0, 4).map((song: any, idx: number) => (
                            <SongRow
                                key={song.id}
                                song={{
                                    id: song.id,
                                    title: song.title,
                                    artist: typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown Artist',
                                    album: typeof song.album === 'string' ? song.album : song.album?.name || 'Unknown Album',
                                    duration: song.duration || "3:20",
                                    imageUrl: song.cover_url || song.imageUrl || IMG[0]
                                }}
                                index={idx}
                                onContextMenu={openContextMenu}
                            />
                        ))}
                    </div>
                </div>
                )}
            </div>

            {/* Artists shelf */}
            {searchResults.artists.length > 0 && (
            <section>
                <SectionTitle
                    title="Artists"
                    icon={<Mic2 size={20} className="text-purple-300" />}
                    subtitle="Artists matching your search"
                    onShowAll={() => setActiveFilter("Artists")}
                />
                <HorizontalShelf>
                    {searchResults.artists.map((a: any) => (
                        <ArtistCard
                            key={a.id}
                            imageUrl={a.image_url}
                            name={a.name}
                            followers={`${a.monthly_listeners} followers`}
                            className="w-[160px] shrink-0"
                            onClick={() => navigate(`/artist/${toArtistRouteId(a.name)}`)}
                        />
                    ))}
                </HorizontalShelf>
            </section>
            )}

            {/* Albums shelf */}
            {searchResults.albums.length > 0 && (
            <section>
                <SectionTitle
                    title="Albums"
                    icon={<Disc3 size={20} className="text-pink-300" />}
                    subtitle="Albums matching your search"
                    onShowAll={() => setActiveFilter("Albums")}
                />
                <HorizontalShelf>
                    {searchResults.albums.map((album: any) => (
                        <MediaCard
                            key={album.id}
                            imageUrl={album.cover_url || album.imageUrl || IMG[0]}
                            title={album.name}
                            subtitle={`${album.release_year || album.year || '2024'} · ${typeof album.artist === 'string' ? album.artist : album.artist?.name || 'Unknown Artist'}`}
                        />
                    ))}
                </HorizontalShelf>
            </section>
            )}

            {/* Playlists shelf */}
            {searchResults.playlists.length > 0 && (
            <section>
                <SectionTitle
                    title="Playlists"
                    icon={<Sparkles size={20} className="text-cyan-300" />}
                    subtitle="Playlists featuring your search"
                    onShowAll={() => setActiveFilter("Playlists")}
                />
                <HorizontalShelf>
                    {searchResults.playlists.map((playlist: any) => (
                        <MediaCard
                            key={playlist.id}
                            imageUrl={playlist.cover_image || playlist.imageUrl || IMG[0]}
                            title={playlist.name || playlist.title}
                            subtitle={playlist.description || 'Playlist'}
                        />
                    ))}
                </HorizontalShelf>
            </section>
            )}
        </div>
        );
    };

    // ── "Songs" full view ───────────────────────────────────────────────────

    const renderSongs = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-spotify-green animate-spin" />
                </div>
            );
        }

        if (searchResults.songs.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-white/60">No songs found</p>
                </div>
            );
        }

        return (
        <div>
            {/* Table header */}
            <div className="flex items-center gap-3 px-3 pb-2 mb-1
                border-b border-white/10 text-white/40 text-xs font-semibold uppercase tracking-wider">
                <span className="w-9 text-center">#</span>
                <span className="flex-1">Title</span>
                <span className="hidden md:block max-w-[140px] w-[140px] shrink-0">Album</span>
                <span className="w-7 shrink-0" />
                <span className="w-9 text-right shrink-0 flex items-center justify-end gap-1">
                    <Clock size={13} />
                </span>
                <span className="w-7 shrink-0" />
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
                {searchResults.songs.map((song: any, idx: number) => (
                    <SongRow
                        key={song.id}
                        song={{
                            id: song.id,
                            title: song.title,
                            artist: typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown Artist',
                            album: typeof song.album === 'string' ? song.album : song.album?.name || 'Unknown Album',
                            duration: song.duration || "3:20",
                            imageUrl: song.cover_url || song.imageUrl || IMG[0]
                        }}
                        index={idx}
                        showAlbumCol
                        showOrderNumber
                        onContextMenu={openContextMenu}
                    />
                ))}
            </div>
        </div>
        );
    };

    // ── "Artists" full view ─────────────────────────────────────────────────

    const renderArtists = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-spotify-green animate-spin" />
                </div>
            );
        }

        if (searchResults.artists.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-white/60">No artists found</p>
                </div>
            );
        }

        return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {searchResults.artists.map((artist: any) => (
                <ArtistCard
                   
                    key={artist.id}
                   
                    imageUrl={artist.image_url || artist.imageUrl || IMG[0]}
                   
                    name={artist.name}
                   
                    followers={`${artist.monthly_listeners ?? '0'} monthly listeners`}
                   
                    className="w-full"

                    onClick={() => navigate(`/artist/${toArtistRouteId(artist.name)}`)}
                />
            ))}
        </div>
        );
    };

    // ── "Albums" full view ──────────────────────────────────────────────────

    const renderAlbums = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-spotify-green animate-spin" />
                </div>
            );
        }

        if (searchResults.albums.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-white/60">No albums found</p>
                </div>
            );
        }

        return (
        <MediaGrid>
            {searchResults.albums.map((album: any) => (
                <GridCard
                    key={album.id}
                    imageUrl={album.cover_url || album.imageUrl || IMG[0]}
                    title={album.name}
                    subtitle={`${album.release_year || album.year || '2024'} · ${typeof album.artist === 'string' ? album.artist : album.artist?.name || 'Unknown Artist'}`}
                />
            ))}
        </MediaGrid>
        );
    };

    // ── "Playlists" full view ───────────────────────────────────────────────

    const renderPlaylists = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-spotify-green animate-spin" />
                </div>
            );
        }

        if (searchResults.playlists.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-white/60">No playlists found</p>
                </div>
            );
        }

        return (
        <MediaGrid>
            {searchResults.playlists.map((playlist: any) => (
                <GridCard
                    key={playlist.id}
                    imageUrl={playlist.cover_image || playlist.imageUrl || IMG[0]}
                    title={playlist.name || playlist.title}
                    subtitle={playlist.description || 'Playlist'}
                />
            ))}
        </MediaGrid>
        );
    };

    // ── Section header for non-All tabs ────────────────────────────────────

    const TAB_META: Record<string, { title: string; icon: React.ReactNode; subtitle: string }> = {
        Songs:     { title: "Songs",     icon: <Music2   size={22} className="text-spotify-green" />, subtitle: query ? `Songs matching "${query}"` : "All songs" },
        Artists:   { title: "Artists",   icon: <Mic2     size={22} className="text-purple-300"    />, subtitle: query ? `Artists matching "${query}"` : "All artists" },
        Albums:    { title: "Albums",    icon: <Disc3    size={22} className="text-pink-300"       />, subtitle: query ? `Albums matching "${query}"` : "All albums" },
        Playlists: { title: "Playlists", icon: <Sparkles size={22} className="text-cyan-300"      />, subtitle: query ? `Playlists featuring "${query}"` : "All playlists" },
    };

    return (
        <div className="relative min-h-full p-6 md:p-8" onMouseDown={closeAll}>
            <DynamicMusicBackground />

            <div className="relative z-10 space-y-8">

                {/* Filter chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold
                                transition-all duration-200 ${
                                activeFilter === f
                                    ? "bg-white text-black shadow-md"
                                    : "bg-white/[0.08] border border-white/15 text-white hover:bg-white/[0.14]"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Section heading for non-All tabs */}
                {activeFilter !== "All" && (
                    <div className="rounded-2xl border border-white/12
                        bg-white/[0.045] backdrop-blur-2xl
                        shadow-[0_6px_24px_rgba(0,0,0,0.22)] px-5 py-4">
                        <h1 className="text-white text-2xl font-bold flex items-center gap-3">
                            {TAB_META[activeFilter]?.icon}
                            {TAB_META[activeFilter]?.title}
                        </h1>
                        <p className="text-white/55 text-sm mt-0.5">
                            {TAB_META[activeFilter]?.subtitle}
                        </p>
                    </div>
                )}

                {/* Content */}
                {activeFilter === "All"       && renderAll()}
                {activeFilter === "Songs"     && renderSongs()}
                {activeFilter === "Artists"   && renderArtists()}
                {activeFilter === "Albums"    && renderAlbums()}
                {activeFilter === "Playlists" && renderPlaylists()}
            </div>

            <SearchTrackContextMenuModal
                isOpen={Boolean(contextMenu)}
                contextPos={contextMenu ? { top: contextMenu.top, left: contextMenu.left } : { top: 0, left: 0 }}
                artists={artistList}
                playlists={userPlaylists}
                onClose={closeAll}
                onArtistSelect={(artist) => {
                    navigate(`/artist/${toArtistRouteId(artist)}`);
                }}
            />
        </div>
    );
};

export default SearchPage;
