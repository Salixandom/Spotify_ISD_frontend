import React, { useMemo } from "react";
import {
    Music,
    Disc3,
    Headphones,
    Radio,
    Mic2,
    Guitar,
    Piano,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type DynamicMusicBackgroundVariant = "green" | "pink" | "purple" | "mixed";
type DynamicMusicBackgroundDensity = "low" | "medium" | "high";

interface DynamicMusicBackgroundProps {
    className?: string;
    variant?: DynamicMusicBackgroundVariant;
    density?: DynamicMusicBackgroundDensity;
    showGrid?: boolean;
    showWave?: boolean;
    waveColorClassName?: string;
    iconClassName?: string;
    orbOpacityClassName?: string;
}

interface FloatingParticle {
    id: number;
    left: string;
    top: string;
    size: number;
    animationDelay: string;
    animationDuration: string;
    driftX: string;
    rotation: string;
    icon: LucideIcon;
    opacity: number;
}

const ICON_POOL: LucideIcon[] = [
    Music,
    Disc3,
    Headphones,
    Radio,
    Mic2,
    Guitar,
    Piano,
];

const DENSITY_COUNTS: Record<DynamicMusicBackgroundDensity, number> = {
    low: 14,
    medium: 24,
    high: 34,
};

const ORB_CONFIG: Record<
    DynamicMusicBackgroundVariant,
    {
        orb1: string;
        orb2: string;
        orb3: string;
        orb4: string;
    }
> = {
    green: {
        orb1: "bg-spotify-green/30",
        orb2: "bg-emerald-400/20",
        orb3: "bg-cyan-400/15",
        orb4: "bg-blue-500/15",
    },
    pink: {
        orb1: "bg-pink-500/30",
        orb2: "bg-purple-500/25",
        orb3: "bg-spotify-green/15",
        orb4: "bg-blue-500/15",
    },
    purple: {
        orb1: "bg-purple-500/30",
        orb2: "bg-fuchsia-500/22",
        orb3: "bg-indigo-500/18",
        orb4: "bg-cyan-500/14",
    },
    mixed: {
        orb1: "bg-spotify-green/22",
        orb2: "bg-purple-500/22",
        orb3: "bg-pink-500/16",
        orb4: "bg-blue-500/14",
    },
};

/**
 * Deterministic hash-based PRNG helpers.
 * These avoid Math.random() during render and keep output stable for a given seed.
 */
const hashString = (input: string): number => {
    let h = 2166136261 >>> 0; // FNV-1a basis
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

const randomFromSeed = (seed: string): number => {
    // xorshift32 from hashed seed
    let x = hashString(seed) || 1;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296; // 0..1
};

const pickInRange = (seed: string, min: number, max: number): number => {
    return min + randomFromSeed(seed) * (max - min);
};

const createParticles = (
    density: DynamicMusicBackgroundDensity,
): FloatingParticle[] => {
    const count = DENSITY_COUNTS[density];

    return Array.from({ length: count }, (_, i) => {
        const base = `dynamic-bg:${density}:particle:${i}`;

        const left = `${pickInRange(`${base}:left`, 0, 100)}%`;
        const top = `${pickInRange(`${base}:top`, 0, 100)}%`;
        const size = Math.round(pickInRange(`${base}:size`, 16, 32));
        const delay = `${pickInRange(`${base}:delay`, 0, 12)}s`;
        const duration = `${pickInRange(`${base}:duration`, 12, 22)}s`;
        const driftX = `${pickInRange(`${base}:driftX`, -35, 35)}px`;
        const rotation = `${pickInRange(`${base}:rotation`, 0, 360)}deg`;
        const opacity = pickInRange(`${base}:opacity`, 0.14, 0.34);

        const iconIndex =
            Math.floor(pickInRange(`${base}:iconIndex`, 0, ICON_POOL.length)) %
            ICON_POOL.length;
        const icon = ICON_POOL[iconIndex];

        return {
            id: i,
            left,
            top,
            size,
            animationDelay: delay,
            animationDuration: duration,
            driftX,
            rotation,
            icon,
            opacity,
        };
    });
};

export const DynamicMusicBackground: React.FC<DynamicMusicBackgroundProps> = ({
    className = "",
    variant = "mixed",
    density = "medium",
    showGrid = true,
    showWave = true,
    waveColorClassName = "from-spotify-green",
    iconClassName,
    orbOpacityClassName,
}) => {
    const particles = useMemo<FloatingParticle[]>(
        () => createParticles(density),
        [density],
    );

    const orb = ORB_CONFIG[variant];
    const computedIconClassName =
        iconClassName ||
        (variant === "pink"
            ? "text-pink-400/30"
            : variant === "purple"
              ? "text-purple-300/30"
              : "text-spotify-green/28");

    return (
        <div
            className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
            aria-hidden="true"
        >
            {/* Base gradient backdrop */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

            {/* Animated gradient orbs */}
            <div
                className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-blob ${orb.orb1} ${orbOpacityClassName ?? ""}`}
            />
            <div
                className={`absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-blob animation-delay-2000 ${orb.orb2} ${orbOpacityClassName ?? ""}`}
            />
            <div
                className={`absolute bottom-1/4 left-1/3 w-[450px] h-[450px] rounded-full blur-[110px] animate-blob animation-delay-4000 ${orb.orb3} ${orbOpacityClassName ?? ""}`}
            />
            <div
                className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] animate-blob animation-delay-6000 ${orb.orb4} ${orbOpacityClassName ?? ""}`}
            />

            {/* Floating music particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((particle) => {
                    const Icon = particle.icon;

                    return (
                        <div
                            key={particle.id}
                            className={`absolute animate-music-float ${computedIconClassName}`}
                            style={
                                {
                                    left: particle.left,
                                    top: particle.top,
                                    animationDelay: `-${parseFloat(particle.animationDelay)}s`,
                                    animationDuration:
                                        particle.animationDuration,
                                    animationFillMode: "both",
                                    willChange: "transform, opacity",
                                    opacity: particle.opacity,
                                    transform: `rotate(${particle.rotation})`,
                                    "--float-drift-x": particle.driftX,
                                } as React.CSSProperties
                            }
                        >
                            <Icon size={particle.size} />
                        </div>
                    );
                })}
            </div>

            {/* Bottom wave */}
            {showWave && (
                <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden opacity-20">
                    <div
                        className={`absolute bottom-0 w-[200%] h-full bg-gradient-to-t ${waveColorClassName} to-transparent animate-wave`}
                    />
                </div>
            )}

            {/* Subtle grid */}
            {showGrid && (
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
            )}

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

        @keyframes music-float {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 0.35;
          }
          92% {
            opacity: 0.35;
          }
          100% {
            transform: translate3d(var(--float-drift-x, 0px), -110vh, 0) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-music-float {
          animation: music-float linear infinite;
          animation-fill-mode: both;
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
      `}</style>
        </div>
    );
};

export default DynamicMusicBackground;
