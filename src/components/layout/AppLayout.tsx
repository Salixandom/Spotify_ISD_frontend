import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { RightSidebar } from "./RightSidebar";
import { BottomPlayer } from "./BottomPlayer";
import { DynamicMusicBackground } from "../ui/DynamicMusicBackground";
import { PageFooter } from "./PageFooter";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

/**
 * Glassmorphism app shell with persistent Spotify-like regions:
 * - Top bar
 * - Left library panel
 * - Center route outlet
 * - Right now-playing/info panel
 * - Bottom player
 */
export const AppLayout: React.FC = () => {
    useKeyboardShortcuts();
    const location = useLocation();
    const isPlaybackMode = location.pathname === "/playback";

    return (
        <div className="relative h-screen w-screen overflow-hidden text-white">
            {/* Reusable dynamic music background (same visual language as auth pages) */}
            <DynamicMusicBackground
                variant="mixed"
                density="medium"
                showGrid={true}
                showWave={false}
                iconClassName="text-white/20"
                orbOpacityClassName="opacity-90"
            />

            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "rgba(20, 20, 28, 0.9)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.12)",
                        backdropFilter: "blur(10px)",
                    },
                }}
            />

            {isPlaybackMode ? (
                <div className="relative z-10 h-full flex flex-col">
                    <main className="flex-1 min-h-0">
                        <div className="h-full overflow-hidden">
                            <Outlet />
                        </div>
                    </main>

                    <div className="mx-2 mb-2 rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden">
                        <BottomPlayer />
                    </div>
                </div>
            ) : (
                <div className="relative z-10 h-full p-2 md:p-3 flex flex-col gap-2 md:gap-3">
                    {/* Top navigation */}
                    <div className="rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-visible">
                        <Navbar />
                    </div>

                    {/* Main shell body */}
                    <div className="flex-1 min-h-0 flex gap-2 md:gap-3">
                        {/* Left column */}
                        <div className="w-[320px] xl:w-[340px] min-w-[300px]">
                            <div className="h-full rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
                                <Sidebar />
                            </div>
                        </div>

                        {/* Center content */}
                        <main className="flex-1 min-w-0">
                            <div className="h-full rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
                                <div className="h-full overflow-y-auto">
                                    <Outlet />
                                    {location.pathname !== "/profile" && <PageFooter />}
                                </div>
                            </div>
                        </main>

                        {/* Right column */}
                        <div className="w-[340px] xl:w-[360px] min-w-[320px] hidden lg:block">
                            <div className="h-full rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
                                <RightSidebar />
                            </div>
                        </div>
                    </div>

                    {/* Bottom player */}
                    <div className="rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden">
                        <BottomPlayer />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppLayout;
