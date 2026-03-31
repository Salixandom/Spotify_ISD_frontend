import React from "react";
import { Search, Music, Users, Sparkles } from "lucide-react";
import { Modal } from "../ui/Modal";

interface PlaylistOption {
    id: string;
    title: string;
    subtitle: string;
    imageUrl?: string;
    isCollaborative?: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    playlists: PlaylistOption[];
}

export const SearchLibraryPlaylistsModal: React.FC<Props> = ({
    isOpen,
    onClose,
    playlists,
}) => {
    const [query, setQuery] = React.useState("");

    React.useEffect(() => {
        if (!isOpen) {
            setQuery("");
        }
    }, [isOpen]);

    const filteredPlaylists = React.useMemo(() => {
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return playlists;

        return playlists.filter((playlist) =>
            playlist.title.toLowerCase().includes(trimmed) ||
            playlist.subtitle.toLowerCase().includes(trimmed)
        );
    }, [query, playlists]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Search user playlists" maxWidthClassName="max-w-2xl">
            <div className="space-y-4">
                <div className="rounded-2xl border border-white/14 bg-gradient-to-r from-cyan-300/14 via-white/[0.06] to-transparent px-4 py-3">
                    <p className="text-sm text-white/80 flex items-center gap-2">
                        <Sparkles size={14} className="text-cyan-200" />
                        Find playlists by title or creator. Action destinations remain open for next implementation.
                    </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/[0.08] px-3 py-2.5 flex items-center gap-2">
                    <Search size={15} className="text-white/55 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by playlist name or owner"
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/45 outline-none"
                        autoFocus
                    />
                </div>

                <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/12 bg-black/25 p-2 space-y-1.5">
                    {filteredPlaylists.length === 0 && (
                        <div className="px-3 py-8 text-center text-sm text-white/45">
                            No matching playlists found.
                        </div>
                    )}

                    {filteredPlaylists.map((playlist) => (
                        <button
                            key={playlist.id}
                            onClick={onClose}
                            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent
                            transition-all text-white/80 hover:text-white hover:bg-white/[0.10] hover:border-white/12"
                        >
                            <div className="w-10 h-10 rounded-md overflow-hidden border border-white/10 bg-white/[0.04] shrink-0">
                                {playlist.imageUrl ? (
                                    <img
                                        src={playlist.imageUrl}
                                        alt={playlist.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : playlist.isCollaborative ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Users size={16} className="text-white/65" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Music size={16} className="text-white/65" />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">
                                    {playlist.title}
                                </p>
                                <p className="truncate text-xs text-white/60">
                                    {playlist.subtitle}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    );
};
