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
        `}
      </style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -left-32 -top-8 w-[32rem] h-[32rem] rounded-full blur-[95px]"
          style={{
            background: palette.base,
            opacity: 0.45 + bass * 0.4,
            animation: "playback-float-a 12s ease-in-out infinite",
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        />
        <div
          className="absolute right-[-120px] bottom-[-100px] w-[32rem] h-[32rem] rounded-full blur-[105px]"
          style={{
            background: palette.accent,
            opacity: 0.42 + mid * 0.4,
            animation: "playback-float-b 14s ease-in-out infinite",
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        />
        <div
          className="absolute left-[34%] top-[30%] w-[26rem] h-[26rem] rounded-full blur-[120px]"
          style={{
            background: palette.contrast,
            opacity: 0.24 + treble * 0.38,
            animation: "playback-float-a 16s ease-in-out infinite",
            animationDirection: "reverse",
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 52%, rgba(255,255,255,${0.02 + energy * 0.06}), transparent 62%)`,
          }}
        />
        <div className="absolute inset-0 backdrop-blur-[26px]" />
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