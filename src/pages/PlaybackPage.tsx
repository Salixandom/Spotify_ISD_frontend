import React from "react";
import { usePlayerStore } from "../store/playerStore";
import vinylPng from "../assets/vinyl.png";

function hashToHue(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hslToString(h: number, s: number, l: number, a: number): string {
  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rr) h = ((gg - bb) / delta) % 6;
    else if (max === gg) h = (bb - rr) / delta + 2;
    else h = (rr - gg) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
}

type Palette = {
  base: string;
  accent: string;
  contrast: string;
};

function useCoverPalette(coverUrl: string, fallbackHue: number): Palette {
  const [palette, setPalette] = React.useState<Palette>({
    base: hslToString(fallbackHue, 70, 52, 0.24),
    accent: hslToString((fallbackHue + 75) % 360, 76, 55, 0.22),
    contrast: hslToString((fallbackHue + 180) % 360, 68, 58, 0.2),
  });

  React.useEffect(() => {
    let cancelled = false;

    const setFallback = () => {
      if (cancelled) return;
      setPalette({
        base: hslToString(fallbackHue, 70, 52, 0.24),
        accent: hslToString((fallbackHue + 75) % 360, 76, 55, 0.22),
        contrast: hslToString((fallbackHue + 180) % 360, 68, 58, 0.2),
      });
    };

    if (!coverUrl) {
      setFallback();
      return () => {
        cancelled = true;
      };
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.referrerPolicy = "no-referrer";
    image.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 36;
        canvas.height = 36;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setFallback();
          return;
        }

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 16) {
          const alpha = data[i + 3];
          if (alpha < 40) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count += 1;
        }

        if (count === 0) {
          setFallback();
          return;
        }

        const avg = rgbToHsl(r / count, g / count, b / count);
        const hue = avg.h;
        const sat = clamp(avg.s + 12, 45, 86);
        const light = clamp(avg.l, 34, 60);

        setPalette({
          base: hslToString(hue, sat, light, 0.24),
          accent: hslToString((hue + 58) % 360, clamp(sat + 8, 50, 92), clamp(light + 3, 35, 64), 0.22),
          contrast: hslToString((hue + 180) % 360, clamp(sat - 12, 36, 80), clamp(light + 8, 36, 70), 0.2),
        });
      } catch {
        setFallback();
      }
    };

    image.onerror = () => setFallback();
    image.src = coverUrl;

    return () => {
      cancelled = true;
    };
  }, [coverUrl, fallbackHue]);

  return palette;
}

export const PlaybackPage: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    audioMetrics,
  } = usePlayerStore();

  const cover =
    currentTrack?.song?.cover_url ||
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1000&h=1000&fit=crop";
  const seedHue = hashToHue(`${currentTrack?.song?.title ?? "ambient"}-${cover}`);
  const palette = useCoverPalette(cover, seedHue);

  const energy = clamp(audioMetrics.amplitude * 1.5, 0, 1);
  const bass = clamp(audioMetrics.bass, 0, 1);
  const mid = clamp(audioMetrics.mid, 0, 1);
  const treble = clamp(audioMetrics.treble, 0, 1);
  const spectrum = audioMetrics.spectrum.length
    ? audioMetrics.spectrum
    : Array.from({ length: 24 }, () => 0);

  const p1x = Math.round(8 + spectrum[2] * 62);
  const p1y = Math.round(10 + spectrum[6] * 62);
  const p2x = Math.round(28 + spectrum[10] * 62);
  const p2y = Math.round(54 + spectrum[14] * 42);
  const p3x = Math.round(60 + spectrum[18] * 34);
  const p3y = Math.round(18 + spectrum[22] * 64);
  const p4x = Math.round(72 + spectrum[4] * 24);
  const p4y = Math.round(56 + spectrum[12] * 34);

  const bloomA = Math.round(38 + bass * 32);
  const bloomB = Math.round(34 + mid * 34);
  const bloomC = Math.round(32 + treble * 34);
  const bloomD = Math.round(30 + energy * 30);

  const hueSpin = Math.round(14 + bass * 18 + mid * 12 + treble * 10);
  const bubbleStrength = clamp((bass * 0.5 + mid * 0.3 + treble * 0.2), 0, 1);
  const bubbleSeeds = [1, 4, 7, 10, 13, 16, 19, 22];
  const bubbles = bubbleSeeds.map((idx, i) => {
    const amp = spectrum[idx] ?? 0;
    const size = 120 + amp * 180 + (i % 3) * 24;
    const left = 8 + ((i * 11) % 84);
    const top = 10 + ((i * 13) % 78);
    const sway = (spectrum[(idx + 2) % spectrum.length] - 0.5) * 22;
    const lift = (spectrum[(idx + 5) % spectrum.length] - 0.5) * 22;
    const opacity = 0.16 + amp * 0.28;

    return {
      id: `bubble-${i}`,
      size,
      left,
      top,
      sway,
      lift,
      opacity,
      anim: i % 2 === 0 ? "playback-bubble-a" : "playback-bubble-b",
      duration: `${8 + i * 1.2}s`,
      delay: `${i * 0.25}s`,
    };
  });

  return (
    <div
      className="relative h-full overflow-hidden"
      style={{
        background: `linear-gradient(145deg, rgba(5,8,18,0.98), rgba(10,8,24,0.98))`,
      }}
    >
      <style>
        {`
          @keyframes playback-float-a {
            0% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(28px, -20px, 0) scale(1.07); }
            100% { transform: translate3d(0, 0, 0) scale(1); }
          }
          @keyframes playback-float-b {
            0% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(-20px, 24px, 0) scale(1.08); }
            100% { transform: translate3d(0, 0, 0) scale(1); }
          }
          @keyframes playback-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes playback-wave-a {
            0% { transform: translate3d(-5%, 0, 0) scaleY(1); }
            50% { transform: translate3d(5%, 0, 0) scaleY(1.08); }
            100% { transform: translate3d(-5%, 0, 0) scaleY(1); }
          }
          @keyframes playback-wave-b {
            0% { transform: translate3d(6%, 0, 0) scaleY(1); }
            50% { transform: translate3d(-6%, 0, 0) scaleY(1.1); }
            100% { transform: translate3d(6%, 0, 0) scaleY(1); }
          }
          @keyframes playback-bubble-a {
            0% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(0, -14px, 0) scale(1.08); }
            100% { transform: translate3d(0, 0, 0) scale(1); }
          }
          @keyframes playback-bubble-b {
            0% { transform: translate3d(0, 0, 0) scale(1); }
            50% { transform: translate3d(0, 12px, 0) scale(1.06); }
            100% { transform: translate3d(0, 0, 0) scale(1); }
          }
        `}
      </style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-[-14%]"
          style={{
            background: `
              radial-gradient(circle at ${p1x}% ${p1y}%, ${palette.base} 0%, transparent ${bloomA}%),
              radial-gradient(circle at ${p2x}% ${p2y}%, ${palette.accent} 0%, transparent ${bloomB}%),
              radial-gradient(circle at ${p3x}% ${p3y}%, ${palette.contrast} 0%, transparent ${bloomC}%),
              radial-gradient(circle at ${p4x}% ${p4y}%, rgba(255,255,255,${0.1 + energy * 0.18}) 0%, transparent ${bloomD}%)
            `,
            opacity: 0.78 + energy * 0.24,
            filter: `saturate(${1.2 + energy * 0.52}) blur(${14 - energy * 3}px)`,
            transform: `scale(${1.06 + energy * 0.05}) rotate(${isPlaying ? hueSpin : 0}deg)`,
            transition: "transform 280ms ease, filter 180ms linear, opacity 180ms linear",
          }}
        />

        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
              background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,${0.22 + bubbleStrength * 0.24}), rgba(255,255,255,0.02) 42%, rgba(255,255,255,0) 72%)`,
              border: `1px solid rgba(255,255,255,${0.08 + bubbleStrength * 0.1})`,
              boxShadow: `0 0 ${26 + bubbleStrength * 42}px rgba(255,255,255,${0.08 + bubble.opacity * 0.35})`,
              opacity: bubble.opacity,
              filter: `blur(${2 + bubbleStrength * 2}px) saturate(${1.08 + bubbleStrength * 0.35})`,
              transform: `translate3d(${bubble.sway}px, ${bubble.lift}px, 0)`,
              animation: `${bubble.anim} ${bubble.duration} ease-in-out infinite`,
              animationPlayState: isPlaying ? "running" : "paused",
              animationDelay: bubble.delay,
            }}
          />
        ))}

        <div
          className="absolute inset-x-[-14%] top-[14%] h-[28%]"
          style={{
            background: `radial-gradient(92% 130% at 50% 100%, rgba(255,255,255,${0.08 + bass * 0.18}), rgba(255,255,255,0) 72%)`,
            mixBlendMode: "screen",
            opacity: 0.64 + bass * 0.26,
            filter: `blur(${8 + (1 - bass) * 8}px)`,
            animation: "playback-wave-a 8.5s ease-in-out infinite",
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        />

        <div
          className="absolute inset-x-[-14%] bottom-[10%] h-[32%]"
          style={{
            background: `radial-gradient(94% 130% at 50% 0%, rgba(255,255,255,${0.08 + treble * 0.2}), rgba(255,255,255,0) 74%)`,
            mixBlendMode: "screen",
            opacity: 0.58 + treble * 0.3,
            filter: `blur(${9 + (1 - treble) * 7}px)`,
            animation: "playback-wave-b 9.2s ease-in-out infinite",
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        />

        <div
          className="absolute inset-[-8%]"
          style={{
            background: `conic-gradient(from ${Math.round(120 + spectrum[8] * 220)}deg at 50% 52%,
              rgba(255,255,255,${0.04 + energy * 0.07}),
              rgba(255,255,255,0),
              rgba(255,255,255,${0.03 + bass * 0.05}),
              rgba(255,255,255,0),
              rgba(255,255,255,${0.03 + treble * 0.05})
            )`,
            mixBlendMode: "screen",
            opacity: 0.55 + energy * 0.3,
            animation: "playback-float-b 18s ease-in-out infinite",
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(125deg,
              rgba(255,255,255,${0.04 + bass * 0.06}) 0%,
              rgba(255,255,255,0.01) 28%,
              rgba(255,255,255,${0.03 + treble * 0.05}) 62%,
              rgba(255,255,255,0.02) 100%)`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 52%, rgba(255,255,255,${0.03 + energy * 0.07}), transparent 66%)`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(165deg, rgba(10,12,22,0.3), rgba(6,8,18,0.52))",
            backdropFilter: `blur(${17 + (1 - energy) * 6}px) saturate(${1.08 + energy * 0.26})`,
          }}
        />
      </div>

      <div className="relative z-10 h-full flex items-center justify-center px-3 md:px-8">
        <div className="relative w-[min(86vw,760px)] aspect-square flex items-center justify-center">
          <div
            className="absolute inset-[9%] rounded-full border border-white/15 bg-white/[0.04]"
            style={{
              backdropFilter: "blur(14px)",
              boxShadow: `0 0 ${24 + energy * 36}px rgba(255,255,255,${0.07 + energy * 0.14})`,
              transform: `scale(${1 + energy * 0.03})`,
              transition: "transform 120ms linear",
            }}
          />

          <div
            className="relative w-[84%] h-[84%]"
            style={{
              animation: "playback-spin 11s linear infinite",
              animationPlayState: isPlaying ? "running" : "paused",
              filter: `drop-shadow(0 0 ${18 + energy * 24}px rgba(255,255,255,${0.1 + energy * 0.14}))`,
            }}
          >
            <img src={vinylPng} alt="vinyl" className="w-full h-full object-contain" />

            <div className="absolute inset-[33.5%] rounded-full overflow-hidden border border-white/35 shadow-[0_0_24px_rgba(0,0,0,0.58)]">
              <img src={cover} alt="album art" className="w-full h-full object-cover" />
            </div>

            <div className="absolute inset-[47.2%] rounded-full bg-black/95 border border-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaybackPage;