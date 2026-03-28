import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Lock,
    AlertCircle,
    Music,
    Check,
    Disc3,
    Headphones,
    Radio,
    Mic2,
} from "lucide-react";
import { authAPI } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const cardRef = useRef<HTMLDivElement>(null);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isLoaded, setIsLoaded] = useState(false);

    const floatingParticles = useMemo(() => {
        const iconPool = [Music, Disc3, Headphones, Radio, Mic2];

        return Array.from({ length: 24 }, (_, i) => {
            const Icon = iconPool[Math.floor(Math.random() * iconPool.length)];
            const size = 18 + Math.random() * 14;
            const driftX = -30 + Math.random() * 60;
            const delay = -Math.random() * 20;
            const duration = 14 + Math.random() * 12;

            return {
                id: i,
                Icon,
                size,
                left: Math.random() * 100,
                top: Math.random() * 100,
                delay,
                duration,
                driftX,
                opacity: 0.14 + Math.random() * 0.16,
            };
        });
    }, []);

    const passwordRequirements = [
        { test: true, text: "At least 6 characters" },
    ];

    // Handle mouse movement for 3D tilt effect
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePosition({ x: 0, y: 0 });
    };

    // Entrance animation
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleLogin = async () => {
        setError(null);

        if (!username || !password) {
            setError("Please enter both username and password");
            return;
        }

        setIsLoading(true);

        try {
            await authAPI.login(username, password);
            const user = await authAPI.me();
            setUser(user);

            const redirectPath = sessionStorage.getItem("redirectAfterLogin");
            if (redirectPath) {
                sessionStorage.removeItem("redirectAfterLogin");
                navigate(redirectPath);
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error("Login error:", err);
            const error = err as {
                response?: { status?: number; data?: { detail?: string } };
            };
            if (error.response?.status === 401) {
                setError("Invalid username or password");
            } else if (error.response?.data?.detail) {
                setError(error.response.data.detail);
            } else {
                setError("Failed to login. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate 3D tilt transform
    const getTiltTransform = () => {
        if (
            !cardRef.current ||
            (mousePosition.x === 0 && mousePosition.y === 0)
        ) {
            return {};
        }

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((mousePosition.y - centerY) / centerY) * -3; // Max 3deg rotation
        const rotateY = ((mousePosition.x - centerX) / centerX) * 3;

        return {
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        };
    };

    // Calculate spotlight position
    const getSpotlightStyle = () => {
        if (
            !cardRef.current ||
            (mousePosition.x === 0 && mousePosition.y === 0)
        ) {
            return { opacity: 0 };
        }

        return {
            opacity: 1,
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 185, 84, 0.15), transparent 40%)`,
        };
    };

    return (
        <div className="h-screen w-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated gradient mesh background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
                {/* Moving gradient orbs */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-spotify-green/30 rounded-full blur-[120px] animate-blob" />
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-pink-500/20 rounded-full blur-[110px] animate-blob animation-delay-4000" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] animate-blob animation-delay-6000" />
            </div>

            {/* Floating music particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {floatingParticles.map((particle) => {
                    const Icon = particle.Icon;

                    return (
                        <div
                            key={particle.id}
                            className="absolute animate-float will-change-transform"
                            style={
                                {
                                    left: `${particle.left}%`,
                                    top: `${particle.top}%`,
                                    animationDelay: `${particle.delay}s`,
                                    animationDuration: `${particle.duration}s`,
                                    opacity: particle.opacity,
                                    "--float-drift-x": `${particle.driftX}px`,
                                } as React.CSSProperties
                            }
                        >
                            <Icon size={particle.size} />
                        </div>
                    );
                })}
            </div>

            {/* Animated wave at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden opacity-20">
                <div className="absolute bottom-0 w-[200%] h-full bg-gradient-to-t from-spotify-green to-transparent animate-wave" />
            </div>

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Main Content */}
            <div className="w-full max-w-md relative z-10">
                <div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className={`
            relative backdrop-blur-2xl bg-black/40 rounded-3xl p-10
            border border-white/10 overflow-hidden transition-all duration-300
            ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
          `}
                    style={getTiltTransform()}
                >
                    {/* Spotlight effect */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-3xl"
                        style={getSpotlightStyle()}
                    />

                    {/* Animated gradient border */}
                    <div className="absolute inset-0 rounded-3xl">
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-spotify-green via-purple-500 to-pink-500 opacity-20 animate-gradient-rotate blur-xl" />
                    </div>

                    {/* Noise texture overlay */}
                    <div
                        className="absolute inset-0 rounded-3xl opacity-[0.03]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Logo with animated ring */}
                        <div className="text-center mb-10">
                            <div className="flex items-center justify-center mb-6 relative">
                                {/* Rotating glow ring */}
                                <div className="absolute w-32 h-32 rounded-full animate-spin-slow">
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-spotify-green/50 border-r-purple-500/50" />
                                    <div
                                        className="absolute inset-2 rounded-full border-2 border-transparent border-b-pink-500/50 border-l-blue-500/50"
                                        style={{
                                            animationDirection: "reverse",
                                        }}
                                    />
                                </div>

                                {/* Pulsing glow */}
                                <div className="absolute w-28 h-28 bg-spotify-green/30 rounded-full blur-2xl animate-pulse-glow" />

                                {/* Logo */}
                                <div className="relative w-20 h-20 bg-gradient-to-br from-spotify-green to-emerald-600 rounded-full flex items-center justify-center shadow-2xl transform transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer z-10">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="black"
                                        className="w-12 h-12"
                                    >
                                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.261 9.899-.599 13.561 1.74.42.24.6.899.36 1.32zm.12-3.36c-3.84-2.28-10.14-2.461-13.8-1.38-.54.18-1.14-.12-1.32-.66-.18-.54.12-1.14.66-1.32 4.2-1.26 11.16-1.02 15.54 1.62.48.3.6.96.3 1.44-.3.48-.96.6-1.44.3z" />
                                    </svg>
                                </div>

                                {/* Visualizer bars */}
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-spotify-green/50 rounded-full animate-visualizer"
                                            style={{
                                                height: "20px",
                                                animationDelay: `${i * 0.1}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <h1 className="text-white text-4xl font-bold mb-3 tracking-tight">
                                Spotify
                            </h1>
                            <p className="text-gray-400 text-base">
                                Millions of songs. Free on Spotify.
                            </p>
                        </div>

                        {/* Login Form */}
                        <div className="space-y-5">
                            {/* Username Input */}
                            <div>
                                <Input
                                    label="Username"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    autoComplete="username"
                                    icon={
                                        <User
                                            size={18}
                                            className="text-gray-400"
                                        />
                                    }
                                    disabled={isLoading}
                                    className="bg-white/5 border-white/10 focus:border-spotify-green/50 focus:bg-white/10 transition-all duration-300"
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                    icon={
                                        <Lock
                                            size={18}
                                            className="text-gray-400"
                                        />
                                    }
                                    disabled={isLoading}
                                    showPasswordToggle={true}
                                    infoTooltip={
                                        <ul className="space-y-2">
                                            {passwordRequirements.map(
                                                (req, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center gap-2 text-xs"
                                                    >
                                                        <Check
                                                            size={14}
                                                            className="shrink-0 text-spotify-green"
                                                        />
                                                        <span className="text-white">
                                                            {req.text}
                                                        </span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleLogin();
                                        }
                                    }}
                                    className="bg-white/5 border-white/10 focus:border-spotify-green/50 focus:bg-white/10 transition-all duration-300"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-shake">
                                    <AlertCircle
                                        size={20}
                                        className="text-red-500 shrink-0"
                                    />
                                    <span className="text-sm text-red-400 font-medium">
                                        {error}
                                    </span>
                                </div>
                            )}

                            {/* Login Button */}
                            <div>
                                <Button
                                    onClick={handleLogin}
                                    disabled={isLoading}
                                    className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-spotify-green to-emerald-600 hover:from-spotify-green-hover hover:to-emerald-700 shadow-lg shadow-spotify-green/20 hover:shadow-spotify-green/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg
                                                className="animate-spin h-5 w-5"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12a8 8 0 00-8-8V0H0a12 12 0 0012 12h4z"
                                                />
                                            </svg>
                                            Logging in...
                                        </span>
                                    ) : (
                                        <>
                                            <span className="relative z-10">
                                                Log In
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-400 text-sm">
                                Don't have an account?{" "}
                                <button
                                    onClick={() => navigate("/register")}
                                    className="text-spotify-green hover:text-emerald-400 font-semibold underline underline-offset-4 hover:underline-offset-8 transition-all duration-200"
                                >
                                    Sign up for Spotify
                                </button>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-500/60 text-xs">
                                By logging in, you agree to Spotify's{" "}
                                <a
                                    href="#"
                                    className="hover:text-gray-400 underline underline-offset-2"
                                >
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                    href="#"
                                    className="hover:text-gray-400 underline underline-offset-2"
                                >
                                    Privacy Policy
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust indicator */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500/40 text-xs flex items-center justify-center gap-2">
                        <Lock size={14} />
                        Secure login powered by JWT encryption
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 20s infinite ease-in-out;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-6000 {
          animation-delay: 6s;
        }

        @keyframes float {
          0% {
            transform: translate3d(0, 110vh, 0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 0.45;
          }
          92% {
            opacity: 0.45;
          }
          100% {
            transform: translate3d(var(--float-drift-x, 0px), -120vh, 0) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float linear infinite;
          color: rgba(29, 185, 84, 0.75);
        }

        @keyframes wave {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-wave {
          animation: wave 15s linear infinite;
        }

        @keyframes gradient-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-gradient-rotate {
          animation: gradient-rotate 8s linear infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        @keyframes visualizer {
          0%, 100% {
            height: 8px;
          }
          50% {
            height: 20px;
          }
        }

        .animate-visualizer {
          animation: visualizer 0.8s ease-in-out infinite;
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
        </div>
    );
};
