import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MoreHorizontal, Clock3, Plus, Check, Play, Shuffle, ListPlus } from "lucide-react";
import { DynamicMusicBackground } from "../components/ui/DynamicMusicBackground";
import { TrackRowSkeleton } from "../components/ui/LoadingSkeleton";
import { searchAPI } from "../api/search";
import { playlistAPI } from "../api/playlists";
import { trackAPI } from "../api/tracks";
import { TrackContextMenu } from "../components/modals/TrackContextMenu";
import { usePlayerStore } from "../store/playerStore";
import type { Playlist, PlaylistTrack } from "../types";
import toast from "react-hot-toast";

type AlbumTrack = {
    id: string;
    title: string;
    artist: string;
    album: string;
    plays: string;
    duration: string;
    imageUrl: string;
    songId: number;
};

type AlbumPageData = {
    id: string;
    name: string;
    artist: string;
    artistId: number;
    releaseYear: number | null;
    headerImageUrl: string;
    tracks: AlbumTrack[];
};

const ALBUM_HEADER =
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1800&h=900&fit=crop";

const PLACEHOLDER_ALBUM: AlbumPageData = {
    id: "1",
    name: "After Hours",
    artist: "The Weeknd",
    artistId: 1,
    releaseYear: 2020,
    headerImageUrl: ALBUM_HEADER,
    tracks: [
        { id: "a1", songId: 4, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", plays: "5,349,188,592", duration: "3:20", imageUrl: "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=600&h=600&fit=crop" },
        { id: "a2", songId: 5, title: "Die For You", artist: "The Weeknd", album: "After Hours", plays: "3,208,634,588", duration: "4:20", imageUrl: "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=600&h=600&fit=crop" },
    ],
};

async function fetchAlbumData(albumSlug: string): Promise<AlbumPageData> {
    try {
        // Fetch all albums to find the one matching the slug
        const allAlbums = await searchAPI.searchAlbums('');

        // Find album by comparing slugs
        const toSlug = (name: string) =>
            name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

        const matchingAlbum = allAlbums.find((a) => toSlug(a.name) === albumSlug);

        if (!matchingAlbum) {
            console.warn('No album found with slug:', albumSlug);
            throw new Error('Album not found');
        }

        console.log('✅ Found album:', matchingAlbum.name, '(ID:', matchingAlbum.id, ')');

        // Use the numeric ID to get full album data
        const album = await searchAPI.getAlbum(matchingAlbum.id);
        console.log('📀 Full album data:', album);

        // Search for songs by album name to get tracks
        const songs = await searchAPI.searchSongs({ q: album.name });

        return {
            id: albumSlug,
            name: album.name,
            artist: typeof album.artist === 'string' ? album.artist : album.artist.name,
            artistId: typeof album.artist === 'string' ? 0 : album.artist.id,
            releaseYear: album.release_year,
            headerImageUrl: album.cover_url || ALBUM_HEADER,
            tracks: songs.map((song) => ({
                id: String(song.id),
                songId: song.id,
                title: song.title,
                artist: typeof song.artist === 'string' ? song.artist : song.artist.name,
                album: typeof song.album === 'string' ? song.album : (song.album?.name ?? 'Unknown Album'),
                plays: "N/A",
                duration: `${Math.floor(song.duration_seconds / 60)}:${String(song.duration_seconds % 60).padStart(2, '0')}`,
                imageUrl: song.cover_url,
            })),
        };
    } catch (error) {
        console.error('Failed to fetch album data:', error);
        return PLACEHOLDER_ALBUM;
    }
}

// ─── Album Page Skeleton ───────────────────────────────────────────────────

const AlbumPageSkeleton: React.FC = () => (
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

            <div className="px-5 md:px-8 pt-6">
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
            </div>
        </div>
    </div>
);

export const AlbumPage: React.FC = () => {
    const { id = "after-hours" } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setQueue, toggleShuffle, shuffle, addToQueue } = usePlayerStore();
    const [album, setAlbum] = React.useState<AlbumPageData | null>(null);
    const [playlistTracks, setPlaylistTracks] = React.useState<PlaylistTrack[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [contextMenu, setContextMenu] = React.useState<{
        isOpen: boolean;
        track: AlbumTrack | null;
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
    const [songPlaylistIds, setSongPlaylistIds] = React.useState<Set<string>>(new Set());
    const [isLoadingMemberships, setIsLoadingMemberships] = React.useState(false);

    const handleToggleLike = async (track: AlbumTrack) => {
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

    const fetchSongPlaylistMemberships = async (songId: number) => {
        setIsLoadingMemberships(true);
        try {
            const memberships = new Set<string>();
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setSongPlaylistIds(memberships);
                return;
            }

            const user = JSON.parse(userStr);
            const playlistsResponse = await playlistAPI.getUserPlaylists(user.id, true);
            let playlists: Playlist[] = [];
            if (Array.isArray(playlistsResponse)) {
                playlists = playlistsResponse as Playlist[];
            } else if (playlistsResponse && typeof playlistsResponse === 'object' && 'playlists' in playlistsResponse) {
                playlists = (playlistsResponse as Record<string, unknown>).playlists as Playlist[];
            }

            // Check each playlist for this song
            await Promise.all(
                playlists.map(async (playlist: Playlist) => {
                    try {
                        const tracks = await trackAPI.list(playlist.id);
                        if (Array.isArray(tracks) && tracks.some((t: PlaylistTrack) => t.song.id === songId)) {
                            memberships.add(String(playlist.id));
                        }
                    } catch (error) {
                        console.error(`Failed to check playlist ${playlist.id}:`, error);
                    }
                })
            );

            setSongPlaylistIds(memberships);
        } catch (error) {
            console.error('Failed to fetch playlist memberships:', error);
            setSongPlaylistIds(new Set());
        } finally {
            setIsLoadingMemberships(false);
        }
    };

    React.useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setIsLoading(true);
            const data = await fetchAlbumData(id);
            if (isMounted) {
                setAlbum(data);
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

    // Fetch full Song data for album tracks to get complete data including audio_url
    React.useEffect(() => {
        const fetchPlaylistTracks = async () => {
            if (!album) return;
            try {
                // Search for songs by album name to get full Song data
                const songs = await searchAPI.searchSongs({ q: album.name });
                const tracks: PlaylistTrack[] = songs.map((song) => ({
                    id: song.id,
                    playlist_id: 0,
                    song: song,
                    position: 0,
                    added_at: "",
                    added_by_id: 0,
                }));
                setPlaylistTracks(tracks);
            } catch (error) {
                console.error("Failed to fetch album songs:", error);
                setPlaylistTracks([]);
            }
        };

        fetchPlaylistTracks();
    }, [album, searchAPI]);

    const handlePlayTracks = React.useCallback((startIndex = 0) => {
        if (playlistTracks.length === 0) return;
        const boundedIndex = Math.max(0, Math.min(startIndex, playlistTracks.length - 1));
        setQueue(playlistTracks, boundedIndex);
    }, [playlistTracks, setQueue]);

    const handleTrackClick = (trackIndex: number) => {
        handlePlayTracks(trackIndex);
    };

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

    if (isLoading || !album) {
        return <AlbumPageSkeleton />;
    }

    return (
        <div className="relative min-h-full pb-10" aria-label="Album page">
            <DynamicMusicBackground />

            <div className="relative z-10">
                <section className="relative h-[340px] md:h-[400px] overflow-hidden rounded-b-2xl border-b border-white/10">
                    <img
                        src={album.headerImageUrl}
                        alt={album.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/40 to-[#152765]/90" />

                    <div className="absolute left-5 right-5 bottom-6">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/70 font-semibold mb-2">
                            Album
                        </p>
                        <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight leading-none">
                            {album.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-white/80 text-sm md:text-base">{album.artist}</span>
                            {album.releaseYear && (
                                <>
                                    <span className="text-white/40">•</span>
                                    <span className="text-white/60 text-sm md:text-base">{album.releaseYear}</span>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <div className="px-5 md:px-8 pt-6 space-y-10">
                    <section className="flex items-center gap-3 border-b border-white/10 pb-4">
                        {/* Play button */}
                        <button
                            className="w-14 h-14 rounded-full bg-spotify-green text-black flex items-center justify-center shadow-[0_10px_24px_rgba(30,185,84,0.38)] hover:scale-105 transition-transform"
                            title="Play"
                            onClick={() => handlePlayTracks(0)}
                        >
                            <Play size={24} fill="currentColor" className="translate-x-px" />
                        </button>

                        {/* Shuffle button */}
                        <button
                            onClick={() => {
                                if (!shuffle) toggleShuffle();
                                handlePlayTracks(Math.floor(Math.random() * Math.max(0, album.tracks.length - 1)));
                            }}
                            className={`w-9 h-9 rounded-full border transition-colors flex items-center justify-center ${
                                shuffle
                                    ? "border-spotify-green bg-spotify-green/10 text-spotify-green hover:text-spotify-green hover:bg-spotify-green/20"
                                    : "border-white/20 bg-white/3 text-white/75 hover:text-white hover:bg-white/8"
                            }`}
                            title="Shuffle play"
                        >
                            <Shuffle size={17} />
                        </button>

                        {/* Add to queue button */}
                        <button
                            onClick={() => {
                                playlistTracks.forEach((track) => addToQueue(track));
                                toast.success(`Added ${playlistTracks.length} songs to queue`);
                            }}
                            className="w-9 h-9 rounded-full border border-white/20 bg-white/3 text-white/75 hover:text-white hover:bg-white/8 transition-colors flex items-center justify-center"
                            title="Add to queue"
                        >
                            <ListPlus size={17} />
                        </button>
                    </section>

                    <section>
                        <div className="rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-2xl overflow-hidden">
                            <div className="px-4 py-2 border-b border-white/10 text-xs uppercase tracking-wider text-white/45 grid grid-cols-[38px_2fr_1.4fr_1fr_68px] gap-3 items-center">
                                <span>#</span>
                                <span>Title</span>
                                <span>Plays</span>
                                <span></span>
                                <span className="flex items-center justify-end"><Clock3 size={13} /></span>
                            </div>

                            {album.tracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className="group w-full text-left px-4 py-2.5 grid grid-cols-[38px_2fr_1.4fr_1fr_68px] gap-3 items-center border-b last:border-b-0 border-white/8 hover:bg-white/[0.08] transition-colors"
                                    onClick={() => handleTrackClick(index)}
                                >
                                    <span className="text-white/55 text-sm tabular-nums">{index + 1}</span>
                                    <span className="flex items-center gap-3 min-w-0">
                                        <div className="relative group/cover shrink-0">
                                            <img
                                                src={track.imageUrl}
                                                alt={track.title}
                                                className="w-10 h-10 rounded-md object-cover border border-white/10"
                                            />
                                            {/* Play overlay */}
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTrackClick(index);
                                                }}
                                                className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-150 cursor-pointer"
                                            >
                                                <Play size={14} fill="white" className="drop-shadow-lg" />
                                            </div>
                                        </div>
                                        <span className="text-white text-sm font-medium truncate">{track.title}</span>
                                    </span>
                                    <span className="text-white/55 text-xs">{track.plays}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                await handleToggleLike(track);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-spotify-green text-white/60"
                                            title={likedTrackSongIds.has(track.songId) ? "Remove from Liked Songs" : "Add to Liked Songs"}
                                        >
                                            {likedTrackSongIds.has(track.songId) ? <Check size={14} /> : <Plus size={14} />}
                                        </button>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const track = album?.tracks[index];
                                                if (track) {
                                                    setContextMenu({
                                                        isOpen: true,
                                                        track,
                                                        x: e.clientX,
                                                        y: e.clientY,
                                                    });
                                                    await fetchSongPlaylistMemberships(track.songId);
                                                }
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-white text-white/60"
                                            title="More options"
                                        >
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                    <span className="text-white/55 text-xs text-right">{track.duration}</span>
                                </div>
                            ))}
                        </div>
                    </section>
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
                    onAddToQueue={(track) => {
                        addToQueue(track);
                        if (contextMenu.track) {
                            toast.success(`Added "${contextMenu.track.title}" to queue`);
                        }
                    }}
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
                        } catch (err) {
                            const { getErrorMessage } = await import('../utils/apiResponse');
                            toast.error(getErrorMessage(err));
                        }
                    }}
                    menuRef={contextMenuRef}
                    playlists={userPlaylists}
                    songPlaylistIds={songPlaylistIds}
                    isLoadingMemberships={isLoadingMemberships}
                    onGoToArtist={(artistName) => {
                        navigate(`/search?q=${encodeURIComponent(artistName)}`);
                    }}
                    onGoToAlbum={(albumName) => {
                        const toSlug = (name: string) =>
                            name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                        const slug = toSlug(albumName);
                        navigate(`/album/${slug}`);
                    }}
                />
            )}
        </div>
    );
};

export default AlbumPage;
