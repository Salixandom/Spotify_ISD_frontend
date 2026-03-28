import React from "react";

type JellyRippleCardProps = {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    radiusClassName?: string;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * Overall strength of the liquid response.
     * Recommended range: 0.6 - 1.4
     */
    intensity?: number;
    /**
     * Enable subtle edge shimmer pass.
     */
    edgeShimmer?: boolean;
};

/**
 * Sophisticated liquid cursor-follow interaction:
 * - Cursor-following chromatic flow field
 * - Layered metaball-like blobs
 * - Caustic-style sheen + soft ripple rings
 * - Gentle spring-smoothed tracking (less flashlight feel, more fluid drift)
 *
 * Designed for glassmorphism cards.
 */
export const JellyRippleCard: React.FC<JellyRippleCardProps> = ({
    children,
    className = "",
    contentClassName = "",
    radiusClassName = "rounded-2xl",
    onClick,
    intensity = 1,
    edgeShimmer = true,
}) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const rafRef = React.useRef<number | null>(null);

    // Raw cursor position (0..1)
    const targetRef = React.useRef({ x: 0.5, y: 0.5 });
    // Smoothed liquid position (0..1)
    const smoothRef = React.useRef({ x: 0.5, y: 0.5 });
    const velocityRef = React.useRef({ x: 0, y: 0 });

    // Hover state mirrored into ref for RAF loop reads
    const isHoveringRef = React.useRef(false);

    const [renderPos, setRenderPos] = React.useState({ x: 50, y: 50 });
    const [isHovering, setIsHovering] = React.useState(false);

    const stopAnim = React.useCallback(() => {
        if (rafRef.current !== null) {
            window.cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    React.useEffect(() => {
        isHoveringRef.current = isHovering;
    }, [isHovering]);

    React.useEffect(() => {
        const step = () => {
            const spring = 0.11;
            const friction = 0.78;

            const tx = targetRef.current.x;
            const ty = targetRef.current.y;

            const dx = tx - smoothRef.current.x;
            const dy = ty - smoothRef.current.y;

            velocityRef.current.x =
                (velocityRef.current.x + dx * spring) * friction;
            velocityRef.current.y =
                (velocityRef.current.y + dy * spring) * friction;

            smoothRef.current.x += velocityRef.current.x;
            smoothRef.current.y += velocityRef.current.y;

            const px = Math.max(0, Math.min(1, smoothRef.current.x)) * 100;
            const py = Math.max(0, Math.min(1, smoothRef.current.y)) * 100;

            setRenderPos({ x: px, y: py });

            const moving =
                Math.abs(velocityRef.current.x) > 0.0004 ||
                Math.abs(velocityRef.current.y) > 0.0004;

            if (isHoveringRef.current || moving) {
                rafRef.current = window.requestAnimationFrame(step);
            } else {
                rafRef.current = null;
            }
        };

        if (isHovering && rafRef.current === null) {
            rafRef.current = window.requestAnimationFrame(step);
        }

        return () => {
            stopAnim();
        };
    }, [isHovering, stopAnim]);

    React.useEffect(() => {
        return () => {
            stopAnim();
        };
    }, [stopAnim]);

    const startAnim = React.useCallback(() => {
        if (rafRef.current !== null) return;

        const step = () => {
            const spring = 0.11;
            const friction = 0.78;

            const tx = targetRef.current.x;
            const ty = targetRef.current.y;

            const dx = tx - smoothRef.current.x;
            const dy = ty - smoothRef.current.y;

            velocityRef.current.x =
                (velocityRef.current.x + dx * spring) * friction;
            velocityRef.current.y =
                (velocityRef.current.y + dy * spring) * friction;

            smoothRef.current.x += velocityRef.current.x;
            smoothRef.current.y += velocityRef.current.y;

            const px = Math.max(0, Math.min(1, smoothRef.current.x)) * 100;
            const py = Math.max(0, Math.min(1, smoothRef.current.y)) * 100;

            setRenderPos({ x: px, y: py });

            const moving =
                Math.abs(velocityRef.current.x) > 0.0004 ||
                Math.abs(velocityRef.current.y) > 0.0004;

            if (isHoveringRef.current || moving) {
                rafRef.current = window.requestAnimationFrame(step);
            } else {
                rafRef.current = null;
            }
        };

        rafRef.current = window.requestAnimationFrame(step);
    }, []);

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;

        targetRef.current.x = Math.max(0, Math.min(1, nx));
        targetRef.current.y = Math.max(0, Math.min(1, ny));

        startAnim();
    };

    const handleEnter = () => {
        setIsHovering(true);
        startAnim();
    };

    const handleLeave = () => {
        setIsHovering(false);
        startAnim(); // settle smoothly
    };

    const i = Math.max(0.4, Math.min(1.8, intensity));

    return (
        <div
            ref={ref}
            onMouseMove={handleMove}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onClick={onClick}
            className={[
                "relative overflow-hidden isolate",
                "border border-white/12 bg-white/[0.055] backdrop-blur-2xl",
                "shadow-[0_12px_34px_rgba(0,0,0,0.30)]",
                "transition-[border-color,background-color,transform] duration-300",
                "hover:border-white/22 hover:bg-white/[0.08]",
                radiusClassName,
                className,
            ].join(" ")}
        >
            {/* Base moving liquid field */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    opacity: isHovering ? 0.95 : 0.45,
                    background: `
            radial-gradient(${Math.round(460 * i)}px ${Math.round(360 * i)}px at ${renderPos.x}% ${renderPos.y}%,
              rgba(52, 211, 153, ${0.17 * i}) 0%,
              rgba(59, 130, 246, ${0.13 * i}) 28%,
              rgba(168, 85, 247, ${0.12 * i}) 48%,
              rgba(236, 72, 153, ${0.1 * i}) 67%,
              rgba(255,255,255, 0.00) 82%
            )
          `,
                    filter: `blur(${Math.round(42 * i)}px) saturate(120%)`,
                }}
            />

            {/* Metaball cluster */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    opacity: isHovering ? 0.9 : 0.35,
                    background: `
            radial-gradient(180px 150px at ${Math.max(0, renderPos.x - 11)}% ${Math.max(0, renderPos.y - 7)}%,
              rgba(16, 185, 129, 0.22), transparent 70%),
            radial-gradient(170px 140px at ${Math.min(100, renderPos.x + 12)}% ${Math.min(100, renderPos.y + 8)}%,
              rgba(99, 102, 241, 0.20), transparent 72%),
            radial-gradient(155px 135px at ${Math.min(100, renderPos.x + 3)}% ${Math.max(0, renderPos.y - 13)}%,
              rgba(236, 72, 153, 0.16), transparent 74%)
          `,
                    filter: `blur(${Math.round(26 * i)}px)`,
                    mixBlendMode: "screen",
                }}
            />

            {/* Caustic sheen */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-200"
                style={{
                    opacity: isHovering ? 0.75 : 0.2,
                    background: `
            radial-gradient(120px 90px at ${renderPos.x}% ${renderPos.y}%,
              rgba(255,255,255,0.34), rgba(255,255,255,0.06) 42%, transparent 72%)
          `,
                    filter: `blur(${Math.round(10 * i)}px)`,
                    mixBlendMode: "screen",
                }}
            />

            {/* Soft ripple */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-250"
                style={{
                    opacity: isHovering ? 0.75 : 0,
                    background: `
            radial-gradient(220px circle at ${renderPos.x}% ${renderPos.y}%,
              rgba(255,255,255,0.18) 0%,
              rgba(255,255,255,0.10) 16%,
              rgba(255,255,255,0.00) 42%)
          `,
                    filter: `blur(${Math.round(8 * i)}px)`,
                }}
            />

            {/* Ambient blobs */}
            <div
                aria-hidden
                className="pointer-events-none absolute -inset-[18%] jelly-liquid-ambient"
                style={{
                    opacity: isHovering ? 0.55 : 0.32,
                    mixBlendMode: "screen",
                }}
            />

            {/* Edge shimmer */}
            {edgeShimmer && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 jelly-liquid-edge"
                    style={{ opacity: isHovering ? 0.45 : 0.2 }}
                />
            )}

            {/* Content */}
            <div className={["relative z-10", contentClassName].join(" ")}>
                {children}
            </div>

            <style>{`
        @keyframes jelly-liquid-drift {
          0% {
            transform: translate3d(-2.8%, -1.8%, 0) rotate(0deg) scale(1);
          }
          25% {
            transform: translate3d(2.4%, -1.3%, 0) rotate(4deg) scale(1.02);
          }
          50% {
            transform: translate3d(1.1%, 2.2%, 0) rotate(-3deg) scale(0.99);
          }
          75% {
            transform: translate3d(-2.1%, 1.4%, 0) rotate(2deg) scale(1.015);
          }
          100% {
            transform: translate3d(-2.8%, -1.8%, 0) rotate(0deg) scale(1);
          }
        }

        .jelly-liquid-ambient {
          background:
            radial-gradient(52% 45% at 30% 26%, rgba(59,130,246,0.20), transparent 72%),
            radial-gradient(46% 44% at 72% 60%, rgba(16,185,129,0.22), transparent 74%),
            radial-gradient(42% 36% at 52% 74%, rgba(168,85,247,0.18), transparent 76%),
            radial-gradient(36% 32% at 64% 24%, rgba(236,72,153,0.16), transparent 78%);
          filter: blur(24px) saturate(115%);
          animation: jelly-liquid-drift 7.2s ease-in-out infinite;
        }

        .jelly-liquid-edge {
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.18),
            inset 0 -1px 0 rgba(255,255,255,0.08),
            inset 0 0 34px rgba(59,130,246,0.08);
          transition: opacity 220ms ease;
        }
      `}</style>
        </div>
    );
};

export default JellyRippleCard;
