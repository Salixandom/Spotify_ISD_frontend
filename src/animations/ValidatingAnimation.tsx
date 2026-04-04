import React from 'react';

export const ValidatingAnimation: React.FC = () => {
  return (
    <div className="relative w-64 h-64 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" className="validate-animation">
          <defs>
            <radialGradient id="validateGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1db954" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#1db954" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Background glow */}
          <circle cx="100" cy="100" r="70" fill="url(#validateGlow)" className="glow-bg"/>

          {/* Happy waiting face */}
          <g className="happy-face">
            <circle
              cx="100"
              cy="100"
              r="45"
              fill="rgba(29, 185, 84, 0.1)"
              stroke="#1db954"
              strokeWidth="2.5"
              className="face-circle"
            />

            {/* Happy eyes */}
            <g className="eyes">
              <ellipse cx="85" cy="92" rx="6" ry="7" fill="#1db954" className="eye"/>
              <ellipse cx="115" cy="92" rx="6" ry="7" fill="#1db954" className="eye"/>
              <circle cx="86" cy="92" r="3" fill="#1a1a1a" className="pupil"/>
              <circle cx="116" cy="92" r="3" fill="#1a1a1a" className="pupil"/>
              <circle cx="88" cy="90" r="1.5" fill="rgba(255,255,255,0.7)" className="eye-shine"/>
              <circle cx="118" cy="90" r="1.5" fill="rgba(255,255,255,0.7)" className="eye-shine"/>
            </g>

            {/* Big happy smile */}
            <path
              d="M 78 118 Q 100 132 122 118"
              fill="none"
              stroke="#1db954"
              strokeWidth="3"
              strokeLinecap="round"
              className="smile"
            />
          </g>

          {/* Music icons floating */}
          <g className="music-icons">
            <text x="45" y="65" fontSize="14" fill="#1db954" className="music-icon-1">♪</text>
            <text x="160" y="60" fontSize="16" fill="#1db954" className="music-icon-2">♫</text>
            <text x="40" y="140" fontSize="12" fill="#1db954" className="music-icon-3">♪</text>
            <text x="165" y="135" fontSize="14" fill="#1db954" className="music-icon-4">♫</text>
          </g>

          {/* Loading dots - wave motion */}
          <g className="loading-dots">
            <circle cx="80" cy="165" r="4" fill="#1db954" className="dot-1"/>
            <circle cx="100" cy="165" r="4" fill="#1db954" className="dot-2"/>
            <circle cx="120" cy="165" r="4" fill="#1db954" className="dot-3"/>
          </g>
        </svg>
      </div>

      <style>{`
        .validate-animation {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .glow-bg {
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        .happy-face {
          animation: happyBounce 2s ease-in-out infinite;
        }

        @keyframes happyBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .face-circle {
          animation: faceBreath 3s ease-in-out infinite;
        }

        @keyframes faceBreath {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .eye {
          animation: blink 4s ease-in-out infinite;
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
          animation: patientLook 3s ease-in-out infinite;
        }

        @keyframes patientLook {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(2px);
          }
        }

        .smile {
          animation: smileAnim 2.5s ease-in-out infinite;
        }

        @keyframes smileAnim {
          0%, 100% {
            d: path("M 78 118 Q 100 132 122 118");
          }
          50% {
            d: path("M 78 118 Q 100 135 122 118");
          }
        }

        .music-icon-1 {
          animation: musicFloat 3s ease-in-out infinite;
        }

        .music-icon-2 {
          animation: musicFloat 3s ease-in-out infinite 1s;
        }

        .music-icon-3 {
          animation: musicFloat 3s ease-in-out infinite 2s;
        }

        .music-icon-4 {
          animation: musicFloat 3s ease-in-out infinite 0.5s;
        }

        @keyframes musicFloat {
          0%, 100% {
            opacity: 0.4;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }

        .dot-1 {
          animation: dotWave 2s ease-in-out infinite;
        }

        .dot-2 {
          animation: dotWave 2s ease-in-out infinite 0.2s;
        }

        .dot-3 {
          animation: dotWave 2s ease-in-out infinite 0.4s;
        }

        @keyframes dotWave {
          0%, 100% {
            cy: 165;
            opacity: 0.5;
          }
          50% {
            cy: 160;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
