import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, Shuffle, MoreHorizontal, Clock3 } from "lucide-react";
import { DynamicMusicBackground } from "../components/ui/DynamicMusicBackground";

type ArtistTrack = {
    id: string;
    title: string;
    plays: string;
    duration: string;
    imageUrl: string;
};

type ArtistRelease = {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
};

type FeaturedPlaylist = {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
};

type ArtistPageData = {
    id: string;
    name: string;
    monthlyListeners: string;
    headerImageUrl: string;
    verifiedLabel: string;
    popularTracks: ArtistTrack[];
    releases: ArtistRelease[];
    featuredPlaylists: FeaturedPlaylist[];
};

const WEEKND_HEADER =
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1800&h=900&fit=crop";

const WEEKND_COVERS = [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=600&h=600&fit=crop",
];

const PLACEHOLDER_ARTISTS: Record<string, ArtistPageData> = {
    "the-weeknd": {
        id: "the-weeknd",
        name: "The Weeknd",
        monthlyListeners: "115,435,057 monthly listeners",
        headerImageUrl: WEEKND_HEADER,
        verifiedLabel: "Verified Artist",
        popularTracks: [
            { id: "w1", title: "One Of The Girls (with JENNIE, Lily Rose Depp)", plays: "2,551,864,791", duration: "4:04", imageUrl: WEEKND_COVERS[0] },
            { id: "w2", title: "Starboy", plays: "4,452,532,169", duration: "3:50", imageUrl: WEEKND_COVERS[1] },
            { id: "w3", title: "Timeless (feat Playboi Carti)", plays: "1,459,397,399", duration: "4:16", imageUrl: WEEKND_COVERS[2] },
            { id: "w4", title: "Blinding Lights", plays: "5,349,188,592", duration: "3:20", imageUrl: WEEKND_COVERS[3] },
            { id: "w5", title: "Die For You", plays: "3,208,634,588", duration: "4:20", imageUrl: WEEKND_COVERS[4] },
        ],
        releases: [
            { id: "r1", title: "Hurry Up Tomorrow", subtitle: "2025 • Album", imageUrl: WEEKND_COVERS[5] },
            { id: "r2", title: "After Hours", subtitle: "2020 • Album", imageUrl: WEEKND_COVERS[6] },
            { id: "r3", title: "Starboy", subtitle: "2016 • Album", imageUrl: WEEKND_COVERS[7] },
            { id: "r4", title: "Beauty Behind The Madness", subtitle: "2015 • Album", imageUrl: WEEKND_COVERS[8] },
            { id: "r5", title: "My Dear Melancholy,", subtitle: "2018 • Album", imageUrl: WEEKND_COVERS[1] },
            { id: "r6", title: "Dawn FM", subtitle: "2022 • Album", imageUrl: WEEKND_COVERS[2] },
        ],
        featuredPlaylists: [
            { id: "f1", title: "This Is The Weeknd", subtitle: "The essential tracks from The Weeknd.", imageUrl: WEEKND_COVERS[0] },
            { id: "f2", title: "The Weeknd Radio", subtitle: "With Doja Cat, Drake, and Ariana Grande.", imageUrl: WEEKND_COVERS[2] },
            { id: "f3", title: "Today’s Top Hits", subtitle: "The hottest 50. Cover: Dominic Fike", imageUrl: WEEKND_COVERS[3] },
            { id: "f4", title: "Top Gaming Tracks", subtitle: "Press play, press start.", imageUrl: WEEKND_COVERS[4] },
            { id: "f5", title: "All Out 2010s", subtitle: "The biggest songs of the 2010s.", imageUrl: WEEKND_COVERS[6] },
        ],
    },
};

function getFallbackArtist(id: string): ArtistPageData {
    const displayName = id
        .split("-")
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" ");

    return {
        ...PLACEHOLDER_ARTISTS["the-weeknd"],
        id,
        name: displayName || "Unknown Artist",
        monthlyListeners: "Placeholder monthly listeners",
    };
}

async function fetchArtistPlaceholder(id: string): Promise<ArtistPageData> {
    // TODO: Replace with real API once available.
    // Example future integration:
    // const response = await artistAPI.getById(id);
    // return mapArtistApiResponse(response);
    return PLACEHOLDER_ARTISTS[id] ?? getFallbackArtist(id);
}

export const ArtistPage: React.FC = () => {
    const { id = "the-weeknd" } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [artist, setArtist] = React.useState<ArtistPageData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setIsLoading(true);
            const data = await fetchArtistPlaceholder(id);
            if (isMounted) {
                setArtist(data);
                setIsLoading(false);
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [id]);

    if (isLoading || !artist) {
        return (
            <div className="relative min-h-full p-6 md:p-8">
                <DynamicMusicBackground />
                <div className="relative z-10 animate-pulse space-y-4">
                    <div className="h-56 rounded-2xl bg-white/[0.08] border border-white/10" />
                    <div className="h-8 w-64 rounded bg-white/[0.08]" />
                    <div className="h-24 rounded-xl bg-white/[0.06] border border-white/10" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-full pb-10" aria-label="Artist page">
            <DynamicMusicBackground />

            <div className="relative z-10">
                <section className="relative h-[340px] md:h-[400px] overflow-hidden rounded-b-2xl border-b border-white/10">
                    <img
                        src={artist.headerImageUrl}
                        alt={artist.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/40 to-[#152765]/90" />

                    <div className="absolute left-5 right-5 bottom-6">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/70 font-semibold mb-2">
                            {artist.verifiedLabel}
                        </p>
                        <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight leading-none">
                            {artist.name}
                        </h1>
                        <p className="text-white/80 text-sm md:text-base mt-3">
                            {artist.monthlyListeners}
                        </p>
                    </div>
                </section>

                <div className="px-5 md:px-8 pt-6 space-y-10">
                    <section>
                        <div className="flex items-center gap-3 mb-5">
                            <button className="w-14 h-14 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-[0_10px_24px_rgba(30,185,84,0.45)] hover:scale-105 transition-transform">
                                <Play size={22} fill="currentColor" />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-white/25 bg-white/[0.05] text-white/80 hover:text-white hover:bg-white/[0.10] transition-colors flex items-center justify-center">
                                <Shuffle size={17} />
                            </button>
                            <button className="px-4 py-1.5 rounded-full border border-white/25 bg-white/[0.05] text-white text-sm font-semibold hover:bg-white/[0.10] transition-colors">
                                Following
                            </button>
                            <button className="w-10 h-10 rounded-full text-white/70 hover:text-white hover:bg-white/[0.10] transition-colors flex items-center justify-center">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        <h2 className="text-white text-3xl font-bold tracking-tight mb-4">Popular</h2>
                        <div className="rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-2xl overflow-hidden">
                            <div className="px-4 py-2 border-b border-white/10 text-xs uppercase tracking-wider text-white/45 grid grid-cols-[36px_1.5fr_1fr_48px] gap-3">
                                <span>#</span>
                                <span>Title</span>
                                <span>Plays</span>
                                <span className="flex items-center justify-end"><Clock3 size={13} /></span>
                            </div>

                            {artist.popularTracks.map((track, index) => (
                                <button
                                    key={track.id}
                                    className="w-full text-left px-4 py-2.5 grid grid-cols-[36px_1.5fr_1fr_48px] gap-3 items-center border-b last:border-b-0 border-white/8 hover:bg-white/[0.08] transition-colors"
                                >
                                    <span className="text-white/55 text-sm tabular-nums">{index + 1}</span>
                                    <span className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={track.imageUrl}
                                            alt={track.title}
                                            className="w-10 h-10 rounded-md object-cover border border-white/10 shrink-0"
                                        />
                                        <span className="min-w-0">
                                            <span className="text-white text-sm font-semibold truncate block">{track.title}</span>
                                        </span>
                                    </span>
                                    <span className="text-white/50 text-sm tabular-nums">{track.plays}</span>
                                    <span className="text-white/45 text-sm text-right tabular-nums">{track.duration}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white text-3xl font-bold tracking-tight">Discography</h2>
                            <button className="text-sm text-white/65 hover:text-white transition-colors">Show all</button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-5">
                            {["Popular releases", "Albums", "Singles and EPs", "Compilations"].map((tab, idx) => (
                                <button
                                    key={tab}
                                    className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
                                        idx === 0
                                            ? "bg-white text-black border-white"
                                            : "bg-white/[0.07] text-white/80 border-white/14 hover:text-white"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <div className="flex gap-4 w-max">
                                {artist.releases.map((release) => (
                                    <button
                                        key={release.id}
                                        className="w-[184px] text-left rounded-2xl border border-white/12 bg-white/[0.05] p-2.5 hover:bg-white/[0.10] transition-colors"
                                    >
                                        <img
                                            src={release.imageUrl}
                                            alt={release.title}
                                            className="w-full aspect-square rounded-xl object-cover border border-white/12"
                                        />
                                        <p className="text-white font-semibold mt-2 text-[16px] leading-tight line-clamp-2">
                                            {release.title}
                                        </p>
                                        <p className="text-white/60 text-sm mt-1">{release.subtitle}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-white text-3xl font-bold tracking-tight mb-4">Featuring {artist.name}</h2>
                        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <div className="flex gap-4 w-max">
                                {artist.featuredPlaylists.map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        onClick={() => navigate(`/search?q=${encodeURIComponent(artist.name)}`)}
                                        className="w-[184px] text-left rounded-2xl border border-white/12 bg-white/[0.05] p-2.5 hover:bg-white/[0.10] transition-colors"
                                    >
                                        <img
                                            src={playlist.imageUrl}
                                            alt={playlist.title}
                                            className="w-full aspect-square rounded-xl object-cover border border-white/12"
                                        />
                                        <p className="text-white font-semibold mt-2 text-[16px] leading-tight line-clamp-2">
                                            {playlist.title}
                                        </p>
                                        <p className="text-white/60 text-sm mt-1 line-clamp-2">
                                            {playlist.subtitle}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ArtistPage;
