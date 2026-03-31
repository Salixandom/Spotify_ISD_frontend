import React from "react";
import { Compass, Sparkles, Music2 } from "lucide-react";
import { searchAPI } from "../api/search";
import { DynamicMusicBackground } from "../components/ui/DynamicMusicBackground";

type BrowseCard = {
    id: string;
    title: string;
    subtitle: string;
    colorFrom: string;
    colorTo: string;
    imageUrl: string;
};

const PLACEHOLDER_BROWSE_CARDS: BrowseCard[] = [
    {
        id: "music",
        title: "Music",
        subtitle: "Global sounds & essentials",
        colorFrom: "#ff1f8f",
        colorTo: "#8a1aff",
        imageUrl:
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=500&fit=crop",
    },
    {
        id: "live-events",
        title: "Live Events",
        subtitle: "Shows near you",
        colorFrom: "#7c3aed",
        colorTo: "#ec4899",
        imageUrl:
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&h=500&fit=crop",
    },
    {
        id: "made-for-you",
        title: "Made For You",
        subtitle: "Personalized daily picks",
        colorFrom: "#2563eb",
        colorTo: "#7c3aed",
        imageUrl:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
    },
    {
        id: "new-releases",
        title: "New Releases",
        subtitle: "Fresh drops every week",
        colorFrom: "#65a30d",
        colorTo: "#0ea5e9",
        imageUrl:
            "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?w=500&h=500&fit=crop",
    },
    {
        id: "desi",
        title: "Desi",
        subtitle: "Top hits from South Asia",
        colorFrom: "#f97316",
        colorTo: "#ef4444",
        imageUrl:
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&h=500&fit=crop",
    },
    {
        id: "pop",
        title: "Pop",
        subtitle: "Trending hooks & charts",
        colorFrom: "#38bdf8",
        colorTo: "#2563eb",
        imageUrl:
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=500&fit=crop",
    },
    {
        id: "summer",
        title: "Summer",
        subtitle: "Warm vibes & beach anthems",
        colorFrom: "#22c55e",
        colorTo: "#14b8a6",
        imageUrl:
            "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=500&h=500&fit=crop",
    },
    {
        id: "hiphop",
        title: "Hip-Hop",
        subtitle: "Rap, trap, and drill",
        colorFrom: "#0ea5e9",
        colorTo: "#334155",
        imageUrl:
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop",
    },
    {
        id: "charts",
        title: "Charts",
        subtitle: "What the world is playing",
        colorFrom: "#a855f7",
        colorTo: "#3b82f6",
        imageUrl:
            "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&h=500&fit=crop",
    },
    {
        id: "educational",
        title: "Educational",
        subtitle: "Learn while you listen",
        colorFrom: "#06b6d4",
        colorTo: "#7c3aed",
        imageUrl:
            "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&h=500&fit=crop",
    },
    {
        id: "documentary",
        title: "Documentary",
        subtitle: "True stories in audio",
        colorFrom: "#64748b",
        colorTo: "#334155",
        imageUrl:
            "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500&h=500&fit=crop",
    },
    {
        id: "comedy",
        title: "Comedy",
        subtitle: "Stand-up & good laughs",
        colorFrom: "#d946ef",
        colorTo: "#f43f5e",
        imageUrl:
            "https://images.unsplash.com/photo-1503095396549-807759245b35?w=500&h=500&fit=crop",
    },
    {
        id: "pop-culture",
        title: "Pop Culture",
        subtitle: "Trends, takes, and talk",
        colorFrom: "#ec4899",
        colorTo: "#f59e0b",
        imageUrl:
            "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&h=500&fit=crop",
    },
    {
        id: "rock",
        title: "Rock",
        subtitle: "Legends and modern riffs",
        colorFrom: "#0f766e",
        colorTo: "#22c55e",
        imageUrl:
            "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=500&h=500&fit=crop",
    },
    {
        id: "latin",
        title: "Latin",
        subtitle: "Reggaeton, salsa, urbano",
        colorFrom: "#3b82f6",
        colorTo: "#06b6d4",
        imageUrl:
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop",
    },
    {
        id: "electronic",
        title: "Dance / Electronic",
        subtitle: "Festival-ready energy",
        colorFrom: "#0ea5e9",
        colorTo: "#9333ea",
        imageUrl:
            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=500&fit=crop",
    },
    {
        id: "mood",
        title: "Mood",
        subtitle: "For every feeling",
        colorFrom: "#f43f5e",
        colorTo: "#8b5cf6",
        imageUrl:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop",
    },
    {
        id: "discover",
        title: "Discover",
        subtitle: "Hidden gems & surprises",
        colorFrom: "#8b5cf6",
        colorTo: "#ec4899",
        imageUrl:
            "https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?w=500&h=500&fit=crop",
    },
    {
        id: "indie",
        title: "Indie",
        subtitle: "Independent & alternative",
        colorFrom: "#ef4444",
        colorTo: "#f59e0b",
        imageUrl:
            "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&h=500&fit=crop",
    },
    {
        id: "workout",
        title: "Workout",
        subtitle: "Push harder playlists",
        colorFrom: "#64748b",
        colorTo: "#0ea5e9",
        imageUrl:
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&h=500&fit=crop",
    },
    {
        id: "country",
        title: "Country",
        subtitle: "Roadtrip favorites",
        colorFrom: "#f97316",
        colorTo: "#84cc16",
        imageUrl:
            "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&h=500&fit=crop",
    },
    {
        id: "rnb",
        title: "R&B",
        subtitle: "Smooth & soulful",
        colorFrom: "#d97706",
        colorTo: "#f97316",
        imageUrl:
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&h=500&fit=crop",
    },
    {
        id: "kpop",
        title: "K-pop",
        subtitle: "Global idol hits",
        colorFrom: "#f43f5e",
        colorTo: "#8b5cf6",
        imageUrl:
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&h=500&fit=crop",
    },
    {
        id: "chill",
        title: "Chill",
        subtitle: "Laid-back listening",
        colorFrom: "#f59e0b",
        colorTo: "#3b82f6",
        imageUrl:
            "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?w=500&h=500&fit=crop",
    },
    {
        id: "sleep",
        title: "Sleep",
        subtitle: "Deep rest soundscapes",
        colorFrom: "#1e3a8a",
        colorTo: "#312e81",
        imageUrl:
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&h=500&fit=crop",
    },
];

function titleCase(value: string): string {
    return value
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapBrowseStringsToCards(categories: string[]): BrowseCard[] {
    if (!categories.length) return [];

    return categories.map((category, idx) => {
        const base =
            PLACEHOLDER_BROWSE_CARDS[idx % PLACEHOLDER_BROWSE_CARDS.length];
        return {
            id: `live-${category}-${idx}`,
            title: titleCase(category),
            subtitle: `Explore ${titleCase(category)} picks`,
            colorFrom: base.colorFrom,
            colorTo: base.colorTo,
            imageUrl: base.imageUrl,
        };
    });
}

const BrowseCard: React.FC<{ card: BrowseCard }> = ({ card }) => {
    return (
        <button
            type="button"
            className="group relative h-[168px] rounded-2xl overflow-hidden text-left
                border border-white/12 bg-white/[0.06] backdrop-blur-2xl
                shadow-[0_4px_20px_rgba(0,0,0,0.25)]
                hover:scale-[1.02] hover:border-white/22 hover:bg-white/[0.10]
                hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                transition-all duration-300"
            title={card.title}
        >
            {/* Subtle color tint overlay — same as SearchPage */}
            <div
                className="absolute inset-0 opacity-30 group-hover:opacity-45 transition-opacity duration-300"
                style={{ background: `linear-gradient(130deg, ${card.colorFrom}, ${card.colorTo})` }}
            />
            {/* Soft sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/5" />

            <div className="relative z-10 p-5 h-full flex flex-col">
                <h3 className="text-white text-[26px] md:text-[24px] leading-none font-extrabold tracking-tight drop-shadow-md">
                    {card.title}
                </h3>
                <p className="mt-2 text-white/70 text-sm font-medium">
                    {card.subtitle}
                </p>

                <div className="mt-auto flex justify-end">
                    <div className="w-26 h-26 rounded-lg overflow-hidden rotate-[22deg] translate-x-6 translate-y-3
                        shadow-xl border border-white/15 opacity-80 group-hover:opacity-100
                        group-hover:scale-110 transition-all duration-500">
                        <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </button>
    );
};

const BrowseSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="h-[168px] rounded-2xl bg-white/[0.08] border border-white/10 animate-pulse"
                />
            ))}
        </div>
    );
};

export const BrowsePage: React.FC = () => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [categories, setCategories] = React.useState<string[]>([]);
    const [hasApiError, setHasApiError] = React.useState(false);

    React.useEffect(() => {
        let isMounted = true;

        const loadBrowse = async () => {
            setIsLoading(true);
            setHasApiError(false);

            try {
                const data = await searchAPI.browse();
                if (!isMounted) return;
                setCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(
                    "Browse API unavailable, using placeholders:",
                    error,
                );
                if (!isMounted) return;
                setHasApiError(true);
                setCategories([]);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadBrowse();

        return () => {
            isMounted = false;
        };
    }, []);

    const liveCards = React.useMemo(
        () => mapBrowseStringsToCards(categories),
        [categories],
    );
    const cards = liveCards.length > 0 ? liveCards : PLACEHOLDER_BROWSE_CARDS;

    return (
        <div className="relative min-h-full">
            <DynamicMusicBackground />

            <div className="relative z-10 p-6 md:p-8">
                {/* Header */}
                <header
                    className="mb-8 rounded-2xl border border-white/12 bg-white/[0.055] backdrop-blur-2xl
                    shadow-[0_10px_30px_rgba(0,0,0,0.28)] px-5 py-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/12 border border-white/20 flex items-center justify-center">
                            <Compass size={19} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
                                Browse all
                            </h1>
                            <p className="text-white/70 text-sm md:text-base mt-1">
                                Explore genres, moods, moments, and colorful
                                worlds of music.
                            </p>
                        </div>
                    </div>

                    {!hasApiError && liveCards.length > 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border border-spotify-green/35 bg-spotify-green/12 text-emerald-100 backdrop-blur-xl">
                            <Sparkles size={13} />
                            Live browse categories loaded
                        </div>
                    )}
                </header>

                {/* Massive colorful grid */}
                {isLoading ? (
                    <BrowseSkeleton />
                ) : (
                    <section>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                            {cards.map((card) => (
                                <BrowseCard key={card.id} card={card} />
                            ))}
                        </div>

                        {/* Extra premium footer note */}
                        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-4 py-3 inline-flex items-center gap-2">
                            <Music2 size={16} className="text-white/70" />
                            <span className="text-white/70 text-sm">
                                Pro tip: Use the top search bar to jump directly
                                to a vibe.
                            </span>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default BrowsePage;
