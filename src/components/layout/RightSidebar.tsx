import React from "react";
import { PlusCircle, ExternalLink } from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";

type ArtistInfo = {
    name: string;
    monthlyListeners: string;
    imageUrl: string;
    bio: string;
};

const PLACEHOLDER_SONG = {
    title: "Ural Debo Akashe",
    artist: "Ayub Bachchu",
    coverUrl:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=1200&fit=crop",
};

const PLACEHOLDER_ARTIST: ArtistInfo = {
    name: "Ayub Bachchu",
    monthlyListeners: "46,717 monthly listeners",
    imageUrl:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&h=900&fit=crop",
    bio: "Ayub Bachchu (16 August 1962 – 18 October 2018) was a Bangladeshi rock guitarist, composer, singer, and songwriter. He was one of the most influential rock figures in South Asian music.",
};

const GlassPanel: React.FC<{
    title: string;
    children: React.ReactNode;
    className?: string;
}> = ({ title, children, className = "" }) => {
    return (
        <section
            className={`rounded-2xl border border-white/14 bg-white/[0.06] backdrop-blur-2xl
            shadow-[0_8px_28px_rgba(0,0,0,0.35)] overflow-hidden ${className}`}
        >
            <header className="px-4 py-3 border-b border-white/12">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
            </header>
            {children}
        </section>
    );
};

export const RightSidebar: React.FC = () => {
    const { currentTrack } = usePlayerStore();

    const songTitle = currentTrack?.song?.title || PLACEHOLDER_SONG.title;
    const songArtist = currentTrack?.song?.artist || PLACEHOLDER_SONG.artist;
    const songCover =
        currentTrack?.song?.cover_url || PLACEHOLDER_SONG.coverUrl;

    const artistName = currentTrack?.song?.artist || PLACEHOLDER_ARTIST.name;
    const artistInfo: ArtistInfo = {
        ...PLACEHOLDER_ARTIST,
        name: artistName,
    };

    return (
        <aside
            className="h-full w-full p-2 md:p-3 bg-transparent flex flex-col gap-3"
            aria-label="Now playing info panel"
        >
            {/* Now Playing block */}
            <GlassPanel title="Now playing">
                <div className="p-4">
                    <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-black/25 border border-white/10">
                        <img
                            src={songCover}
                            alt={songTitle}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>

                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h4 className="text-white text-[30px] leading-tight font-extrabold truncate">
                                {songTitle}
                            </h4>
                            <p className="text-white/70 text-sm mt-1 truncate">
                                {songArtist}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="text-white/60 hover:text-white transition-colors mt-1"
                            aria-label="Add current song to library"
                            title="Add to library"
                        >
                            <PlusCircle size={18} />
                        </button>
                    </div>
                </div>
            </GlassPanel>

            {/* Artist block */}
            <GlassPanel
                title="About the artist"
                className="flex-1 flex flex-col min-h-0"
            >
                <div className="relative h-44 bg-black/20">
                    <img
                        src={artistInfo.imageUrl}
                        alt={artistInfo.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="text-white font-bold text-3xl leading-tight truncate">
                            {artistInfo.name}
                        </h4>
                    </div>
                </div>

                <div className="p-4 flex-1 min-h-0 flex flex-col">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-white/70 text-sm">
                            {artistInfo.monthlyListeners}
                        </p>
                        <button
                            type="button"
                            className="px-3.5 py-1.5 rounded-full border border-white/30
                            text-white text-xs font-semibold hover:border-white/55 hover:bg-white/10 transition-colors"
                        >
                            Follow
                        </button>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-3 overflow-y-auto max-h-[220px]">
                        <p className="text-white/70 text-sm leading-relaxed">
                            {artistInfo.bio}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="mt-auto pt-4 text-xs text-white/60 hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                        View full profile <ExternalLink size={12} />
                    </button>
                </div>
            </GlassPanel>
        </aside>
    );
};

export default RightSidebar;
