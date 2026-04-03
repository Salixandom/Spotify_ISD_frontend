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

export const RightSidebar: React.FC = () => {
    const { currentTrack } = usePlayerStore();

    const songTitle = currentTrack?.song?.title || PLACEHOLDER_SONG.title;
    const songArtist = currentTrack?.song?.artist || PLACEHOLDER_SONG.artist;
    const songCover =
        currentTrack?.song?.cover_url || PLACEHOLDER_SONG.coverUrl;

    const artistName = currentTrack?.song?.artist || PLACEHOLDER_ARTIST.name;
    const artistInfo: ArtistInfo = {
        ...PLACEHOLDER_ARTIST,
        name: String(artistName),
    };

    return (
        <aside
            className="h-full w-full p-3 bg-transparent flex flex-col"
            aria-label="Now playing info panel"
        >
            {/* Content directly on outer panel (no inner rectangle) */}
            <div className="px-1 pt-1 pb-2">
                <h3 className="text-sm font-semibold text-white">
                    Now playing
                </h3>
            </div>

            <div className="px-1 pb-4">
                <div className="aspect-square rounded-xl overflow-hidden mb-4 border border-white/12 bg-transparent">
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
                            {String(songArtist)}
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

            <div className="h-px bg-white/12 my-1" />

            <div className="px-1 pt-2 pb-2">
                <h3 className="text-sm font-semibold text-white">
                    About the artist
                </h3>
            </div>

            <div className="relative h-44 rounded-xl overflow-hidden">
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

            <div className="pt-4 flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-white/70 text-sm">
                        {artistInfo.monthlyListeners}
                    </p>
                    <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-full border border-white/30 text-white text-xs font-semibold hover:border-white/55 hover:bg-white/10 transition-colors"
                    >
                        Follow
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[220px] pr-1">
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
        </aside>
    );
};

export default RightSidebar;
