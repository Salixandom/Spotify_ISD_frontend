import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
    Play, Plus, MoreHorizontal, Heart, Ban, Radio,
    Mic2, Disc3, FileText, Share2, Monitor, ListPlus,
    ChevronRight, Music2, Sparkles, Search as SearchIcon, Clock,
} from "lucide-react";
import { DynamicMusicBackground } from "../components/ui/DynamicMusicBackground";

// ─── Types ────────────────────────────────────────────────────────────────────

type Track   = { id: string; title: string; artist: string; album: string; duration: string; imageUrl: string };
type Artist  = { id: string; name: string; followers: string; imageUrl: string };
type Album   = { id: string; title: string; year: string; artist: string; imageUrl: string };
type Playlist = { id: string; title: string; description: string; imageUrl: string };
type BrowseCategory = { id: string; name: string; colorFrom: string; colorTo: string };

// ─── Data ─────────────────────────────────────────────────────────────────────

const IMG = [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=600&h=600&fit=crop",
];

const SONGS: Track[] = [
    { id: "t1", title: "Blinding Lights",   artist: "The Weeknd",                   album: "After Hours",          duration: "3:20", imageUrl: IMG[0] },
    { id: "t2", title: "Levitating",         artist: "Dua Lipa",                     album: "Future Nostalgia",     duration: "3:23", imageUrl: IMG[1] },
    { id: "t3", title: "Save Your Tears",    artist: "The Weeknd",                   album: "After Hours",          duration: "3:36", imageUrl: IMG[2] },
    { id: "t4", title: "Stay",               artist: "The Kid LAROI, Justin Bieber", album: "F*CK LOVE 3",          duration: "2:21", imageUrl: IMG[3] },
    { id: "t5", title: "Peaches",            artist: "Justin Bieber",                album: "Justice",              duration: "3:18", imageUrl: IMG[4] },
    { id: "t6", title: "Good 4 U",           artist: "Olivia Rodrigo",               album: "SOUR",                 duration: "2:58", imageUrl: IMG[5] },
    { id: "t7", title: "drivers license",    artist: "Olivia Rodrigo",               album: "SOUR",                 duration: "4:02", imageUrl: IMG[6] },
    { id: "t8", title: "Montero",            artist: "Lil Nas X",                    album: "MONTERO",              duration: "2:17", imageUrl: IMG[7] },
];

const ARTISTS: Artist[] = [
    { id: "a1", name: "The Weeknd",    followers: "38.2M followers", imageUrl: IMG[0] },
    { id: "a2", name: "Dua Lipa",      followers: "26.4M followers", imageUrl: IMG[1] },
    { id: "a3", name: "Taylor Swift",  followers: "45.1M followers", imageUrl: IMG[2] },
    { id: "a4", name: "Post Malone",   followers: "19.8M followers", imageUrl: IMG[3] },
    { id: "a5", name: "Billie Eilish", followers: "22.7M followers", imageUrl: IMG[4] },
    { id: "a6", name: "Harry Styles",  followers: "16.3M followers", imageUrl: IMG[5] },
    { id: "a7", name: "Olivia Rodrigo",followers: "18.5M followers", imageUrl: IMG[6] },
    { id: "a8", name: "Lil Nas X",     followers: "12.1M followers", imageUrl: IMG[7] },
];

const ALBUMS: Album[] = [
    { id: "al1", title: "After Hours",          year: "2020", artist: "The Weeknd",    imageUrl: IMG[6] },
    { id: "al2", title: "Future Nostalgia",     year: "2020", artist: "Dua Lipa",      imageUrl: IMG[1] },
    { id: "al3", title: "Hollywood's Bleeding", year: "2019", artist: "Post Malone",   imageUrl: IMG[3] },
    { id: "al4", title: "Fine Line",            year: "2019", artist: "Harry Styles",  imageUrl: IMG[5] },
    { id: "al5", title: "Lover",                year: "2019", artist: "Taylor Swift",  imageUrl: IMG[7] },
    { id: "al6", title: "When We All Fall Asleep", year: "2019", artist: "Billie Eilish", imageUrl: IMG[4] },
    { id: "al7", title: "SOUR",                 year: "2021", artist: "Olivia Rodrigo",imageUrl: IMG[6] },
    { id: "al8", title: "Justice",              year: "2021", artist: "Justin Bieber", imageUrl: IMG[2] },
];

const PLAYLISTS: Playlist[] = [
    { id: "pl1", title: "Today's Top Hits",  description: "Playlist · Spotify",      imageUrl: IMG[0] },
    { id: "pl2", title: "RapCaviar",         description: "Playlist · Spotify",      imageUrl: IMG[2] },
    { id: "pl3", title: "Hot Country",       description: "Playlist · Spotify",      imageUrl: IMG[5] },
    { id: "pl4", title: "Peaceful Piano",    description: "Playlist · Spotify",      imageUrl: IMG[7] },
    { id: "pl5", title: "Mega Hit Mix",      description: "Playlist · Spotify",      imageUrl: IMG[3] },
    { id: "pl6", title: "Indie Horizon",     description: "Playlist · Sakib",        imageUrl: IMG[6] },
    { id: "pl7", title: "Late Night Drive",  description: "Playlist · Sakib",        imageUrl: IMG[1] },
    { id: "pl8", title: "Vibrant Energy",    description: "Playlist · Spotify",      imageUrl: IMG[4] },
];

const MY_PLAYLISTS = [
    { id: "p1", name: "Emraan mood" },
    { id: "p2", name: "Banter Beats" },
    { id: "p3", name: "Skibbididoo" },
    { id: "p4", name: "Chill Vibes" },
    { id: "p5", name: "Late Night Drive" },
];

const BROWSE_CATEGORIES: BrowseCategory[] = [
    { id: "podcasts",     name: "Podcasts",      colorFrom: "#e13300", colorTo: "#ff8a00" },
    { id: "live-events",  name: "Live Events",   colorFrom: "#7c3aed", colorTo: "#ec4899" },
    { id: "made-for-you", name: "Made For You",  colorFrom: "#1e3264", colorTo: "#7c3aed" },
    { id: "new-releases", name: "New Releases",  colorFrom: "#e8115b", colorTo: "#fd5c93" },
    { id: "pop",          name: "Pop",           colorFrom: "#8c67ab", colorTo: "#e91e63" },
    { id: "hip-hop",      name: "Hip-Hop",       colorFrom: "#ba5d07", colorTo: "#ff6b6b" },
    { id: "rock",         name: "Rock",          colorFrom: "#e61e32", colorTo: "#dc148c" },
    { id: "latin",        name: "Latin",         colorFrom: "#27856a", colorTo: "#61de7b" },
    { id: "mood",         name: "Mood",          colorFrom: "#1e3264", colorTo: "#8d67ab" },
    { id: "educational",  name: "Educational",   colorFrom: "#148a08", colorTo: "#50c878" },
    { id: "discover",     name: "Discover",      colorFrom: "#0d73ec", colorTo: "#2d77eb" },
    { id: "charts",       name: "Charts",        colorFrom: "#e13300", colorTo: "#ff8a00" },
];

const FILTERS = ["All", "Songs", "Albums", "Playlists", "Artists"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle: React.FC<{
    title: string;
    icon?: React.ReactNode;
    subtitle?: string;
    onShowAll?: () => void;
}> = ({ title, icon, subtitle, onShowAll }) => (
    <div className="mb-5 flex items-end justify-between">
        <div>
            <h2 className="text-white text-2xl font-bold tracking-tight flex items-center gap-2">
                {icon}{title}
            </h2>
            {subtitle && <p className="text-white/65 text-sm mt-1">{subtitle}</p>}
        </div>
        {onShowAll && (
            <button
                onClick={onShowAll}
                className="text-white/60 text-sm font-semibold hover:text-white
                    transition-colors rounded-full border border-white/15 bg-white/[0.04] px-3 py-1"
            >
                Show all
            </button>
        )}
    </div>
);

// Artist card: play button lives OUTSIDE the overflow-hidden image so it never clips
const ArtistCard: React.FC<{ imageUrl: string; name: string; followers: string; className?: string }> = ({
    imageUrl, name, followers, className = "",
}) => (
    <button className={`group relative shrink-0 rounded-2xl p-3.5 ${className}
        border border-white/14 bg-white/[0.06] backdrop-blur-2xl
        shadow-[0_8px_24px_rgba(0,0,0,0.25)]
        hover:bg-white/[0.10] hover:border-white/24
        transition-all duration-300 text-left`}
    >
        {/* Circular image — overflow-hidden clips only the img */}
        <div className="relative mb-3 aspect-square rounded-full overflow-hidden
            border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <img
                src={imageUrl} alt={name}
                className="w-full h-full object-cover
                    transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient overlay for readability */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300 rounded-full"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent 55%)" }}
            />
        </div>

        {/* Play button — outside overflow-hidden, no clipping */}
        <div className="absolute right-4 bottom-[72px] z-20
            opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-300 pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-spotify-green text-black
                flex items-center justify-center
                shadow-[0_4px_20px_rgba(30,185,84,0.55)]">
                <Play size={16} fill="currentColor" />
            </div>
        </div>

        <p className="text-white font-semibold text-[14px] truncate">{name}</p>
        <p className="text-white/55 text-[12px] mt-0.5 truncate">{followers}</p>
    </button>
);

const MediaCard: React.FC<{
    imageUrl: string; title: string; subtitle: string; rounded?: boolean;
}> = ({ imageUrl, title, subtitle, rounded = false }) => (
    <button className="group relative w-[160px] shrink-0 rounded-2xl p-3.5
        border border-white/14 bg-white/[0.06] backdrop-blur-2xl
        shadow-[0_8px_24px_rgba(0,0,0,0.25)]
        hover:bg-white/[0.10] hover:border-white/24
        transition-all duration-300 text-left"
    >
        <div className={`relative overflow-hidden mb-3 aspect-square
            border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]
            ${rounded ? "rounded-full" : "rounded-xl"}`}>
            <img
                src={imageUrl} alt={title}
                className="w-full h-full object-cover
                    transition-transform duration-500 group-hover:scale-105"
            />
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)" }}
            />
        </div>

        {/* Play button outside overflow-hidden */}
        <div className="absolute right-4 bottom-[72px] z-20
            opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-300 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-spotify-green text-black
                flex items-center justify-center
                shadow-[0_4px_16px_rgba(30,185,84,0.45)]">
                <Play size={16} fill="currentColor" />
            </div>
        </div>

        <p className="text-white font-semibold text-[14px] truncate">{title}</p>
        <p className="text-white/60 text-[12px] mt-1 truncate">{subtitle}</p>
    </button>
);

const HorizontalShelf: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="overflow-x-auto pb-2
        [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3 w-max">{children}</div>
    </div>
);

// Grid view for full-tab display (Albums / Playlists)
const MediaGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {children}
    </div>
);

// MediaCard but wider for grid layout
const GridCard: React.FC<{
    imageUrl: string; title: string; subtitle: string; rounded?: boolean;
}> = ({ imageUrl, title, subtitle, rounded = false }) => (
    <button className="group relative w-full rounded-2xl p-3.5
        border border-white/14 bg-white/[0.06] backdrop-blur-2xl
        shadow-[0_8px_24px_rgba(0,0,0,0.25)]
        hover:bg-white/[0.10] hover:border-white/24
        transition-all duration-300 text-left"
    >
        <div className={`relative overflow-hidden mb-3 aspect-square
            border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]
            ${rounded ? "rounded-full" : "rounded-xl"}`}>
            <img
                src={imageUrl} alt={title}
                className="w-full h-full object-cover
                    transition-transform duration-500 group-hover:scale-105"
            />
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%)" }}
            />
        </div>

        {/* Play button outside overflow-hidden */}
        <div className="absolute right-5 bottom-[80px] z-20
            opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-300 pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-spotify-green text-black
                flex items-center justify-center
                shadow-[0_6px_20px_rgba(30,185,84,0.5)]">
                <Play size={17} fill="currentColor" />
            </div>
        </div>

        <p className="text-white font-semibold text-[14px] truncate">{title}</p>
        <p className="text-white/60 text-[12px] mt-1 truncate">{subtitle}</p>
    </button>
);

// ─── Song row (reused in both All + Songs views) ──────────────────────────────

const SongRow: React.FC<{
    song: Track;
    index: number;
    showAlbumCol?: boolean;
    onContextMenu: (e: React.MouseEvent, song: Track) => void;
}> = ({ song, index, showAlbumCol = false, onContextMenu }) => (
    <div
        className="group flex items-center gap-3 px-3 py-2 rounded-xl
            border border-transparent
            hover:bg-white/[0.07] hover:border-white/10
            transition-all duration-200 cursor-pointer"
        onMouseDown={(e) => e.stopPropagation()}
    >
        {/* Index / play */}
        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10">
            <img src={song.imageUrl} alt={song.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={13} className="text-white fill-white" />
            </div>
            <span className="absolute inset-0 flex items-center justify-center
                text-white/50 text-sm font-medium group-hover:opacity-0 transition-opacity">
                {index + 1}
            </span>
        </div>

        {/* Title + artist */}
        <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-[14px] truncate">{song.title}</div>
            <div className="text-[12px] text-white/55 truncate">{song.artist}</div>
        </div>

        {/* Album column (only in Songs tab full view) */}
        {showAlbumCol && (
            <span className="hidden md:block text-[13px] text-white/45 truncate w-[140px] shrink-0">
                {song.album}
            </span>
        )}

        {/* + circle — left of duration */}
        <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-all
                w-7 h-7 rounded-full border border-white/35
                hover:border-white hover:scale-105
                flex items-center justify-center
                text-white/65 hover:text-white shrink-0"
            aria-label="Save to Liked Songs"
        >
            <Plus size={13} />
        </button>

        {/* Duration */}
        <span className="text-sm text-white/45 tabular-nums shrink-0 w-9 text-right">
            {song.duration}
        </span>

        {/* ⋯ — right of duration */}
        <button
            onClick={(e) => onContextMenu(e, song)}
            className="opacity-0 group-hover:opacity-100 transition-all
                w-7 h-7 rounded-full hover:bg-white/15
                flex items-center justify-center
                text-white/65 hover:text-white shrink-0"
            aria-label="More options"
        >
            <MoreHorizontal size={15} />
        </button>
    </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q") || "";

    const [activeFilter, setActiveFilter] = React.useState("All");

    // Context menu
    const [contextMenu, setContextMenu] = React.useState<{
        id: string; top: number; left: number; songArtist?: string;
    } | null>(null);
    const contextMenuRef = React.useRef<HTMLDivElement>(null);

    // Playlist submenu
    const [showPlaylistSubmenu, setShowPlaylistSubmenu] = React.useState(false);
    const [playlistSubmenuPos, setPlaylistSubmenuPos] = React.useState({ top: 0, left: 0 });
    const [playlistSearch, setPlaylistSearch] = React.useState("");
    const playlistSubmenuRef = React.useRef<HTMLDivElement>(null);

    // Artist submenu
    const [showArtistSubmenu, setShowArtistSubmenu] = React.useState(false);
    const [artistSubmenuPos, setArtistSubmenuPos] = React.useState({ top: 0, left: 0 });
    const artistSubmenuRef = React.useRef<HTMLDivElement>(null);

    const closeAll = React.useCallback(() => {
        setContextMenu(null);
        setShowPlaylistSubmenu(false);
        setShowArtistSubmenu(false);
    }, []);

    React.useEffect(() => {
        document.addEventListener("mousedown", closeAll);
        return () => document.removeEventListener("mousedown", closeAll);
    }, [closeAll]);

    React.useEffect(() => { setActiveFilter("All"); }, [query]);

    const openContextMenu = (e: React.MouseEvent, song: Track) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setContextMenu({
            id: song.id,
            top: rect.bottom + 4,
            left: Math.min(rect.right - 224, window.innerWidth - 240),
            songArtist: song.artist,
        });
        setShowPlaylistSubmenu(false);
        setShowArtistSubmenu(false);
    };

    const artistList = contextMenu?.songArtist?.split(", ").filter(Boolean) ?? [];

    // ── No query → Browse ───────────────────────────────────────────────────

    if (!query) {
        return (
            <div className="relative min-h-full p-6 md:p-8">
                <DynamicMusicBackground />
                <div className="relative z-10">
                    <div className="mb-8 rounded-2xl border border-white/12
                        bg-white/[0.055] backdrop-blur-2xl
                        shadow-[0_10px_30px_rgba(0,0,0,0.28)] px-5 py-4">
                        <h1 className="text-white text-3xl font-bold tracking-tight flex items-center gap-3">
                            <SearchIcon size={26} className="text-white/60" />
                            Browse all
                        </h1>
                        <p className="text-white/60 text-sm mt-1">
                            What do you want to listen to today?
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {BROWSE_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)}
                                className="relative group h-40 rounded-xl p-4 overflow-hidden text-left
                                    border border-white/12 bg-white/[0.06] backdrop-blur-xl
                                    shadow-[0_4px_20px_rgba(0,0,0,0.25)]
                                    hover:scale-[1.03] hover:border-white/20 hover:bg-white/[0.10]
                                    hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                                    transition-all duration-300"
                            >
                                {/* Subtle color tint — lets the dynamic background show through */}
                                <div
                                    className="absolute inset-0 opacity-30 group-hover:opacity-45 transition-opacity duration-300"
                                    style={{ background: `linear-gradient(135deg, ${cat.colorFrom} 0%, ${cat.colorTo} 100%)` }}
                                />
                                <h3 className="relative text-lg font-bold text-white drop-shadow-md z-10">{cat.name}</h3>
                                {/* Decorative shape */}
                                <div className="absolute bottom-0 right-0 w-20 h-20
                                    bg-white/10 rounded-lg transform rotate-12
                                    translate-x-4 translate-y-4 z-10
                                    group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    const renderContextMenuPortal = () => contextMenu && createPortal(
        <div
            ref={contextMenuRef}
            className="fixed z-[999999] w-56 py-1
                bg-white/5 backdrop-blur-xl rounded-lg
                shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                border border-white/15
                animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.top, left: contextMenu.left }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseLeave={() => {
                setShowPlaylistSubmenu(false);
                setShowArtistSubmenu(false);
            }}
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
                { icon: Ban,   label: "Exclude from your taste profile" },
            ].map((item, i) => (
                <button key={i}
                    onMouseEnter={() => { setShowPlaylistSubmenu(false); setShowArtistSubmenu(false); }}
                    onClick={() => closeAll()}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm
                        text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                    <item.icon size={16} className="text-white/60 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                </button>
            ))}

            <div className="my-1 mx-3 border-t border-white/10" />

            <button
                onMouseEnter={() => { setShowPlaylistSubmenu(false); setShowArtistSubmenu(false); }}
                onClick={() => closeAll()}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm
                    text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                <Radio size={16} className="text-white/60 shrink-0" />
                <span className="flex-1">Go to song radio</span>
            </button>

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

            {[
                { icon: Disc3,    label: "Go to album" },
                { icon: FileText, label: "View credits" },
            ].map((item, i) => (
                <button key={i}
                    onMouseEnter={() => { setShowPlaylistSubmenu(false); setShowArtistSubmenu(false); }}
                    onClick={() => closeAll()}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm
                        text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                    <item.icon size={16} className="text-white/60 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                </button>
            ))}

            <div className="my-1 mx-3 border-t border-white/10" />

            {[
                { icon: Share2,  label: "Share",              hasArrow: true },
                { icon: Monitor, label: "Open in Desktop app" },
            ].map((item, i) => (
                <button key={i}
                    onMouseEnter={() => { setShowPlaylistSubmenu(false); setShowArtistSubmenu(false); }}
                    onClick={() => closeAll()}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm
                        text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                    <item.icon size={16} className="text-white/60 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.hasArrow && <ChevronRight size={14} className="text-white/40" />}
                </button>
            ))}
        </div>,
        document.body
    );

    const renderPlaylistSubmenuPortal = () => showPlaylistSubmenu && contextMenu && createPortal(
        <div
            ref={playlistSubmenuRef}
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
            <button onClick={closeAll}
                className="w-full flex items-center gap-3 px-3 py-2
                    text-sm text-white/80 hover:text-white hover:bg-white/10
                    transition-colors text-left">
                <span className="w-6 h-6 rounded-sm bg-white/15 border border-white/20
                    flex items-center justify-center shrink-0">
                    <Plus size={14} />
                </span>
                New playlist
            </button>
            <div className="mx-3 my-1 border-t border-white/10" />
            <div className="max-h-48 overflow-y-auto">
                {MY_PLAYLISTS
                    .filter(p => p.name.toLowerCase().includes(playlistSearch.toLowerCase()))
                    .map(p => (
                        <button key={p.id} onClick={closeAll}
                            className="w-full flex items-center px-3 py-2 text-sm
                                text-white/80 hover:text-white hover:bg-white/10
                                transition-colors text-left">
                            {p.name}
                        </button>
                    ))}
                {MY_PLAYLISTS.filter(p =>
                    p.name.toLowerCase().includes(playlistSearch.toLowerCase())
                ).length === 0 && (
                    <div className="px-3 py-3 text-sm text-white/40 text-center">
                        No playlists found
                    </div>
                )}
            </div>
        </div>,
        document.body
    );

    const renderArtistSubmenuPortal = () => showArtistSubmenu && contextMenu && createPortal(
        <div
            ref={artistSubmenuRef}
            className="fixed z-[9999999] w-52 py-1
                bg-white/5 backdrop-blur-xl rounded-lg
                shadow-[0_8px_30px_rgba(0,0,0,0.50)]
                border border-white/15
                animate-in fade-in slide-in-from-left-1 duration-150"
            style={{ top: artistSubmenuPos.top, left: artistSubmenuPos.left }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseEnter={() => setShowArtistSubmenu(true)}
        >
            {artistList.map((artist, i) => (
                <button key={i}
                    onClick={() => {
                        closeAll();
                        navigate(`/search?q=${encodeURIComponent(artist)}`);
                    }}
                    className="w-full flex items-center px-4 py-2.5 text-sm
                        text-white/80 hover:text-white hover:bg-white/10
                        transition-colors text-left">
                    {artist}
                </button>
            ))}
        </div>,
        document.body
    );

    // ── "All" view ──────────────────────────────────────────────────────────

    const renderAll = () => (
        <div className="space-y-10">
            {/* Top result + Songs */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Top result */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Top result</h2>
                    <div
                        className="group relative p-6 rounded-2xl overflow-hidden
                            border border-white/14 bg-white/[0.06] backdrop-blur-2xl
                            shadow-[0_8px_32px_rgba(0,0,0,0.35)]
                            hover:bg-white/[0.10] hover:border-white/24
                            transition-all duration-300 cursor-pointer"
                    >
                        {/* Ambient glow */}
                        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-3xl
                            bg-spotify-green/12 pointer-events-none" />

                        <div className="relative">
                            {/* Art + title side by side */}
                            <div className="flex gap-4 items-center mb-5">
                                <div className="w-[110px] h-[110px] rounded-xl overflow-hidden shrink-0
                                    shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-white/10">
                                    <img
                                        src={SONGS[0].imageUrl} alt={SONGS[0].title}
                                        className="w-full h-full object-cover
                                            transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="inline-block px-2 py-0.5 rounded-full mb-2
                                        bg-white/10 border border-white/15
                                        text-[10px] font-bold uppercase tracking-widest text-white/60">
                                        Song
                                    </span>
                                    <h3 className="text-[26px] font-bold text-white tracking-tight leading-tight truncate mb-1">
                                        {SONGS[0].title}
                                    </h3>
                                    <p className="text-sm text-white/55 truncate">
                                        {SONGS[0].artist}
                                        <span className="mx-1.5 text-white/25">·</span>
                                        <span className="text-white/35">{SONGS[0].album}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-full
                                    bg-spotify-green text-black text-sm font-bold
                                    hover:scale-105 active:scale-95 transition-transform
                                    shadow-[0_4px_14px_rgba(30,185,84,0.4)]">
                                    <Play size={14} fill="currentColor" />
                                    Play
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); }}
                                    className="w-8 h-8 rounded-full border border-white/30
                                        flex items-center justify-center text-white/55
                                        hover:text-white hover:border-white transition-colors"
                                    aria-label="Save to Liked Songs">
                                    <Plus size={15} />
                                </button>
                                <button
                                    onClick={(e) => openContextMenu(e, SONGS[0])}
                                    className="w-8 h-8 rounded-full flex items-center justify-center
                                        text-white/35 hover:text-white transition-colors"
                                    aria-label="More options">
                                    <MoreHorizontal size={16} />
                                </button>
                                <span className="ml-auto flex items-center gap-1.5 text-[11px] text-white/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-spotify-green shrink-0" />
                                    5.2B streams
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Songs column */}
                <div>
                    <SectionTitle
                        title="Songs"
                        icon={<Music2 size={20} className="text-spotify-green" />}
                        onShowAll={() => setActiveFilter("Songs")}
                    />
                    <div className="flex flex-col gap-0.5">
                        {SONGS.slice(0, 4).map((song, idx) => (
                            <SongRow
                                key={song.id}
                                song={song}
                                index={idx}
                                onContextMenu={openContextMenu}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Artists shelf */}
            <section>
                <SectionTitle
                    title="Artists"
                    icon={<Mic2 size={20} className="text-purple-300" />}
                    subtitle="Artists matching your search"
                    onShowAll={() => setActiveFilter("Artists")}
                />
                <HorizontalShelf>
                    {ARTISTS.map((a) => (
                        <ArtistCard key={a.id} imageUrl={a.imageUrl} name={a.name} followers={a.followers} className="w-[160px] shrink-0" />
                    ))}
                </HorizontalShelf>
            </section>

            {/* Albums shelf */}
            <section>
                <SectionTitle
                    title="Albums"
                    icon={<Disc3 size={20} className="text-pink-300" />}
                    subtitle="Albums matching your search"
                    onShowAll={() => setActiveFilter("Albums")}
                />
                <HorizontalShelf>
                    {ALBUMS.map((al) => (
                        <MediaCard
                            key={al.id}
                            imageUrl={al.imageUrl}
                            title={al.title}
                            subtitle={`${al.year} · ${al.artist}`}
                        />
                    ))}
                </HorizontalShelf>
            </section>

            {/* Playlists shelf */}
            <section>
                <SectionTitle
                    title="Playlists"
                    icon={<Sparkles size={20} className="text-cyan-300" />}
                    subtitle="Playlists featuring your search"
                    onShowAll={() => setActiveFilter("Playlists")}
                />
                <HorizontalShelf>
                    {PLAYLISTS.map((pl) => (
                        <MediaCard
                            key={pl.id}
                            imageUrl={pl.imageUrl}
                            title={pl.title}
                            subtitle={pl.description}
                        />
                    ))}
                </HorizontalShelf>
            </section>
        </div>
    );

    // ── "Songs" full view ───────────────────────────────────────────────────

    const renderSongs = () => (
        <div>
            {/* Table header */}
            <div className="flex items-center gap-3 px-3 pb-2 mb-1
                border-b border-white/10 text-white/40 text-xs font-semibold uppercase tracking-wider">
                <span className="w-9 text-center">#</span>
                <span className="flex-1">Title</span>
                <span className="hidden md:block max-w-[140px] w-[140px] shrink-0">Album</span>
                <span className="w-7 shrink-0" />
                <span className="w-9 text-right shrink-0 flex items-center justify-end gap-1">
                    <Clock size={13} />
                </span>
                <span className="w-7 shrink-0" />
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
                {SONGS.map((song, idx) => (
                    <SongRow
                        key={song.id}
                        song={song}
                        index={idx}
                        showAlbumCol
                        onContextMenu={openContextMenu}
                    />
                ))}
            </div>
        </div>
    );

    // ── "Artists" full view ─────────────────────────────────────────────────

    const renderArtists = () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {ARTISTS.map((a) => (
                <ArtistCard key={a.id} imageUrl={a.imageUrl} name={a.name} followers={a.followers} className="w-full" />
            ))}
        </div>
    );

    // ── "Albums" full view ──────────────────────────────────────────────────

    const renderAlbums = () => (
        <MediaGrid>
            {ALBUMS.map((al) => (
                <GridCard
                    key={al.id}
                    imageUrl={al.imageUrl}
                    title={al.title}
                    subtitle={`${al.year} · ${al.artist}`}
                />
            ))}
        </MediaGrid>
    );

    // ── "Playlists" full view ───────────────────────────────────────────────

    const renderPlaylists = () => (
        <MediaGrid>
            {PLAYLISTS.map((pl) => (
                <GridCard
                    key={pl.id}
                    imageUrl={pl.imageUrl}
                    title={pl.title}
                    subtitle={pl.description}
                />
            ))}
        </MediaGrid>
    );

    // ── Section header for non-All tabs ────────────────────────────────────

    const TAB_META: Record<string, { title: string; icon: React.ReactNode; subtitle: string }> = {
        Songs:     { title: "Songs",     icon: <Music2   size={22} className="text-spotify-green" />, subtitle: `Songs matching "${query}"` },
        Artists:   { title: "Artists",   icon: <Mic2     size={22} className="text-purple-300"    />, subtitle: `Artists matching "${query}"` },
        Albums:    { title: "Albums",    icon: <Disc3    size={22} className="text-pink-300"       />, subtitle: `Albums matching "${query}"` },
        Playlists: { title: "Playlists", icon: <Sparkles size={22} className="text-cyan-300"      />, subtitle: `Playlists featuring "${query}"` },
    };

    return (
        <div className="relative min-h-full p-6 md:p-8" onMouseDown={closeAll}>
            <DynamicMusicBackground />

            <div className="relative z-10 space-y-8">

                {/* Filter chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold
                                transition-all duration-200 ${
                                activeFilter === f
                                    ? "bg-white text-black shadow-md"
                                    : "bg-white/[0.08] border border-white/15 text-white hover:bg-white/[0.14]"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Section heading for non-All tabs */}
                {activeFilter !== "All" && (
                    <div className="rounded-2xl border border-white/12
                        bg-white/[0.045] backdrop-blur-2xl
                        shadow-[0_6px_24px_rgba(0,0,0,0.22)] px-5 py-4">
                        <h1 className="text-white text-2xl font-bold flex items-center gap-3">
                            {TAB_META[activeFilter]?.icon}
                            {TAB_META[activeFilter]?.title}
                        </h1>
                        <p className="text-white/55 text-sm mt-0.5">
                            {TAB_META[activeFilter]?.subtitle}
                        </p>
                    </div>
                )}

                {/* Content */}
                {activeFilter === "All"       && renderAll()}
                {activeFilter === "Songs"     && renderSongs()}
                {activeFilter === "Artists"   && renderArtists()}
                {activeFilter === "Albums"    && renderAlbums()}
                {activeFilter === "Playlists" && renderPlaylists()}
            </div>

            {renderContextMenuPortal()}
            {renderPlaylistSubmenuPortal()}
            {renderArtistSubmenuPortal()}
        </div>
    );
};

export default SearchPage;
