import React, { memo } from 'react';

interface OuterRingVisualizerProps {
  spectrum: number[];
  isActive: boolean;
}

// Hoist function outside component to avoid recreation on every render
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

export const OuterRingVisualizer: React.FC<OuterRingVisualizerProps> = memo(({
  spectrum,
  isActive,
}) => {
  const segments = 24;
  const radius = 48; // percentage

  return (
    <div
      className={`absolute inset-0 pointer-events-none transition-all duration-300`}
      style={{
        opacity: isActive ? 1 : 0.3,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {Array.from({ length: segments }).map((_, i) => {
          const angle = (i / segments) * 360;
          const spectrumIndex = Math.floor((i / segments) * spectrum.length);
          const value = spectrum[spectrumIndex] || 0;

          // Calculate bar height (4-16% range)
          const barHeight = 4 + value * 12;

          // Calculate color (green to yellow)
          const hue = 120 + value * 60;
          const color = `hsl(${hue}, 70%, 50%)`;

          // Calculate opacity
          const opacity = 0.6 + value * 0.4;

          // Calculate start point (on the ring)
          const start = polarToCartesian(50, 50, radius, angle);

          // Calculate end point (radiating outward)
          const end = polarToCartesian(50, 50, radius + barHeight, angle);

          return (
            <line
              key={i}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={color}
              strokeWidth="0.5"
              strokeLinecap="round"
              style={{
                opacity,
                transition: 'all 50ms ease-out',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
});


export default OuterRingVisualizer;
