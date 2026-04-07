import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../../store/playerStore';
import { getArtistName } from '../../utils/trackHelpers';
import { trackAPI } from '../../api/tracks';
import { playlistAPI } from '../../api/playlists';
import type { PlaylistTrack } from '../../types';
import { toast } from 'react-hot-toast';

interface TrackInfoPanelProps {
  audioMetrics: {
    amplitude: number;
    bass: number;
    mid: number;
    treble: number;
    spectrum: number[];
  };
}

const TrackInfoPanel: React.FC<TrackInfoPanelProps> = ({ audioMetrics }) => {
  const navigate = useNavigate();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const [likedSongsPlaylistId, setLikedSongsPlaylistId] = useState<string | null>(null);
  const [likedTrackSongIds, setLikedTrackSongIds] = useState<Set<number>>(new Set());
  const [isLiked, setIsLiked] = useState(false);

  // Fetch liked songs data on mount
  useEffect(() => {
    const fetchLikedSongs = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      try {
        const user = JSON.parse(userStr);
        const playlistsResponse = await playlistAPI.getUserPlaylists(user.id, true);

        let playlists: any[] = [];
        if (Array.isArray(playlistsResponse)) {
          playlists = playlistsResponse;
        } else if (typeof playlistsResponse === 'object' && 'playlists' in playlistsResponse) {
          playlists = (playlistsResponse as Record<string, unknown>).playlists as any[];
        }

        const likedPlaylist = playlists.find((p: any) => p.is_liked_songs);
        if (likedPlaylist) {
          setLikedSongsPlaylistId(String(likedPlaylist.id));
          const likedTracks = await trackAPI.list(likedPlaylist.id);
          if (Array.isArray(likedTracks)) {
            const songIds = new Set(likedTracks.map((t: PlaylistTrack) => t.song.id));
            setLikedTrackSongIds(songIds);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Liked Songs:", err);
      }
    };

    fetchLikedSongs();
  }, []);

  // Update isLiked when currentTrack or likedTrackSongIds changes
  useEffect(() => {
    if (currentTrack) {
      setIsLiked(likedTrackSongIds.has(currentTrack.song.id));
    }
  }, [currentTrack, likedTrackSongIds]);

  if (!currentTrack) {
    return null;
  }

  const { song } = currentTrack;
  const artistName = getArtistName(song.artist);
  const albumName = song.album ? getArtistName(song.album) : 'Unknown Album';
  const year = song.release_year || 'Unknown';
  const duration = song.duration_seconds;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleArtistClick = async () => {
    try {
      // Import searchAPI dynamically to avoid circular deps
      const { searchAPI } = await import('../../api/search');
      const artists = await searchAPI.searchArtists(getArtistName(song.artist));
      if (artists.length > 0) {
        const artist = artists[0];
        // Generate slug from artist name (matching ArtistPage's slug format)
        const slug = artist.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        // Navigate using slug instead of ID
        navigate(`/artist/${slug}`);
      } else {
        // If no artist found, fallback to search page
        navigate(`/search?q=${encodeURIComponent(getArtistName(song.artist))}`);
      }
    } catch {
      // If search fails, fallback to search page
      navigate(`/search?q=${encodeURIComponent(getArtistName(song.artist))}`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: song.title,
          text: `Listening to "${song.title}" by ${getArtistName(song.artist)}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    }
  };

  const handleLike = async () => {
    let currentLikedSongsId = likedSongsPlaylistId;

    // Create Liked Songs playlist if it doesn't exist
    if (currentLikedSongsId === null) {
      try {
        const newPlaylist = await playlistAPI.create({
          name: "Liked Songs",
          visibility: "private",
          is_liked_songs: true
        });
        currentLikedSongsId = String(newPlaylist.id);
        setLikedSongsPlaylistId(currentLikedSongsId);
        toast.success("Created Liked Songs playlist");
      } catch (err) {
        console.error(err);
        toast.error("Failed to create Liked Songs playlist");
        return;
      }
    }

    // Toggle like status
    try {
      if (isLiked) {
        // Remove from liked songs
        const trackIdInLiked = currentTrack.id;
        await trackAPI.remove(Number(currentLikedSongsId), trackIdInLiked);
        setLikedTrackSongIds(prev => {
          const next = new Set(prev);
          next.delete(currentTrack.song.id);
          return next;
        });
        toast.success("Removed from Liked Songs");
      } else {
        // Add to liked songs
        await trackAPI.add(Number(currentLikedSongsId), currentTrack.song.id);
        setLikedTrackSongIds(prev => new Set(prev).add(currentTrack.song.id));
        toast.success("Added to Liked Songs");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update Liked Songs");
    }
  };

  // Mini visualizer with 8 bars
  const visualizerBars = Array.from({ length: 8 }, (_, i) => {
    const spectrumIndex = Math.floor((i / 8) * audioMetrics.spectrum.length);
    const value = audioMetrics.spectrum[spectrumIndex] || 0;
    const height = Math.max(4, value * 100);
    const opacity = Math.max(0.3, value);

    return (
      <div
        key={i}
        className="flex-1 bg-spotify-green rounded-full transition-all duration-75"
        style={{
          height: `${height}px`,
          opacity,
        }}
      />
    );
  });

  return (
    <div className="absolute left-4 top-4 bottom-4 w-[280px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
      {/* Album Art */}
      <div className="mb-4">
        <img
          src={song.cover_url}
          alt={song.title}
          className="w-[200px] h-[200px] rounded-lg object-cover shadow-lg"
        />
      </div>

      {/* Track Title */}
      <h2 className="text-2xl font-bold text-white mb-2 truncate">{song.title}</h2>

      {/* Artist Name */}
      <button
        onClick={handleArtistClick}
        className="text-lg text-white/80 hover:text-white hover:underline transition-colors cursor-pointer truncate mb-6"
      >
        {artistName}
      </button>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
        <div>
          <p className="text-white/50 mb-1">Album</p>
          <p className="text-white truncate">{albumName}</p>
        </div>
        <div>
          <p className="text-white/50 mb-1">Year</p>
          <p className="text-white">{year}</p>
        </div>
        <div>
          <p className="text-white/50 mb-1">Genre</p>
          <p className="text-white capitalize truncate">{song.genre}</p>
        </div>
        <div>
          <p className="text-white/50 mb-1">Duration</p>
          <p className="text-white">{formatDuration(duration)}</p>
        </div>
      </div>

      {/* Explicit & Popularity */}
      <div className="flex items-center gap-3 mb-5">
        {song.is_explicit && (
          <span className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white/90">
            Explicit
          </span>
        )}
        {song.popularity_score && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.ceil(song.popularity_score! / 20) ? 'text-spotify-green' : 'text-white/20'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-white/60">{song.popularity_score}</span>
          </div>
        )}
      </div>

      {/* Artist Info Section */}
      {song.artist && (
        <div className="mb-5 p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            {song.artist.image_url && (
              <img
                src={song.artist.image_url}
                alt={getArtistName(song.artist)}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/50 mb-0.5">Artist</p>
              <button
                onClick={handleArtistClick}
                className="text-sm font-medium text-white hover:text-spotify-green hover:underline transition-colors truncate"
              >
                {getArtistName(song.artist)}
              </button>
            </div>
          </div>
          {song.artist.monthly_listeners && (
            <p className="text-xs text-white/50">
              {song.artist.monthly_listeners.toLocaleString()} monthly listeners
            </p>
          )}
          {song.artist.bio && (
            <p className="text-xs text-white/70 mt-2 line-clamp-2">
              {song.artist.bio}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={handleShare}
          className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm text-white transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
        <button
          onClick={handleLike}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isLiked
              ? 'bg-spotify-green hover:bg-spotify-green-hover text-white'
              : 'bg-white/10 hover:bg-white/15 border border-white/20 text-white'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {isLiked ? 'Liked' : 'Like'}
        </button>
      </div>

      {/* Audio Visualizer Label */}
      <p className="text-xs text-white/50 mb-2">Audio Visualizer</p>

      {/* Mini Audio Visualizer */}
      <div className="h-16 flex items-end gap-1">
        {visualizerBars}
      </div>
    </div>
  );
};

export default TrackInfoPanel;
