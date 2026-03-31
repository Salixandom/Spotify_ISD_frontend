import React from "react";
import { createPortal } from "react-dom";
import {
    Heart,
    Ban,
    Radio,
    Mic2,
    Disc3,
    FileText,
    Share2,
    Monitor,
    ListPlus,
    ChevronRight,
    Plus,
    Search as SearchIcon,
} from "lucide-react";

interface PlaylistOption {
    id: string;
    name: string;
}

interface ContextPosition {
    top: number;
    left: number;
}

interface Props {
    isOpen: boolean;
    contextPos: ContextPosition;
    artists: string[];
    playlists: PlaylistOption[];
    onClose: () => void;
    onArtistSelect: (artist: string) => void;
}

export const SearchTrackContextMenuModal: React.FC<Props> = ({
    isOpen,
    contextPos,
    artists,
    playlists,
    onClose,
    onArtistSelect,
}) => {
    const [showPlaylistSubmenu, setShowPlaylistSubmenu] = React.useState(false);
    const [showArtistSubmenu, setShowArtistSubmenu] = React.useState(false);
    const [playlistSubmenuPos, setPlaylistSubmenuPos] = React.useState({ top: 0, left: 0 });
    const [artistSubmenuPos, setArtistSubmenuPos] = React.useState({ top: 0, left: 0 });
    const [playlistSearch, setPlaylistSearch] = React.useState("");

    React.useEffect(() => {
        if (!isOpen) {
            setShowPlaylistSubmenu(false);
            setShowArtistSubmenu(false);
            setPlaylistSearch("");
        }
    }, [isOpen]);

    const closeAllSubmenus = React.useCallback(() => {
        setShowPlaylistSubmenu(false);
        setShowArtistSubmenu(false);
    }, []);

    if (!isOpen) return null;

    return (
        <>
            {createPortal(
                <div
                    className="fixed z-[999999] w-56 py-1
                    bg-white/5 backdrop-blur-xl rounded-lg
                    shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                    border border-white/15
                    animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextPos.top, left: contextPos.left }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseLeave={closeAllSubmenus}
                >
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2
                        text-sm text-white/80 hover:text-white hover:bg-white/10
                        transition-colors text-left"
                        onMouseEnter={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setPlaylistSubmenuPos({ top: rect.top, left: rect.right + 4 });
                            setPlaylistSearch("");
                            setShowPlaylistSubmenu(true);
                            setShowArtistSubmenu(false);
                        }}
                    >
                        <ListPlus size={16} className="text-white/60 shrink-0" />
                        <span className="flex-1">Add to playlist</span>
                        <ChevronRight size={14} className="text-white/40" />
                    </button>

                    <div className="my-1 mx-3 border-t border-white/10" />

                    {[
                        { icon: Heart, label: "Save to your Liked Songs" },
                        { icon: Ban, label: "Exclude from your taste profile" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onMouseEnter={closeAllSubmenus}
                            onClick={onClose}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm
                            text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                            <item.icon size={16} className="text-white/60 shrink-0" />
                            <span className="flex-1">{item.label}</span>
                        </button>
                    ))}

                    <div className="my-1 mx-3 border-t border-white/10" />

                    <button
                        onMouseEnter={closeAllSubmenus}
                        onClick={onClose}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm
                        text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                    >
                        <Radio size={16} className="text-white/60 shrink-0" />
                        <span className="flex-1">Go to song radio</span>
                    </button>

                    {artists.length > 0 && (
                        <button
                            className="w-full flex items-center gap-3 px-3 py-2
                            text-sm text-white/80 hover:text-white hover:bg-white/10
                            transition-colors text-left"
                            onMouseEnter={(e) => {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setArtistSubmenuPos({ top: rect.top, left: rect.right + 4 });
                                setShowArtistSubmenu(true);
                                setShowPlaylistSubmenu(false);
                            }}
                        >
                            <Mic2 size={16} className="text-white/60 shrink-0" />
                            <span className="flex-1">Go to artist</span>
                            <ChevronRight size={14} className="text-white/40" />
                        </button>
                    )}

                    {[
                        { icon: Disc3, label: "Go to album" },
                        { icon: FileText, label: "View credits" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onMouseEnter={closeAllSubmenus}
                            onClick={onClose}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm
                            text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                            <item.icon size={16} className="text-white/60 shrink-0" />
                            <span className="flex-1">{item.label}</span>
                        </button>
                    ))}

                    <div className="my-1 mx-3 border-t border-white/10" />

                    {[
                        { icon: Share2, label: "Share", hasArrow: true },
                        { icon: Monitor, label: "Open in Desktop app" },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onMouseEnter={closeAllSubmenus}
                            onClick={onClose}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm
                            text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                            <item.icon size={16} className="text-white/60 shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {item.hasArrow && <ChevronRight size={14} className="text-white/40" />}
                        </button>
                    ))}
                </div>,
                document.body
            )}

            {showPlaylistSubmenu &&
                createPortal(
                    <div
                        className="fixed z-[9999999] w-64 py-2
                        bg-white/5 backdrop-blur-xl rounded-lg
                        shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                        border border-white/15
                        animate-in fade-in slide-in-from-left-1 duration-150"
                        style={{ top: playlistSubmenuPos.top, left: playlistSubmenuPos.left }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseEnter={() => setShowPlaylistSubmenu(true)}
                    >
                        <div className="px-2 pb-2">
                            <div className="flex items-center gap-2 px-3 py-2
                            bg-white/10 border border-white/15 rounded-lg">
                                <SearchIcon size={14} className="text-white/50 shrink-0" />
                                <input
                                    type="text"
                                    value={playlistSearch}
                                    onChange={(e) => setPlaylistSearch(e.target.value)}
                                    placeholder="Find a playlist"
                                    autoFocus
                                    className="flex-1 bg-transparent outline-none text-sm
                                    text-white placeholder:text-white/40"
                                />
                            </div>
                        </div>

                        <div className="mx-3 mb-1 border-t border-white/10" />

                        <button
                            onClick={onClose}
                            className="w-full flex items-center gap-3 px-3 py-2
                            text-sm text-white/80 hover:text-white hover:bg-white/10
                            transition-colors text-left"
                        >
                            <span className="w-6 h-6 rounded-sm bg-white/15 border border-white/20
                            flex items-center justify-center shrink-0">
                                <Plus size={14} />
                            </span>
                            New playlist
                        </button>

                        <div className="mx-3 my-1 border-t border-white/10" />

                        <div className="max-h-48 overflow-y-auto">
                            {playlists
                                .filter((playlist) =>
                                    playlist.name.toLowerCase().includes(playlistSearch.toLowerCase())
                                )
                                .map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        onClick={onClose}
                                        className="w-full flex items-center px-3 py-2 text-sm
                                        text-white/80 hover:text-white hover:bg-white/10
                                        transition-colors text-left"
                                    >
                                        {playlist.name}
                                    </button>
                                ))}

                            {playlists.filter((playlist) =>
                                playlist.name.toLowerCase().includes(playlistSearch.toLowerCase())
                            ).length === 0 && (
                                <div className="px-3 py-3 text-sm text-white/40 text-center">
                                    No playlists found
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}

            {showArtistSubmenu &&
                createPortal(
                    <div
                        className="fixed z-[9999999] w-52 py-1
                        bg-white/5 backdrop-blur-xl rounded-lg
                        shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                        border border-white/15
                        animate-in fade-in slide-in-from-left-1 duration-150"
                        style={{ top: artistSubmenuPos.top, left: artistSubmenuPos.left }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseEnter={() => setShowArtistSubmenu(true)}
                    >
                        {artists.map((artist, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    onArtistSelect(artist);
                                    onClose();
                                }}
                                className="w-full flex items-center px-4 py-2.5 text-sm
                                text-white/80 hover:text-white hover:bg-white/10
                                transition-colors text-left"
                            >
                                {artist}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </>
    );
};
