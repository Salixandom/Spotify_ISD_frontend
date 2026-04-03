import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MoreHorizontal, Clock3, Plus, Check } from "lucide-react";
import { DynamicMusicBackground } from "../components/ui/DynamicMusicBackground";
import { TrackRowSkeleton } from "../components/ui/LoadingSkeleton";
import { searchAPI } from "../api/search";
import { playlistAPI } from "../api/playlists";
import { trackAPI } from "../api/tracks";
import { TrackContextMenu } from "../components/modals/TrackContextMenu";
import { getArtistName, getAlbumName } from "../utils/trackHelpers";
import type { Playlist, PlaylistTrack } from "../types";
import toast from "react-hot-toast";

type ArtistTrack = {
    id: string;
    title: string;
    artist: string;
    album: string;
    plays: string;
    duration: string;
    imageUrl: string;
    songId: number; // Store the actual song ID for API calls
};

type ArtistRelease = {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
};

type ArtistAlbum = {
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
    albums: ArtistAlbum[];
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
            { id: "w1", songId: 1, title: "One Of The Girls (with JENNIE, Lily Rose Depp)", artist: "The Weeknd", album: "The Idol", plays: "2,551,864,791", duration: "4:04", imageUrl: WEEKND_COVERS[0] },
            { id: "w2", songId: 2, title: "Starboy", artist: "The Weeknd", album: "Starboy", plays: "4,452,532,169", duration: "3:50", imageUrl: WEEKND_COVERS[1] },
            { id: "w3", songId: 3, title: "Timeless (feat Playboi Carti)", artist: "The Weeknd", album: "Hurry Up Tomorrow", plays: "1,459,397,399", duration: "4:16", imageUrl: WEEKND_COVERS[2] },
            { id: "w4", songId: 4, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", plays: "5,349,188,592", duration: "3:20", imageUrl: WEEKND_COVERS[3] },
            { id: "w5", songId: 5, title: "Die For You", artist: "The Weeknd", album: "Beauty Behind The Madness", plays: "3,208,634,588", duration: "4:20", imageUrl: WEEKND_COVERS[4] },
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
        albums: [],
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
        albums: [],
    };
}

async function fetchArtistData(artistSlug: string): Promise<ArtistPageData> {
    try {
        // Fetch all artists to find the one matching the slug
        const allArtists = await searchAPI.searchArtists(''); // Empty string gets all artists

        // Find artist by comparing slugs
        const toSlug = (name: string) =>
            name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

        const matchingArtist = allArtists.find((a) => toSlug(a.name) === artistSlug);

        if (!matchingArtist) {
            console.warn('No artist found with slug:', artistSlug);
            console.log('Available artists:', allArtists.map(a => ({ name: a.name, slug: toSlug(a.name) })));
            throw new Error('Artist not found');
        }

        console.log('✅ Found artist:', matchingArtist.name, '(ID:', matchingArtist.id, ')');

        // Use the numeric ID to get full artist data
        const artist = await searchAPI.getArtist(matchingArtist.id);
        console.log('🎤 Full artist data:', artist);

        // Search for songs by this artist to get popular tracks
        const songs = await searchAPI.searchSongs({ q: artist.name });

        // Search for albums by this artist
        const albums = await searchAPI.searchAlbums(artist.name);
        console.log('📀 Albums for artist:', artist.name, albums);

        // Map backend data to frontend format
        return {
            id: artistSlug,
            name: artist.name,
            monthlyListeners: `${artist.monthly_listeners.toLocaleString()} monthly listeners`,
            headerImageUrl: artist.image_url || WEEKND_HEADER,
            verifiedLabel: "Verified Artist",
            popularTracks: songs.slice(0, 5).map((song) => ({
                id: String(song.id),
                songId: song.id,
                title: song.title,
                artist: typeof song.artist === 'string' ? song.artist : song.artist.name,
                album: typeof song.album === 'string' ? song.album : (song.album?.name ?? 'Unknown Album'),
                plays: "N/A",
                duration: `${Math.floor(song.duration_seconds / 60)}:${String(song.duration_seconds % 60).padStart(2, '0')}`,
                imageUrl: song.cover_url,
            })),
            releases: [], // Keep empty for now
            featuredPlaylists: [], // Keep empty for now
            albums: albums.slice(0, 10).map((album) => ({
                id: String(album.id),
                title: album.name,
                subtitle: `Album • ${album.release_year || 'N/A'}`,
                imageUrl: album.cover_url,
            })),
        };
    } catch (error) {
        console.error('Failed to fetch artist data:', error);
        // Fallback to placeholder data with empty albums
        const fallback = PLACEHOLDER_ARTISTS[artistSlug] ?? getFallbackArtist(artistSlug);
        return {
            ...fallback,
            albums: [],
        };
    }
}

// ─── Artist Page Skeleton ───────────────────────────────────────────────────

const ArtistPageSkeleton: React.FC = () => (
    <div className="relative min-h-full pb-10">
        <DynamicMusicBackground />

        <div className="relative z-10 animate-pulse">
            {/* Hero section skeleton */}
            <section className="relative h-[340px] md:h-[400px] bg-white/[0.06] border-b border-white/10 rounded-b-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/40 to-[#152765]/90" />
                <div className="absolute left-5 right-5 bottom-6">
                    <div className="h-3 w-32 bg-white/20 rounded mb-3" />
                    <div className="h-16 w-96 bg-white/20 rounded mb-3" />
                    <div className="h-5 w-64 bg-white/15 rounded" />
                </div>
            </section>

            <div className="px-5 md:px-8 pt-6 space-y-10">
                {/* Popular tracks section skeleton */}
                <section>
                    <div className="h-10 w-32 bg-white/10 rounded-lg mb-4" />
                    <div className="rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-2xl overflow-hidden">
                        {/* Table header skeleton */}
                        <div className="px-4 py-2 border-b border-white/10 grid grid-cols-[38px_2fr_1.4fr_1fr_90px_68px] gap-3">
                            <div className="h-3 bg-white/10 rounded" />
                            <div className="h-3 bg-white/10 rounded" />
                            <div className="h-3 bg-white/10 rounded" />
                            <div className="h-3 bg-white/10 rounded" />
                            <div className="h-3 bg-white/10 rounded" />
                            <div className="h-3 bg-white/10 rounded" />
                        </div>

                        {/* Track rows skeleton */}
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TrackRowSkeleton key={i} />
                        ))}
                    </div>
                </section>

                {/* Albums section skeleton */}
                <section>
                    <div className="h-10 w-24 bg-white/10 rounded-lg mb-4" />
                    <div className="flex gap-4 overflow-hidden">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="w-[180px] shrink-0">
                                <div className="aspect-square rounded-xl bg-white/10 mb-2" />
                                <div className="h-4 bg-white/10 rounded mb-1" />
                                <div className="h-3 bg-white/10 rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    </div>
);

export const ArtistPage: React.FC = () => {
    const { id = "the-weeknd" } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [artist, setArtist] = React.useState<ArtistPageData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [contextMenu, setContextMenu] = React.useState<{
        isOpen: boolean;
        track: ArtistTrack | null;
        x: number;
        y: number;
    }>({
        isOpen: false,
        track: null,
        x: 0,
        y: 0,
    });
    const contextMenuRef = React.useRef<HTMLDivElement>(null);
    const [userPlaylists, setUserPlaylists] = React.useState<{ id: string; name: string }[]>([]);
    const [likedTrackSongIds, setLikedTrackSongIds] = React.useState<Set<number>>(new Set());
    const [likedSongsPlaylistId, setLikedSongsPlaylistId] = React.useState<string | null>(null);

    const handleToggleLike = async (track: ArtistTrack) => {
        try {
            let playlistId: string = likedSongsPlaylistId ?? "";
            const isLiked = likedTrackSongIds.has(track.songId);

            // Create Liked Songs playlist if it doesn't exist
            if (!playlistId) {
                const newPlaylist = await playlistAPI.create({
                    name: "Liked Songs",
                    visibility: "private",
                    is_liked_songs: true,
                });
                playlistId = String(newPlaylist.id);
                setLikedSongsPlaylistId(playlistId);
                setUserPlaylists(prev => [...prev, { id: playlistId, name: newPlaylist.name }]);
            }

            if (isLiked) {
                // Remove from Liked Songs - need to find the PlaylistTrack ID
                const likedTracks = await trackAPI.list(Number(playlistId));
                const trackToRemove = likedTracks.find((t: PlaylistTrack) => t.song.id === track.songId);

                if (trackToRemove) {
                    await trackAPI.remove(Number(playlistId), trackToRemove.id);
                    setLikedTrackSongIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(track.songId);
                        return newSet;
                    });
                    toast.success(`Removed "${track.title}" from Liked Songs`);
                }
            } else {
                // Add to Liked Songs
                await trackAPI.add(Number(playlistId), track.songId);
                setLikedTrackSongIds(prev => new Set([...prev, track.songId]));
                toast.success(`Added "${track.title}" to Liked Songs`);
            }
        } catch {
            toast.error("Failed to update Liked Songs");
        }
    };

    React.useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setIsLoading(true);
            const data = await fetchArtistData(id);
            if (isMounted) {
                setArtist(data);
                setIsLoading(false);
            }

            // Fetch user playlists and liked songs
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                try {
                    const playlistsResponse = await playlistAPI.getUserPlaylists(user.id, true);
                    let playlists: Playlist[] = [];
                    if (Array.isArray(playlistsResponse)) {
                        playlists = playlistsResponse as Playlist[];
                    } else if (playlistsResponse && typeof playlistsResponse === 'object' && 'playlists' in playlistsResponse) {
                        playlists = (playlistsResponse as Record<string, unknown>).playlists as Playlist[];
                    }
                    if (isMounted) {
                        setUserPlaylists(playlists.map((p: Playlist) => ({ id: String(p.id), name: p.name })));
                    }

                    const likedPlaylist = playlists.find((p: Playlist) => p.is_liked_songs);
                    if (likedPlaylist) {
                        const likedTracks = await trackAPI.list(likedPlaylist.id);
                        if (isMounted) {
                            setLikedSongsPlaylistId(String(likedPlaylist.id));
                            if (Array.isArray(likedTracks)) {
                                setLikedTrackSongIds(new Set(likedTracks.map((t: PlaylistTrack) => t.song.id)));
                            }
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch user data:", err);
                }
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [id]);

    // Close context menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                contextMenu.isOpen &&
                contextMenuRef.current &&
                !contextMenuRef.current.contains(event.target as Node)
            ) {
                setContextMenu({ ...contextMenu, isOpen: false });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [contextMenu]);

    if (isLoading || !artist) {
        return <ArtistPageSkeleton />;
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
                        <h2 className="text-white text-3xl font-bold tracking-tight mb-4">Popular</h2>
                        <div className="rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-2xl overflow-hidden">
                            <div className="px-4 py-2 border-b border-white/10 text-xs uppercase tracking-wider text-white/45 grid grid-cols-[38px_2fr_1.4fr_1fr_90px_68px] gap-3">
                                <span>#</span>
                                <span>Title</span>
                                <span>Album</span>
                                <span>Plays</span>
                                <span></span>
                                <span className="flex items-center justify-end"><Clock3 size={13} /></span>
                            </div>

                            {artist.popularTracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className="group w-full text-left px-4 py-2.5 grid grid-cols-[38px_2fr_1.4fr_1fr_90px_68px] gap-3 items-center border-b last:border-b-0 border-white/8 hover:bg-white/[0.08] transition-colors"
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
                                            <span className="text-white/55 text-xs truncate block">{getArtistName(track.artist)}</span>
                                        </span>
                                    </span>
                                    <span className="text-white/50 text-sm truncate">{getAlbumName(track.album)}</span>
                                    <span className="text-white/50 text-sm tabular-nums">{track.plays}</span>
                                    <span className="flex items-center justify-end gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                await handleToggleLike(track);
                                            }}
                                            className="text-white/60 hover:text-spotify-green transition-colors flex items-center justify-center"
                                            title={likedTrackSongIds.has(track.songId) ? "Remove from Liked Songs" : "Add to Liked Songs"}
                                        >
                                            {likedTrackSongIds.has(track.songId) ? <Check size={16} /> : <Plus size={16} />}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setContextMenu({
                                                    isOpen: true,
                                                    track,
                                                    x: e.clientX,
                                                    y: e.clientY,
                                                });
                                            }}
                                            className="text-white/60 hover:text-white transition-colors flex items-center justify-center"
                                            title="More options"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </span>
                                    <span className="text-white/45 text-sm text-right tabular-nums">{track.duration}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {artist.albums && artist.albums.length > 0 && (
                        <section>
                            <h2 className="text-white text-3xl font-bold tracking-tight mb-4">Albums</h2>
                            <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                <div className="flex gap-4 w-max pb-2">
                                    {artist.albums.map((album) => (
                                        <button
                                            key={album.id}
                                            className="w-[180px] text-left rounded-2xl border border-white/12 bg-white/[0.05] p-2.5 hover:bg-white/[0.10] transition-colors group"
                                        >
                                            <img
                                                src={album.imageUrl}
                                                alt={album.title}
                                                className="w-full aspect-square rounded-xl object-cover border border-white/12 shadow-lg group-hover:shadow-xl transition-shadow"
                                            />
                                            <p className="text-white font-semibold mt-2 text-[15px] leading-tight line-clamp-2">
                                                {album.title}
                                            </p>
                                            <p className="text-white/60 text-sm mt-1">{album.subtitle}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Track Context Menu */}
            {contextMenu.track && (
                <TrackContextMenu
                    isOpen={contextMenu.isOpen}
                    onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
                    track={{
                        id: contextMenu.track.songId,
                        playlist_id: 0,
                        song: {
                            id: contextMenu.track.songId,
                            title: contextMenu.track.title,
                            artist: {
                                id: 0,
                                name: contextMenu.track.artist,
                            },
                            album: {
                                id: 0,
                                name: contextMenu.track.album,
                                artist: {
                                    id: 0,
                                    name: contextMenu.track.artist,
                                },
                                cover_url: contextMenu.track.imageUrl,
                                release_year: null,
                            },
                            genre: "",
                            release_year: null,
                            duration_seconds: 0,
                            cover_url: contextMenu.track.imageUrl,
                            audio_url: "",
                            storage_path: "",
                        },
                        added_by_id: 0,
                        position: 0,
                        added_at: "",
                    }}
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    isLiked={likedTrackSongIds.has(contextMenu.track.songId)}
                    onToggleLike={() => {}}
                    onAddToPlaylist={async (_track, playlistId) => {
                        try {
                            if (!contextMenu.track) return;

                            if (!playlistId) {
                                // Create a new playlist and add the track to it
                                const newPlaylist = await playlistAPI.create({
                                    name: `My Playlist`,
                                    visibility: "private",
                                });
                                await trackAPI.add(newPlaylist.id, contextMenu.track.songId);
                                setUserPlaylists(prev => [...prev, { id: String(newPlaylist.id), name: newPlaylist.name }]);
                                window.dispatchEvent(new Event('local_playlists_updated'));
                                toast.success(`Created "My Playlist" and added ${contextMenu.track.title}`);
                            } else {
                                await trackAPI.add(Number(playlistId), contextMenu.track.songId);
                                toast.success("Added to playlist");
                            }
                        } catch {
                            toast.error("Failed to add to playlist");
                        }
                    }}
                    menuRef={contextMenuRef}
                    playlists={userPlaylists}
                    onGoToArtist={(artistName) => {
                        navigate(`/search?q=${encodeURIComponent(artistName)}`);
                    }}
                />
            )}
        </div>
    );
};

export default ArtistPage;
