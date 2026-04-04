/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Music2, Plus, Search } from "lucide-react";
import { playlistAPI } from "../api/playlists";
import type { Playlist } from "../types";
import { getLocalDraftPlaylists } from "../utils/localPlaylists";
import { useAuthStore } from "../store/authStore";

export const PlaylistsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [localDrafts, setLocalDrafts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<'all' | 'spotify' | 'you'>('all');

    useEffect(() => {
        loadPlaylists();
    }, []);

    const loadPlaylists = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        try {
            const response = await playlistAPI.getUserPlaylists(user.id) as any;
            const playlistData = response?.playlists || [];
            setPlaylists(Array.isArray(playlistData) ? playlistData : []);
            setLocalDrafts(getLocalDraftPlaylists());
        } catch (error) {
            console.error("Failed to load playlists:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Combine and filter playlists
    const filteredPlaylists = React.useMemo(() => {
        let all = [
            ...localDrafts.map((p: any) => ({ ...p, is_system_generated: true })),
            ...playlists
        ];

        // Apply search filter
        if (searchQuery) {
            all = all.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Apply type filter
        if (filter === 'spotify') {
            all = all.filter((p: any) => p.is_system_generated);
        } else if (filter === 'you') {
            all = all.filter((p: any) => !p.is_system_generated);
        }

        return all;
    }, [playlists, localDrafts, searchQuery, filter]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-black/40 via-transparent to-black/60">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-white">Your Playlists</h1>
                        <button
                            onClick={() => navigate('/')}
                            className="text-white/60 hover:text-white text-sm"
                        >
                            ← Back to Home
                        </button>
                    </div>

                    {/* Search and filters */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search playlists..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#1DB954]/50"
                            />
                        </div>

                        <div className="flex gap-2">
                            {(['all', 'spotify', 'you'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        filter === f
                                            ? 'bg-[#1DB954] text-black'
                                            : 'bg-white/5 text-white/80 hover:bg-white/10'
                                    }`}
                                >
                                    {f === 'all' ? 'All' : f === 'spotify' ? 'By Spotify' : 'By You'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8 max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-square bg-white/10 rounded-xl mb-3" />
                                <div className="h-4 bg-white/10 rounded mb-2" />
                                <div className="h-3 bg-white/10 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredPlaylists.length === 0 ? (
                    <div className="text-center py-20">
                        <Music2 className="mx-auto mb-4 text-white/20" size={48} />
                        <h2 className="text-xl font-semibold text-white mb-2">No playlists found</h2>
                        <p className="text-white/60 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Create your first playlist to get started'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold rounded-full transition-colors"
                            >
                                Go to Home
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredPlaylists.map((playlist: any) => (
                            <div
                                key={playlist.id}
                                onClick={() => navigate(`/playlist/${playlist.id}`)}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-[#1DB954]/50 transition-all mb-3">
                                    {playlist.cover_url ? (
                                        <img
                                            src={playlist.cover_url}
                                            alt={playlist.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                                            <Music2 className="text-white/20" size={48} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center">
                                            <Plus className="text-black" size={24} />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-white font-semibold text-sm truncate mb-1">
                                    {playlist.name}
                                </h3>
                                <p className="text-white/60 text-xs truncate">
                                    {playlist.description || `${playlist.is_system_generated ? 'Auto-generated' : 'Playlist'}`}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
