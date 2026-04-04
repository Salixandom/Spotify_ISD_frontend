"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Play,
    Sparkles,
    TrendingUp,
    Clock3,
    Disc3,
    Music2,
} from "lucide-react";
import { playlistAPI } from "../api/playlists";
import { searchAPI } from "../api/search";
import { historyAPI } from "../api/history";
import { DynamicMusicBackground } from "../components/ui/DynamicMusicBackground";
import type { Playlist, Song } from "../types";
import { usePlayerStore } from "../store/playerStore";
import { toPlayerTrack } from "../utils/playerTrack";

/**
 * Spotify-inspired homepage:
 * - API-first data source (playlists)
 * - only shows real data from backend
 * - custom visual language aligned with Login/Register pages
 */

type HomeCard = {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    accentFrom: string;
    accentTo: string;
    kind: "playlist" | "mix" | "daily" | "focus";
    song?: Song;
};

const DEFAULT_COVER = "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function toArtistRouteId(artistName: string): string {
    return artistName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function mapPlaylistsToCards(playlists: Playlist[]): HomeCard[] {
    const accents = [
        ["#1db954", "#0d6b30"],
        ["#8b5cf6", "#4c1d95"],
        ["#06b6d4", "#0e7490"],
        ["#f97316", "#9a3412"],
        ["#ec4899", "#9d174d"],
        ["#84cc16", "#3f6212"],
    ] as const;

    return playlists.map((playlist, index) => {
        const [accentFrom, accentTo] = accents[index % accents.length];
        return {
            id: `pl-${playlist.id}`,
            title: playlist.name || `Playlist ${playlist.id}`,
            subtitle:
                playlist.description ||
                `${playlist.playlist_type} • ${playlist.visibility}`,
            imageUrl:
                playlist.cover_url ||
                DEFAULT_COVER,
            accentFrom,
            accentTo,
            kind:
                playlist.playlist_type === "collaborative" ? "mix" : "playlist",
        };
    });
}

const kindIcon = {
    playlist: Music2,
    mix: Disc3,
    daily: Sparkles,
    focus: Clock3,
} as const;

const SectionTitle: React.FC<{
    title: string;
    icon?: React.ReactNode;
    subtitle?: string;
    onToggle?: () => void;
    isExpanded?: boolean;
    showToggleButton?: boolean;
}> = ({ title, icon, subtitle, onToggle, isExpanded = false, showToggleButton = true }) => {
    return (
        <div className="mb-4 flex items-end justify-between">
            <div>
                <h2 className="text-white text-2xl font-bold tracking-tight flex items-center gap-2">
                    {icon}
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-white/65 text-sm mt-1">{subtitle}</p>
                )}
            </div>
            {showToggleButton && onToggle && (
                <button
                    onClick={onToggle}
                    className="text-white/60 text-sm font-semibold hover:text-white transition-colors
                    rounded-full border border-white/15 bg-white/[0.04] px-3 py-1"
                >
                    {isExpanded ? 'Show less' : 'Show all'}
                </button>
            )}
        </div>
    );
};

const QuickTile: React.FC<{ item: HomeCard; onClick?: () => void; onPlay?: () => void }> = ({ item, onClick, onPlay }) => {
    const Icon = kindIcon[item.kind];

    return (
        <button
            onClick={onClick}
            className="group relative h-[72px] rounded-xl overflow-hidden
                 border border-white/14 bg-white/[0.06] backdrop-blur-2xl
                 shadow-[0_6px_20px_rgba(0,0,0,0.25)]
                 hover:bg-white/[0.10] hover:border-white/22
                 transition-all duration-300 text-left"
            style={{
                backgroundImage: `linear-gradient(120deg, ${item.accentFrom}20, ${item.accentTo}16)`,
            }}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                    className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl"
                    style={{ background: `${item.accentFrom}4A` }}
                />
            </div>

            <div className="relative h-full flex items-center gap-3 px-3.5">
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-13 h-13 rounded-md object-cover shadow-lg"
                    loading="lazy"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-white text-[15px] font-semibold truncate">
                        {item.title}
                    </p>
                    <p className="text-white/70 text-[13px] truncate">
                        {item.subtitle}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay?.();
                    }}
                    className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                    aria-label="Play song"
                >
                    <div className="w-9 h-9 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-xl shadow-spotify-green/30">
                        <Play size={16} fill="currentColor" />
                    </div>
                </button>
                <div className="absolute top-2 right-2 text-white/30 group-hover:text-white/60 transition-colors">
                    <Icon size={14} />
                </div>
            </div>
        </button>
    );
};

const ShelfCard: React.FC<{ item: HomeCard; onClick?: () => void; onPlay?: () => void }> = ({ item, onClick, onPlay }) => {
    const Icon = kindIcon[item.kind];

    return (
        <button
            onClick={onClick}
            className="group w-[196px] shrink-0 rounded-2xl p-3.5
                 border border-white/14 bg-white/[0.06] backdrop-blur-2xl
                 shadow-[0_8px_24px_rgba(0,0,0,0.25)]
                 hover:bg-white/[0.10] hover:border-white/24 transition-all duration-300 text-left"
        >
            <div className="relative rounded-xl overflow-hidden mb-3 aspect-square border border-white/10">
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `linear-gradient(to top, ${item.accentTo}AA, transparent 60%)`,
                    }}
                />
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay?.();
                    }}
                    className="absolute right-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                    aria-label="Play song"
                >
                    <div className="w-10 h-10 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-lg shadow-spotify-green/30">
                        <Play size={16} fill="currentColor" />
                    </div>
                </button>
            </div>

            <div className="flex items-start gap-2.5">
                <div className="text-white/50 mt-0.5">
                    <Icon size={15} />
                </div>
                <div className="min-w-0">
                    <p className="text-white font-semibold text-[15px] truncate">
                        {item.title}
                    </p>
                    <p className="text-white/70 text-[13px] mt-1.5 line-clamp-2">
                        {item.subtitle}
                    </p>
                </div>
            </div>
        </button>
    );
};

const HorizontalShelf: React.FC<{
    items: HomeCard[];
    totalItems?: number;
    onShowMore?: () => void;
    onShowLess?: () => void;
    onItemClick?: (item: HomeCard) => void;
    onItemPlay?: (item: HomeCard) => void;
}> = ({ items, totalItems = 0, onShowMore, onShowLess, onItemClick, onItemPlay }) => {
    const hasMore = totalItems > items.length;
    const isShowingAll = items.length >= totalItems;
    // Only show collapse button if we're showing more than 12 items (collapsed limit)
    const canCollapse = items.length > 12;

    return (
        <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3 w-max">
                {items.map((item) => (
                    <ShelfCard
                        key={item.id}
                        item={item}
                        onClick={() => onItemClick?.(item)}
                        onPlay={item.song ? () => onItemPlay?.(item) : undefined}
                    />
                ))}
                {!isShowingAll && hasMore && onShowMore && (
                    <button
                        onClick={onShowMore}
                        className="group w-[196px] shrink-0 rounded-2xl p-3.5
                             border border-white/14 bg-white/[0.06] backdrop-blur-2xl
                             hover:bg-white/[0.10] hover:border-white/24 hover:border-spotify-green/50
                             transition-all duration-300 text-left"
                    >
                        <div className="relative rounded-xl overflow-hidden mb-3 aspect-square border border-white/10 flex items-center justify-center bg-white/[0.04]">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto rounded-full bg-white/[0.08] group-hover:bg-spotify-green/20 flex items-center justify-center mb-2 transition-colors">
                                    <span className="text-2xl font-bold text-white/80 group-hover:text-spotify-green transition-colors">
                                        +{totalItems - items.length}
                                    </span>
                                </div>
                                <p className="text-white/70 text-sm font-medium">Show more</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <div className="text-white/50 mt-0.5">
                                <Sparkles size={15} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-white font-semibold text-[15px] truncate">
                                    See all {totalItems} items
                                </p>
                                <p className="text-white/70 text-[13px] mt-1.5">
                                    Browse the full collection
                                </p>
                            </div>
                        </div>
                    </button>
                )}
                {isShowingAll && canCollapse && onShowLess && (
                    <button
                        onClick={onShowLess}
                        className="group w-[196px] shrink-0 rounded-2xl p-3.5
                             border border-white/14 bg-white/[0.06] backdrop-blur-2xl
                             hover:bg-white/[0.10] hover:border-white/24
                             transition-all duration-300 text-left"
                    >
                        <div className="relative rounded-xl overflow-hidden mb-3 aspect-square border border-white/10 flex items-center justify-center bg-white/[0.04]">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto rounded-full bg-white/[0.08] group-hover:bg-white/16 flex items-center justify-center mb-2 transition-colors">
                                    <span className="text-xl text-white/80">↑</span>
                                </div>
                                <p className="text-white/70 text-sm font-medium">Show less</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <div className="text-white/50 mt-0.5">
                                <Sparkles size={15} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-white font-semibold text-[15px] truncate">
                                    Collapse view
                                </p>
                                <p className="text-white/70 text-[13px] mt-1.5">
                                    Back to top picks
                                </p>
                            </div>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
};

const HomeSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-8 w-48 bg-white/10 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-16 bg-white/10 rounded-xl" />
                ))}
            </div>
            {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx}>
                    <div className="h-6 w-56 bg-white/10 rounded-md mb-4" />
                    <div className="flex gap-3 overflow-hidden">
                        {Array.from({ length: 6 }).map((__, i) => (
                            <div key={i} className="w-[180px] shrink-0">
                                <div className="aspect-square bg-white/10 rounded-xl mb-3" />
                                <div className="h-4 bg-white/10 rounded mb-2" />
                                <div className="h-3 bg-white/10 rounded w-4/5" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { playTrack } = usePlayerStore();
    const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
    const [recommendedPlaylists, setRecommendedPlaylists] = React.useState<Playlist[]>([]);
    const [systemPlaylists, setSystemPlaylists] = React.useState<Playlist[]>([]);
    const [recommendedSongs, setRecommendedSongs] = React.useState<Song[]>([]);
    const [trendingSongs, setTrendingSongs] = React.useState<Song[]>([]);
    const [trendingPlaylists, setTrendingPlaylists] = React.useState<Playlist[]>([]);
    const [newReleases, setNewReleases] = React.useState<Song[]>([]);
    const [newReleasePlaylists, setNewReleasePlaylists] = React.useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    //const [hasApiError, setHasApiError] = React.useState(false);

    const [displayName, setDisplayName] = React.useState("Buddy");
    
    React.useEffect(() => {
        try {
            // Adjust based on how you store user data
            const user = JSON.parse(localStorage.getItem("user") || "null");
    
            if (user?.name) {
                setDisplayName(user.name + "!");
            } else if (user?.displayName) {
                setDisplayName(user.displayName + "!");
            } else {
                setDisplayName("Buddy!");
            }
        } catch {
            setDisplayName("Buddy!");
        }
    }, []);
    
    const messages = [
        "bro came for one song and stayed for three hours",
        "who gave you the aux this time",
        "another day, another banger",
        "main character music loading",
        "sad songs? bold choice",
        "we both know you’re skipping in 10 seconds",
        "this playlist might fix you",
        "dangerously close to finding your new obsession",
        "one song away from changing your whole mood",
        "the speakers are nervous",
        "today’s personality: depends on the next track",
        "you came here for vibes. respectable.",
        "this app knows you need music right now",
        "time to pretend life is a montage",
        "your neighbors may not love this one",
        "queueing bad decisions and great music",
        "go on, romanticize your life a little",
        "you’re either healing or making it worse",
        "certified headphone moment",
        "plot twist: this one actually slaps",
        "just a casual search for your next obsession",
        "locked in. volume up.",
        "for legal reasons, this is too much heat",
        "welcome back, professional song skipper",
        "bro did NOT come here for silence",
        "who let you have the aux",
        "one more song won’t hurt. probably.",
        "we both know you’re about to loop the same track",
        "main character mode: activated",
        "another peaceful day ruined by a banger",
        "this app supports your music addiction",
        "sad songs again? stay strong soldier",
        "you’re either healing or spiraling",
        "caught chasing vibes again",
        "professional song skipper has arrived",
        "bro’s building the most questionable queue ever",
        "romanticize your life. press play.",
        "this playlist has opinions",
        "one tap away from being dramatic for no reason",
        "you did not open this app to be normal",
        "today’s mood depends on the next track",
        "bad decisions. great soundtrack.",
        "the speakers fear what you’re about to play",
        "this app has seen your music choices. brave.",
        "back to ignore your responsibilities with style?",
        "one song in and suddenly you’re a philosopher",
        "welcome back, curator of emotional damage",
        "this queue is either elite or deeply concerning",
        "you came for vibes and left with an identity crisis",
        "the algorithm is judging softly",
        "play something loud enough to defeat the plot",
        "your headphones deserve an apology in advance",
        "this next track might unnecessarily change your life",
        "today’s forecast: 100% chance of replaying the same song",
        "just you, your thoughts, and suspiciously good music",
        "go ahead. make the whole day cinematic.",
        "one dramatic track away from staring out a window",
        "who needs stability when you have playlists",
        "this session may contain bangers",
        "you’re dangerously close to finding your new obsession",
        "entering vibe management mode",
        "let’s make bad timing sound amazing",
    ];
    
    const randomMessage = React.useMemo(() => {
        return messages[Math.floor(Math.random() * messages.length)];
    }, []);

    // Track which sections are expanded to show more items
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        quickAccess: false,
        madeForYou: false,
        trendingNow: false,
        recentlyAdded: false,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    React.useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setIsLoading(true);
            //setHasApiError(false);

            try {
                // Fetch all content in parallel
                const [
                    playlistsData,
                    recommendedData,
                    systemData,
                    recentPlaysData,
                    trendingData,
                    newReleasesData,
                ] = await Promise.all([
                    playlistAPI.list().catch(err => {
                        console.info('Could not fetch playlists:', err);
                        return [];
                    }),
                    playlistAPI.getRecommended().catch(err => {
                        console.info('Could not fetch recommended playlists:', err);
                        return [];
                    }),
                    playlistAPI.list({ is_system_generated: 'true' }).catch(err => {
                        console.info('Could not fetch system playlists:', err);
                        return [];
                    }),
                    historyAPI.getRecentPlays().catch(err => {
                        console.info('Could not fetch recent plays:', err);
                        return [];
                    }),
                    searchAPI.getTrending({ limit: 30 }).catch(err => {
                        console.info('Could not fetch trending:', err);
                        return { songs: [], total: 0 };
                    }),
                    searchAPI.getNewReleases({ limit: 30 }).catch(err => {
                        console.info('Could not fetch new releases:', err);
                        return { songs: [], total: 0 };
                    }),
                ]);

                if (!isMounted) return;

                setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
                setRecommendedPlaylists(Array.isArray(recommendedData) ? recommendedData : []);
                setSystemPlaylists(Array.isArray(systemData) ? systemData : []);
                setTrendingSongs(trendingData.songs || []);
                setTrendingPlaylists([]);
                setNewReleases(newReleasesData.songs || []);
                setNewReleasePlaylists([]);
                setRecommendedSongs(recentPlaysData || []);
            } catch (error) {
                console.error("Failed to load home content:", error);
                if (!isMounted) return;
                //setHasApiError(true);
                setPlaylists([]);
                setRecommendedPlaylists([]);
                setSystemPlaylists([]);
                setTrendingSongs([]);
                setTrendingPlaylists([]);
                setNewReleases([]);
                setNewReleasePlaylists([]);
                setRecommendedSongs([]);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, []);

    const greeting = getGreeting();

    // Transform playlists to cards
    const playlistCards = React.useMemo(
        () => mapPlaylistsToCards(playlists),
        [playlists],
    );

    // Transform songs to cards
    const songToCard = (song: any, index: number, kind: HomeCard['kind']): HomeCard => ({
        id: `song-${song.id}`,
        title: song.title,
        subtitle: typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown Artist',
        imageUrl: song.cover_url || DEFAULT_COVER,
        accentFrom: ['#1db954', '#8b5cf6', '#06b6d4', '#f97316'][index % 4],
        accentTo: ['#0d6b30', '#4c1d95', '#0e7490', '#9a3412'][index % 4],
        kind,
        song,
    });

    const handleCardPlay = React.useCallback((item: HomeCard) => {
        if (!item.song) return;
        playTrack(toPlayerTrack(item.song));
    }, [playTrack]);

    // Transform trending playlists to cards
    const trendingPlaylistCards = React.useMemo(
        () => mapPlaylistsToCards(trendingPlaylists),
        [trendingPlaylists],
    );

    // Transform new release playlists to cards
    const newReleasePlaylistCards = React.useMemo(
        () => mapPlaylistsToCards(newReleasePlaylists),
        [newReleasePlaylists],
    );

    // Create all available cards (up to 30) - combine songs and playlists
    const allTrendingCards = React.useMemo(
        () => [
            ...trendingSongs.slice(0, 15).map((song, i) => songToCard(song, i, 'daily')),
            ...trendingPlaylistCards.slice(0, 15)
        ],
        [trendingSongs, trendingPlaylistCards],
    );

    const allNewReleaseCards = React.useMemo(
        () => [
            ...newReleases.slice(0, 15).map((song, i) => songToCard(song, i, 'mix')),
            ...newReleasePlaylistCards.slice(0, 15)
        ],
        [newReleases, newReleasePlaylistCards],
    );

    // Transform recommended playlists to cards
    const recommendedPlaylistCards = React.useMemo(
        () => mapPlaylistsToCards(recommendedPlaylists),
        [recommendedPlaylists],
    );

    // Transform system playlists to cards
    const systemPlaylistCards = React.useMemo(
        () => mapPlaylistsToCards(systemPlaylists),
        [systemPlaylists],
    );

    // Transform recent plays to cards for Quick Access
    const allRecentPlayCards = React.useMemo(
        () => recommendedSongs.slice(0, 30).map((song, i) => songToCard(song, i, 'daily')),
        [recommendedSongs],
    );

    // Determine which data to show
    const hasRealData = playlistCards.length > 0 || allTrendingCards.length > 0 || allNewReleaseCards.length > 0;

    // Quick Access: Show 8 when collapsed, up to 30 when expanded
    const quickAccess = React.useMemo(() => {
        const baseCards = allRecentPlayCards.length > 0
            ? allRecentPlayCards
            : hasRealData
                ? [...playlistCards.slice(0, 6), ...allTrendingCards.slice(0, 2)]
                : [];

        return expandedSections.quickAccess ? baseCards.slice(0, 30) : baseCards.slice(0, 8);
    }, [allRecentPlayCards, playlistCards, allTrendingCards, hasRealData, expandedSections.quickAccess]);

    // Made for You: Show 12 when collapsed, up to 30 when expanded
    const madeForYouCards = React.useMemo(() => {
        // Combine system playlists with recommended playlists
        const systemAndRecommended = [
            ...systemPlaylistCards,
            ...recommendedPlaylistCards.filter(
                rp => !systemPlaylistCards.some(sp => sp.id === rp.id)
            )
        ];

        const baseCards = systemAndRecommended.length > 0
            ? systemAndRecommended
            : hasRealData && playlistCards.length > 0
                ? playlistCards
                : [];

        return expandedSections.madeForYou ? baseCards.slice(0, 30) : baseCards.slice(0, 12);
    }, [systemPlaylistCards, recommendedPlaylistCards, playlistCards, hasRealData, expandedSections.madeForYou]);

    // Calculate total count for "See all" button
    const madeForYouTotal = React.useMemo(() => {
        const systemAndRecommended = [
            ...systemPlaylistCards,
            ...recommendedPlaylistCards.filter(
                rp => !systemPlaylistCards.some(sp => sp.id === rp.id)
            )
        ];

        return systemAndRecommended.length > 0
            ? systemAndRecommended.length
            : hasRealData && playlistCards.length > 0
                ? playlistCards.length
                : 0;
    }, [systemPlaylistCards, recommendedPlaylistCards, playlistCards, hasRealData]);

    // Trending Now: Show 12 when collapsed, up to 30 when expanded
    const trendingNow = React.useMemo(() => {
        const baseCards = allTrendingCards.length > 0 ? allTrendingCards : [];
        return expandedSections.trendingNow ? baseCards.slice(0, 30) : baseCards.slice(0, 12);
    }, [allTrendingCards, expandedSections.trendingNow]);

    // Recently Added: Show 12 when collapsed, up to 30 when expanded
    const recentlyAdded = React.useMemo(() => {
        const baseCards = allNewReleaseCards.length > 0 ? allNewReleaseCards : [];
        return expandedSections.recentlyAdded ? baseCards.slice(0, 30) : baseCards.slice(0, 12);
    }, [allNewReleaseCards, expandedSections.recentlyAdded]);

    return (
        <div className="relative min-h-full">
            {/* Reusable dynamic background from auth pages (prevents duplicate overlay seams) */}
            <DynamicMusicBackground
                variant="mixed"
                density="low"
                showGrid={false}
                showWave={false}
                iconClassName="text-white/18"
                orbOpacityClassName="opacity-70"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/15" />

            <div className="relative z-10 p-6 md:p-8 space-y-8">
                {/* Header */}
                <header
                    className="space-y-2 rounded-2xl border border-white/12 bg-white/[0.055] backdrop-blur-2xl
                    shadow-[0_10px_30px_rgba(0,0,0,0.28)] px-5 py-4"
                >
                    <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
                        {greeting}, <span className="text-[#1DB954]">{displayName}</span>
                    </h1>
                    <p className="text-white/70 text-sm md:text-base">
                        {/*{hasRealData
                            ? "Your latest playlists are ready."
                            : "Backend unavailable — showing curated placeholders for now."}*/}
                        {randomMessage}
                    </p>
                    
                        <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full text-xs border border-amber-300/35 bg-amber-300/12 text-amber-100 backdrop-blur-xl">
                            <TrendingUp size={14} />
                            Your Tunes are ready
                        </div>
                    
                </header>

                {isLoading ? (
                    <HomeSkeleton />
                ) : (
                    <>
                        {/* Quick access */}
                        <section>
                            <SectionTitle
                                title="Quick access"
                                subtitle="Recently played songs and your go-to playlists"
                                icon={
                                    <Sparkles
                                        size={20}
                                        className="text-spotify-green"
                                    />
                                }
                                onToggle={() => toggleSection('quickAccess')}
                                isExpanded={expandedSections.quickAccess}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                                {quickAccess.map((item) => (
                                    <QuickTile
                                        key={item.id}
                                        item={item}
                                        onPlay={item.song ? () => handleCardPlay(item) : undefined}
                                        onClick={() => {
                                            if (item.id.startsWith('pl-')) {
                                                const playlistId = item.id.replace('pl-', '');
                                                navigate(`/playlist/${playlistId}`);
                                            } else if (item.id.startsWith('song-')) {
                                                const artistName = item.subtitle;
                                                navigate(`/artist/${toArtistRouteId(artistName)}`);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Shelves */}
                        <section>
                            <SectionTitle
                                title="Made for you"
                                subtitle="Auto-generated playlists based on your taste"
                                icon={
                                    <Disc3
                                        size={20}
                                        className="text-purple-300"
                                    />
                                }
                                showToggleButton={false}
                            />
                            <HorizontalShelf
                                items={madeForYouCards}
                                totalItems={madeForYouTotal}
                                onShowMore={() => toggleSection('madeForYou')}
                                onShowLess={() => toggleSection('madeForYou')}
                                onItemPlay={handleCardPlay}
                                onItemClick={(item) => {
                                    if (item.id.startsWith('pl-')) {
                                        const playlistId = item.id.replace('pl-', '');
                                        navigate(`/playlist/${playlistId}`);
                                    } else if (item.id.startsWith('song-')) {
                                        const artistName = item.subtitle;
                                        navigate(`/artist/${toArtistRouteId(artistName)}`);
                                    }
                                }}
                            />
                        </section>

                        <section>
                            <SectionTitle
                                title="Trending now"
                                subtitle="Popular picks rising across the platform"
                                icon={
                                    <TrendingUp
                                        size={20}
                                        className="text-pink-300"
                                    />
                                }
                                showToggleButton={false}
                            />
                            <HorizontalShelf
                                items={expandedSections.trendingNow
                                    ? (allTrendingCards.length > 0 ? allTrendingCards : [])
                                    : trendingNow}
                                totalItems={allTrendingCards.length || 0}
                                onShowMore={() => toggleSection('trendingNow')}
                                onShowLess={() => toggleSection('trendingNow')}
                                onItemPlay={handleCardPlay}
                                onItemClick={(item) => {
                                    if (item.id.startsWith('pl-')) {
                                        const playlistId = item.id.replace('pl-', '');
                                        navigate(`/playlist/${playlistId}`);
                                    } else if (item.id.startsWith('song-')) {
                                        const artistName = item.subtitle;
                                        navigate(`/artist/${toArtistRouteId(artistName)}`);
                                    }
                                }}
                            />
                        </section>

                        <section>
                            <SectionTitle
                                title="Recently added"
                                subtitle="Fresh playlists and latest updates"
                                icon={
                                    <Clock3
                                        size={20}
                                        className="text-cyan-300"
                                    />
                                }
                                showToggleButton={false}
                            />
                            <HorizontalShelf
                                items={expandedSections.recentlyAdded
                                    ? (allNewReleaseCards.length > 0 ? allNewReleaseCards : [])
                                    : recentlyAdded}
                                totalItems={allNewReleaseCards.length || 0}
                                onShowMore={() => toggleSection('recentlyAdded')}
                                onShowLess={() => toggleSection('recentlyAdded')}
                                onItemPlay={handleCardPlay}
                                onItemClick={(item) => {
                                    if (item.id.startsWith('pl-')) {
                                        const playlistId = item.id.replace('pl-', '');
                                        navigate(`/playlist/${playlistId}`);
                                    } else if (item.id.startsWith('song-')) {
                                        const artistName = item.subtitle;
                                        navigate(`/artist/${toArtistRouteId(artistName)}`);
                                    }
                                }}
                            />
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};
