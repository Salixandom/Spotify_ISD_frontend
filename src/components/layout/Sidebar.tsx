import React, { useState, useEffect } from "react";
import { Library, Music, Users, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { playlistAPI } from "../../api/playlists";
import type { Playlist } from "../../types";
import { TrackRowSkeleton } from "../ui/LoadingSkeleton";
import { EmptyState } from "../ui/EmptyState";
import { CreatePlaylistModal } from "../modals/CreatePlaylistModal";

export const Sidebar: React.FC = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchPlaylists = async () => {
        setIsLoading(true);
        try {
            const data = await playlistAPI.list();
            setPlaylists(data);
        } catch (error) {
            console.error("Failed to fetch playlists:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const refreshPlaylists = () => {
        fetchPlaylists();
    };

    return (
        <>
            <aside
                className="h-full w-full bg-transparent flex flex-col p-3 shrink-0"
                aria-label="Library sidebar"
            >
                {/* Library only */}
                <section
                    className="rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-2xl
                     shadow-[0_8px_28px_rgba(0,0,0,0.35)]
                     p-3 flex-1 min-h-0 overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-white/75">
                            <Library size={18} />
                            <span className="font-semibold text-sm">
                                Your Library
                            </span>
                        </div>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-white/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.10]"
                            aria-label="Create playlist"
                            title="Create playlist"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Playlist list */}
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                        {isLoading ? (
                            <>
                                <TrackRowSkeleton />
                                <TrackRowSkeleton />
                                <TrackRowSkeleton />
                            </>
                        ) : playlists.length === 0 ? (
                            <EmptyState
                                title="No playlists yet"
                                description="Create your first playlist to get started"
                                icon={<Music size={42} />}
                            />
                        ) : (
                            <div className="space-y-1.5">
                                {playlists.map((playlist) => (
                                    <NavLink
                                        key={playlist.id}
                                        to={`/playlist/${playlist.id}`}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200
                      ${
                          isActive
                              ? "bg-white/[0.14] border border-white/15 text-white"
                              : "text-white/70 hover:text-white hover:bg-white/[0.10]"
                      }`
                                        }
                                    >
                                        {playlist.playlist_type ===
                                        "collaborative" ? (
                                            <Users
                                                size={16}
                                                className="shrink-0"
                                            />
                                        ) : (
                                            <Music
                                                size={16}
                                                className="shrink-0"
                                            />
                                        )}

                                        <span className="truncate flex-1 text-sm font-medium">
                                            {playlist.name}
                                        </span>

                                        {playlist.visibility === "private" && (
                                            <span className="text-[10px] opacity-70">
                                                🔒
                                            </span>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </aside>

            <CreatePlaylistModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={refreshPlaylists}
            />
        </>
    );
};

export default Sidebar;
