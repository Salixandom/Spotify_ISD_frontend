import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Home,
    Search,
    Bell,
    Users,
    Download,
    LogOut,
    User,
    FolderOpen,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const [searchValue, setSearchValue] = React.useState("");

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate("/search");
    };

    const handleBrowseClick = () => {
        navigate("/browse");
    };

    return (
        <header
            className="h-16 px-3 md:px-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-transparent"
            aria-label="Top navigation"
        >
            {/* LEFT: logo + history */}
            <div className="justify-self-start flex items-center gap-3 min-w-0">
                <button
                    onClick={() => navigate("/")}
                    className="w-10 h-10 rounded-full bg-white/92 text-black
                     flex items-center justify-center shadow-md shadow-black/30
                     hover:scale-105 transition-transform shrink-0"
                    aria-label="Spotify Home"
                    title="Spotify"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.505 17.308a.747.747 0 0 1-1.028.246c-2.814-1.72-6.357-2.11-10.53-1.158a.747.747 0 1 1-.333-1.456c4.566-1.045 8.48-.605 11.643 1.33a.747.747 0 0 1 .248 1.038Zm1.47-3.271a.936.936 0 0 1-1.286.311c-3.22-1.98-8.124-2.552-11.934-1.392a.936.936 0 1 1-.545-1.79c4.277-1.302 9.61-.67 13.457 1.695a.936.936 0 0 1 .308 1.176Zm.127-3.405c-3.856-2.29-10.23-2.502-13.91-1.39a1.124 1.124 0 1 1-.65-2.152c4.225-1.279 11.247-1.033 15.707 1.62a1.124 1.124 0 0 1-1.147 1.922Z" />
                    </svg>
                </button>

                <div className="hidden sm:flex items-center gap-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15
                       text-white/85 hover:text-white hover:bg-white/[0.14] transition-colors
                       flex items-center justify-center"
                        aria-label="Go back"
                        title="Back"
                    >
                        <ChevronLeft size={17} />
                    </button>
                    <button
                        onClick={() => navigate(1)}
                        className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15
                       text-white/85 hover:text-white hover:bg-white/[0.14] transition-colors
                       flex items-center justify-center"
                        aria-label="Go forward"
                        title="Forward"
                    >
                        <ChevronRight size={17} />
                    </button>
                </div>
            </div>

            {/* CENTER: Spotify-style Home + Search + Browse (glassmorphism) */}
            <div className="justify-self-center w-[min(100%,920px)] min-w-[380px] flex items-center gap-2">
                {/* Home button: fixed visual state on all pages */}
                <button
                    onClick={() => navigate("/")}
                    className="w-10 h-10 rounded-full border border-white/20
                    bg-white/[0.10] backdrop-blur-xl text-white
                    flex items-center justify-center shrink-0
                    hover:bg-white/[0.15] transition-colors"
                    aria-label="Home"
                    title="Home"
                >
                    <Home size={18} />
                </button>

                <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
                    <div
                        className="h-11 rounded-full border border-white/26
                        bg-white/[0.10] backdrop-blur-2xl
                        flex items-center gap-3 px-4
                        shadow-[0_8px_20px_rgba(0,0,0,0.20)]
                        transition-[background-color,border-color] duration-200
                        hover:bg-white/[0.13] hover:border-white/34"
                    >
                        <Search size={21} className="text-white/75 shrink-0" />

                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onFocus={() => navigate("/search")}
                            placeholder="What do you want to play?"
                            className="flex-1 min-w-0 bg-transparent outline-none
                            text-[28px] md:text-[18px] leading-none font-medium
                            text-white placeholder:text-white/65"
                            aria-label="Search"
                        />

                        {/* Divider + Browse button on far right */}
                        <div className="h-6 w-px bg-white/25 shrink-0" />
                        <button
                            type="button"
                            onClick={handleBrowseClick}
                            className="shrink-0 inline-flex items-center justify-center
                            w-9 h-9 rounded-full
                            text-white/80 hover:text-white
                            hover:bg-white/[0.14] transition-colors"
                            aria-label="Browse"
                            title="Browse"
                        >
                            <FolderOpen size={18} />
                        </button>

                        {/* tiny twist: subtle live glow dot next to browse */}
                        <span
                            className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-spotify-green/80 animate-pulse"
                            aria-hidden
                        />
                    </div>
                </form>
            </div>

            {/* RIGHT: utility + account */}
            <div className="justify-self-end flex items-center gap-1 md:gap-2 min-w-0">
                <button
                    className="hidden lg:inline-flex items-center gap-2 px-3 py-2 rounded-full
                     bg-white/[0.08] border border-white/15 text-white text-sm font-semibold
                     hover:bg-white/[0.14] transition-colors whitespace-nowrap"
                    aria-label="Install app"
                >
                    <Download size={15} />
                    Install App
                </button>

                <button
                    className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15
                     text-white/75 hover:text-white hover:bg-white/[0.14] transition-colors
                     flex items-center justify-center"
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <Bell size={15} />
                </button>

                <button
                    className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15
                     text-white/75 hover:text-white hover:bg-white/[0.14] transition-colors
                     flex items-center justify-center"
                    aria-label="Friend activity"
                    title="Friend activity"
                >
                    <Users size={15} />
                </button>

                {user ? (
                    <div className="flex items-center gap-2 ml-1">
                        <div
                            className="h-9 rounded-full bg-white/[0.08] border border-white/15
                         pl-1 pr-3 flex items-center gap-2"
                        >
                            <div className="w-7 h-7 rounded-full bg-spotify-green flex items-center justify-center text-black">
                                <User size={13} />
                            </div>
                            <span className="hidden md:block text-sm font-semibold text-white max-w-[120px] truncate">
                                {user.username}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/15
                         text-white/75 hover:text-white hover:bg-white/[0.14] transition-colors
                         flex items-center justify-center"
                            aria-label="Logout"
                            title="Logout"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold
                       hover:scale-105 transition-transform whitespace-nowrap"
                    >
                        Log in
                    </button>
                )}
            </div>
        </header>
    );
};

export default Navbar;
