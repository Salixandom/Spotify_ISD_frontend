import React from 'react';

export const InvalidInviteAnimation: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-64 h-64 mx-auto ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="240" height="240" viewBox="0 0 240 240" className="error-animation">
          {/* Sad Face - LEFT side */}
          <g className="face">
            <circle
              cx="65"
              cy="120"
              r="48"
              fill="rgba(29, 185, 84, 0.1)"
              stroke="#1db954"
              strokeWidth="2.5"
            />

            {/* Eyes */}
            <g className="eyes">
              <ellipse cx="52" cy="111" rx="6" ry="7" fill="#1db954" className="eye"/>
              <ellipse cx="78" cy="111" rx="6" ry="7" fill="#1db954" className="eye"/>
              <circle cx="53" cy="111" r="3" fill="#1a1a1a" className="pupil"/>
              <circle cx="79" cy="111" r="3" fill="#1a1a1a" className="pupil"/>
            </g>

            {/* Sad mouth */}
            <path
              d="M 49 142 Q 65 131 81 142"
              fill="none"
              stroke="#1db954"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="mouth"
            />

            {/* Tear */}
            <path
              d="M 58 126 Q 55 132 58 138 Q 61 132 58 126"
              fill="rgba(29, 185, 84, 0.7)"
              className="tear"
            />
          </g>

          {/* Clock - RIGHT side */}
          <g className="clock">
            {/* Outer ring */}
            <circle
              cx="185"
              cy="120"
              r="52"
              fill="rgba(239, 68, 68, 0.1)"
              stroke="#ef4444"
              strokeWidth="2.5"
            />

            {/* Clock marks - all 12 */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
              const isMain = [0, 90, 180, 270].includes(angle);
              const innerR = 44;
              const outerR = isMain ? 50 : 47;
              const x1 = 185 + innerR * Math.cos((angle - 90) * Math.PI / 180);
              const y1 = 120 + innerR * Math.sin((angle - 90) * Math.PI / 180);
              const x2 = 185 + outerR * Math.cos((angle - 90) * Math.PI / 180);
              const y2 = 120 + outerR * Math.sin((angle - 90) * Math.PI / 180);

              return (
                <line
                  key={angle}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#ef4444"
                  strokeWidth={isMain ? 2 : 1.5}
                  strokeLinecap="round"
                  opacity={isMain ? 0.7 : 0.4}
                />
              );
            })}

            {/* Hour hand */}
            <line
              x1="185"
              y1="120"
              x2="185"
              y2="95"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
              className="hour-hand"
            />

            {/* Minute hand */}
            <line
              x1="185"
              y1="120"
              x2="212"
              y2="120"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="minute-hand"
            />

            {/* Second hand */}
            <line
              x1="185"
              y1="128"
              x2="185"
              y2="85"
              stroke="#1db954"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="second-hand"
            />

            {/* Center dot */}
            <circle cx="185" cy="120" r="3" fill="#ef4444"/>
          </g>
        </svg>
      </div>

      <style>{`
        .error-animation {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .face {
          animation: slideIn 0.6s ease-out 0.2s both;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .eye {
          animation: blink 5s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes blink {
          0%, 45%, 55%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.1);
          }
        }

        .pupil {
          animation: lookRight 3s ease-in-out infinite;
        }

        @keyframes lookRight {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(2px);
          }
        }

        .mouth {
          animation: sadMouth 2s ease-out 0.8s both;
        }

        @keyframes sadMouth {
          from {
            d: path("M 51 138 Q 65 146 79 138");
          }
          to {
            d: path("M 49 142 Q 65 131 81 142");
          }
        }

        .tear {
          opacity: 0;
          animation: tearDrop 3s ease-in-out 1.5s infinite;
        }

        @keyframes tearDrop {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(18px);
          }
        }

        .clock {
          animation: slideInRight 0.6s ease-out 0.3s both;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .hour-hand {
          animation: tick 3s ease-in-out infinite;
          transform-origin: 185px 120px;
        }

        .minute-hand {
          animation: tick 3s ease-in-out infinite 0.1s;
          transform-origin: 185px 120px;
        }

        .second-hand {
          animation: rotate 8s linear infinite;
          transform-origin: 185px 120px;
        }

        @keyframes tick {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(4deg);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
