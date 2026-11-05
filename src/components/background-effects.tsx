export default function BackgroundEffects() {
  return (
    <div className="neural-background" aria-hidden="true">
      <div className="neural-glow glow-one" />
      <div className="neural-glow glow-two" />

      <svg
        className="neural-network"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="neural-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>

          <radialGradient id="neural-node">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#22d3ee" />
          </radialGradient>
        </defs>

        <g
          stroke="url(#neural-line)"
          strokeWidth="1"
          fill="none"
          opacity=".35"
        >
          <path d="M80 100 L220 180 L350 90 L500 190 L680 100 L850 200" />
          <path d="M80 100 L130 350 L300 280 L500 190" />
          <path d="M220 180 L300 280 L450 420 L620 330" />
          <path d="M350 90 L450 420 L580 550" />
          <path d="M500 190 L620 330 L850 200" />
          <path d="M680 100 L620 330 L780 450 L930 350" />
          <path d="M130 350 L250 550 L450 420" />
          <path d="M620 330 L650 600 L780 450" />
          <path d="M780 450 L930 350 L850 200" />
          <path d="M250 550 L580 550 L650 600" />
        </g>

        <g fill="url(#neural-node)">
          {[
            [80, 100],
            [220, 180],
            [350, 90],
            [500, 190],
            [680, 100],
            [850, 200],
            [130, 350],
            [300, 280],
            [450, 420],
            [620, 330],
            [930, 350],
            [250, 550],
            [580, 550],
            [650, 600],
            [780, 450],
          ].map(([cx, cy], index) => (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={index % 3 === 0 ? 4 : 2.5}
              className="neural-node"
            />
          ))}
        </g>

        <g fill="#22d3ee">
          <circle cx="220" cy="180" r="3" className="neural-particle" />
          <circle cx="500" cy="190" r="3" className="neural-particle delay-one" />
          <circle cx="620" cy="330" r="3" className="neural-particle delay-two" />
          <circle cx="780" cy="450" r="3" className="neural-particle delay-three" />
        </g>
      </svg>

      <div className="background-grid" />

      <style>{`
        .neural-background {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          opacity: .55;
        }

        .neural-network {
          position: absolute;
          width: 100%;
          height: 100%;
          inset: 0;
        }

        .neural-glow {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          filter: blur(110px);
          opacity: .14;
        }

        .glow-one {
          top: 10%;
          left: 5%;
          background: #7c3aed;
          animation: neural-float 12s ease-in-out infinite;
        }

        .glow-two {
          right: 5%;
          bottom: 5%;
          background: #0891b2;
          animation: neural-float 15s ease-in-out infinite reverse;
        }

        .neural-node {
          filter: drop-shadow(0 0 5px #8b5cf6);
          animation: node-pulse 4s ease-in-out infinite;
        }

        .neural-particle {
          filter: drop-shadow(0 0 8px #22d3ee);
          animation: particle-pulse 2s ease-in-out infinite;
        }

        .delay-one {
          animation-delay: .5s;
        }

        .delay-two {
          animation-delay: 1s;
        }

        .delay-three {
          animation-delay: 1.5s;
        }

        .background-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,.025) 1px, transparent 1px);
          background-size: 55px 55px;
          mask-image: linear-gradient(to bottom, black, transparent);
        }

        @keyframes neural-float {
          0%, 100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(35px, -25px);
          }
        }

        @keyframes node-pulse {
          0%, 100% {
            opacity: .5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes particle-pulse {
          0%, 100% {
            opacity: .3;
            transform: scale(.7);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @media (max-width: 600px) {
          .neural-background {
            opacity: .3;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .neural-background *,
          .neural-background *::before {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
