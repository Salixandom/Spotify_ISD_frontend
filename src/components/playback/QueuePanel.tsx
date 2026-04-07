import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Trash2 } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { searchAPI } from '../../api/search';
import { toPlayerTrack } from '../../utils/playerTrack';
import toast from 'react-hot-toast';
import type { Song } from '../../types';

interface SearchSong {
  id: number;
  title: string;
  artist: string;
  album: string;
  cover_url: string;
  song: Song;
}

const QueuePanel: React.FC = () => {
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const setQueue = usePlayerStore((state) => state.setQueue);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchSong[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search songs with debouncing
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        const results = await searchAPI.searchSongs({ q: searchQuery });
        const searchSongs: SearchSong[] = results.slice(0, 8).map((song) => ({
          id: song.id,
          title: song.title,
          artist: song.artist.name,
          album: song.album?.name || 'Unknown Album',
          cover_url: song.cover_url,
          song,
        }));
        setSearchResults(searchSongs);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search failed:', error);
        toast.error('Failed to search songs');
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const handleAddToQueue = (searchSong: SearchSong) => {
    const playerTrack = toPlayerTrack(searchSong.song);
    addToQueue(playerTrack);
    toast.success(`Added "${searchSong.title}" to queue`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleQueueItemClick = (index: number) => {
    if (index === currentIndex) return;
    setQueue(queue, index);
  };

  const handleClearQueue = () => {
    if (queue.length <= 1) {
      toast.error('Cannot clear queue with only one track');
      return;
    }
    if (currentTrack) {
      setQueue([currentTrack]);
      toast.success('Queue cleared');
    }
  };

  const getArtistName = (artist: { name: string } | string): string => {
    return typeof artist === 'string' ? artist : artist.name;
  };

  return (
    <div className="absolute right-4 top-4 bottom-4 w-[320px] bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl p-5 flex flex-col">
      {/* Search Bar */}
      <div className="relative mb-4" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search to add..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
            {searchResults.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-3 hover:bg-white/10 transition-colors group"
              >
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{song.title}</p>
                  <p className="text-white/60 text-sm truncate">{song.artist}</p>
                </div>
                <button
                  onClick={() => handleAddToQueue(song)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Add to queue"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Queue Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Queue</h3>
        {queue.length > 1 && (
          <button
            onClick={handleClearQueue}
            className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-white/50" />
            </div>
            <p className="text-white/70 text-sm">Add more songs to build your queue</p>
          </div>
        ) : (
          <div className="space-y-2">
            {queue.map((track, index) => {
              const isCurrentTrack = index === currentIndex;
              const song = track.song;

              return (
                <div
                  key={track.id}
                  onClick={() => handleQueueItemClick(index)}
                  className={`p-3 rounded-xl transition-all cursor-pointer group ${
                    isCurrentTrack
                      ? 'bg-spotify-green/30 border border-spotify-green/50'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          isCurrentTrack ? 'text-spotify-green' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-white/60 text-sm truncate">
                        {getArtistName(song.artist)}
                      </p>
                    </div>
                    {isCurrentTrack && (
                      <div className="w-2 h-2 rounded-full bg-spotify-green animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Queue Footer */}
      {queue.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/50 text-sm text-center">
            {queue.length} {queue.length === 1 ? 'track' : 'tracks'} in queue
          </p>
        </div>
      )}
    </div>
  );
};

export default QueuePanel;
