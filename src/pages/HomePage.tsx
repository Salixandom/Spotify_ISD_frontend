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
import { DynamicMusicBackground } from "../components/ui/DynamicMusicBackground";
import type { Playlist } from "../types";
import { getDemoPlaylistRoute } from "../utils/playlistRoutes";

/**
 * Spotify-inspired homepage:
 * - API-first data source (playlists)
 * - graceful placeholder fallback when API is unavailable/empty
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
};

const PLACEHOLDER_COVERS = [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=600&h=600&fit=crop",
];

const PLACEHOLDER_QUICK_ACCESS: HomeCard[] = [
    {
        id: "qa-1",
        title: "Daily Lift",
        subtitle: "Your energy booster mix",
        imageUrl: PLACEHOLDER_COVERS[0],
        accentFrom: "#1db954",
        accentTo: "#0d6b30",
        kind: "daily",
    },
    {
        id: "qa-2",
        title: "Midnight Echo",
        subtitle: "Late-night synth glow",
        imageUrl: PLACEHOLDER_COVERS[1],
        accentFrom: "#8b5cf6",
        accentTo: "#4c1d95",
        kind: "mix",
    },
    {
        id: "qa-3",
        title: "Focus Bloom",
        subtitle: "Deep work soundscape",
        imageUrl: PLACEHOLDER_COVERS[2],
        accentFrom: "#06b6d4",
        accentTo: "#0e7490",
        kind: "focus",
    },
    {
        id: "qa-4",
        title: "Indie Horizon",
        subtitle: "Fresh indie discoveries",
        imageUrl: PLACEHOLDER_COVERS[3],
        accentFrom: "#f97316",
        accentTo: "#9a3412",
        kind: "playlist",
    },
    {
        id: "qa-5",
        title: "Retro Nights",
        subtitle: "Neon city throwbacks",
        imageUrl: PLACEHOLDER_COVERS[4],
        accentFrom: "#ec4899",
        accentTo: "#9d174d",
        kind: "mix",
    },
    {
        id: "qa-6",
        title: "Lo-Fi Station",
        subtitle: "Calm beats, soft rain",
        imageUrl: PLACEHOLDER_COVERS[5],
        accentFrom: "#84cc16",
        accentTo: "#3f6212",
        kind: "focus",
    },
    {
        id: "qa-7",
        title: "Road Pulse",
        subtitle: "Drive-time essentials",
        imageUrl: PLACEHOLDER_COVERS[6],
        accentFrom: "#ef4444",
        accentTo: "#7f1d1d",
        kind: "playlist",
    },
    {
        id: "qa-8",
        title: "Bedroom Pop",
        subtitle: "Sweet and dreamy picks",
        imageUrl: PLACEHOLDER_COVERS[7],
        accentFrom: "#3b82f6",
        accentTo: "#1e3a8a",
        kind: "daily",
    },
];

const PLACEHOLDER_MADE_FOR_YOU: HomeCard[] = [
    {
        id: "mfy-1",
        title: "Your Top Replay",
        subtitle: "Built from your vibe",
        imageUrl: PLACEHOLDER_COVERS[2],
        accentFrom: "#22c55e",
        accentTo: "#166534",
        kind: "daily",
    },
    {
        id: "mfy-2",
        title: "Sunset Sessions",
        subtitle: "Warm, melodic, floating",
        imageUrl: PLACEHOLDER_COVERS[6],
        accentFrom: "#f59e0b",
        accentTo: "#92400e",
        kind: "mix",
    },
    {
        id: "mfy-3",
        title: "Night Drive",
        subtitle: "Neon and basslines",
        imageUrl: PLACEHOLDER_COVERS[1],
        accentFrom: "#a855f7",
        accentTo: "#581c87",
        kind: "playlist",
    },
    {
        id: "mfy-4",
        title: "Soft Focus",
        subtitle: "Instrumental flow state",
        imageUrl: PLACEHOLDER_COVERS[5],
        accentFrom: "#14b8a6",
        accentTo: "#134e4a",
        kind: "focus",
    },
    {
        id: "mfy-5",
        title: "Blue Hour",
        subtitle: "Chill alt-electronica",
        imageUrl: PLACEHOLDER_COVERS[0],
        accentFrom: "#60a5fa",
        accentTo: "#1e3a8a",
        kind: "mix",
    },
    {
        id: "mfy-6",
        title: "Rhythm Theory",
        subtitle: "Percussive and punchy",
        imageUrl: PLACEHOLDER_COVERS[4],
        accentFrom: "#f43f5e",
        accentTo: "#881337",
        kind: "playlist",
    },
];

const PLACEHOLDER_TRENDING: HomeCard[] = [
    {
        id: "tr-1",
        title: "Trending Global",
        subtitle: "What everyone is spinning",
        imageUrl: PLACEHOLDER_COVERS[7],
        accentFrom: "#fb7185",
        accentTo: "#9f1239",
        kind: "playlist",
    },
    {
        id: "tr-2",
        title: "Viral Rhythms",
        subtitle: "Fast-rising tracks",
        imageUrl: PLACEHOLDER_COVERS[3],
        accentFrom: "#34d399",
        accentTo: "#065f46",
        kind: "mix",
    },
    {
        id: "tr-3",
        title: "Chart Climbers",
        subtitle: "This week’s hottest",
        imageUrl: PLACEHOLDER_COVERS[1],
        accentFrom: "#38bdf8",
        accentTo: "#0c4a6e",
        kind: "playlist",
    },
    {
        id: "tr-4",
        title: "Fresh Finds",
        subtitle: "Breaking this month",
        imageUrl: PLACEHOLDER_COVERS[6],
        accentFrom: "#a3e635",
        accentTo: "#365314",
        kind: "daily",
    },
    {
        id: "tr-5",
        title: "Pulse Radar",
        subtitle: "Live trend monitor",
        imageUrl: PLACEHOLDER_COVERS[4],
        accentFrom: "#c084fc",
        accentTo: "#6b21a8",
        kind: "mix",
    },
    {
        id: "tr-6",
        title: "Up Next",
        subtitle: "Tomorrow’s favorites",
        imageUrl: PLACEHOLDER_COVERS[0],
        accentFrom: "#f97316",
        accentTo: "#7c2d12",
        kind: "playlist",
    },
];

const PLACEHOLDER_RECENT: HomeCard[] = [
    {
        id: "rc-1",
        title: "New in Library",
        subtitle: "Recently saved sounds",
        imageUrl: PLACEHOLDER_COVERS[5],
        accentFrom: "#2dd4bf",
        accentTo: "#0f766e",
        kind: "playlist",
    },
    {
        id: "rc-2",
        title: "Quick Picks",
        subtitle: "Fresh daily updates",
        imageUrl: PLACEHOLDER_COVERS[2],
        accentFrom: "#22d3ee",
        accentTo: "#155e75",
        kind: "daily",
    },
    {
        id: "rc-3",
        title: "After Hours",
        subtitle: "Late evening textures",
        imageUrl: PLACEHOLDER_COVERS[1],
        accentFrom: "#818cf8",
        accentTo: "#312e81",
        kind: "mix",
    },
    {
        id: "rc-4",
        title: "Acoustic Corner",
        subtitle: "Unplugged and intimate",
        imageUrl: PLACEHOLDER_COVERS[3],
        accentFrom: "#f59e0b",
        accentTo: "#78350f",
        kind: "focus",
    },
    {
        id: "rc-5",
        title: "Bassline Lab",
        subtitle: "Experimental low-end",
        imageUrl: PLACEHOLDER_COVERS[7],
        accentFrom: "#f43f5e",
        accentTo: "#881337",
        kind: "playlist",
    },
    {
        id: "rc-6",
        title: "Cosmic Drift",
        subtitle: "Ambient & atmospheric",
        imageUrl: PLACEHOLDER_COVERS[0],
        accentFrom: "#a78bfa",
        accentTo: "#4c1d95",
        kind: "mix",
    },
];

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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
                PLACEHOLDER_COVERS[index % PLACEHOLDER_COVERS.length],
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
}> = ({ title, icon, subtitle }) => {
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
            <button
                className="text-white/60 text-sm font-semibold hover:text-white transition-colors
                rounded-full border border-white/15 bg-white/[0.04] px-3 py-1"
            >
                Show all
            </button>
        </div>
    );
};

const QuickTile: React.FC<{ item: HomeCard; onClick?: () => void }> = ({ item, onClick }) => {
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
                <div className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="w-9 h-9 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-xl shadow-spotify-green/30">
                        <Play size={16} fill="currentColor" />
                    </div>
                </div>
                <div className="absolute top-2 right-2 text-white/30 group-hover:text-white/60 transition-colors">
                    <Icon size={14} />
                </div>
            </div>
        </button>
    );
};

const ShelfCard: React.FC<{ item: HomeCard; onClick?: () => void }> = ({ item, onClick }) => {
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
                <div className="absolute right-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-lg shadow-spotify-green/30">
                        <Play size={16} fill="currentColor" />
                    </div>
                </div>
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

const HorizontalShelf: React.FC<{ items: HomeCard[]; onCardClick?: () => void }> = ({ items, onCardClick }) => {
    return (
        <div className="overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3 w-max">
                {items.map((item) => (
                    <ShelfCard key={item.id} item={item} onClick={onCardClick} />
                ))}
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
    const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
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
        "Ready to liven up your day?",
        "Let the music set your mood 🎧",
        "Your vibe starts here.",
        "Hit play and escape the noise.",
        "Fresh beats waiting for you.",
        "Turn up the volume on life.",
        "Discover something new today.",
        "Your soundtrack begins now.",
        "Feel the rhythm, feel alive.",
        "Music that matches your mood.",
        "Press play. Everything else can wait.",
        "Find your next favorite track.",
        "Let the beats carry you.",
        "Good vibes only from here.",
        "Where your music journey begins.",
        "Soundtrack your moment.",
        "Every day deserves great music.",
        "Dive into your vibe.",
    ];
    
    const randomMessage = React.useMemo(() => {
        return messages[Math.floor(Math.random() * messages.length)];
    }, []);

    React.useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setIsLoading(true);
            //setHasApiError(false);

            try {
                const data = await playlistAPI.list();
                if (!isMounted) return;
                setPlaylists(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load home playlists:", error);
                if (!isMounted) return;
                //setHasApiError(true);
                setPlaylists([]);
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
    const apiCards = React.useMemo(
        () => mapPlaylistsToCards(playlists),
        [playlists],
    );
    const hasRealData = apiCards.length > 0;

    const openDemoPlaylist = React.useCallback(() => {
        navigate(getDemoPlaylistRoute());
    }, [navigate]);

    const quickAccess = hasRealData
        ? apiCards.slice(0, 8)
        : PLACEHOLDER_QUICK_ACCESS;
    const madeForYou = hasRealData
        ? apiCards.slice(0, 12)
        : PLACEHOLDER_MADE_FOR_YOU;
    const trendingNow = hasRealData
        ? [...apiCards].reverse().slice(0, 12)
        : PLACEHOLDER_TRENDING;
    const recentlyAdded = hasRealData
        ? [...apiCards]
              .sort((a, b) => a.title.localeCompare(b.title))
              .slice(0, 12)
        : PLACEHOLDER_RECENT;

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
                        {greeting}, {displayName}
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
                                icon={
                                    <Sparkles
                                        size={20}
                                        className="text-spotify-green"
                                    />
                                }
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                                {quickAccess.map((item) => (
                                    <QuickTile key={item.id} item={item} onClick={openDemoPlaylist} />
                                ))}
                            </div>
                        </section>

                        {/* Shelves */}
                        <section>
                            <SectionTitle
                                title="Made for you"
                                subtitle="A personalized stream based on your listening patterns"
                                icon={
                                    <Disc3
                                        size={20}
                                        className="text-purple-300"
                                    />
                                }
                            />
                            <HorizontalShelf items={madeForYou} onCardClick={openDemoPlaylist} />
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
                            />
                            <HorizontalShelf items={trendingNow} onCardClick={openDemoPlaylist} />
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
                            />
                            <HorizontalShelf items={recentlyAdded} onCardClick={openDemoPlaylist} />
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};
