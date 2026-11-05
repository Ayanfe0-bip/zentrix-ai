interface AnimatedBackgroundProps {
  intensity?: "subtle" | "normal" | "strong";
}

export default function AnimatedBackground({
  intensity = "normal",
}: AnimatedBackgroundProps) {
  return (
    <div
      className={`animated-background intensity-${intensity}`}
      aria-hidden="true"
    >
      <div className="ambient-light light-purple" />
      <div className="ambient-light light-blue" />
      <div className="ambient-light light-cyan" />

      <div className="floating-particles">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className={`particle particle-${index + 1}`}
          />
        ))}
      </div>

      <div className="ambient-vignette" />

      <style>{`
        .animated-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .ambient-light {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: .18;
        }

        .light-purple {
          top: 5%;
          left: 10%;
          background: #7c3aed;
          animation: ambient-drift 14s ease-in-out infinite;
        }

        .light-blue {
          top: 35%;
          right: 5%;
          background: #2563eb;
          animation: ambient-drift 18s ease-in-out infinite reverse;
        }

        .light-cyan {
          bottom: -10%;
          left: 35%;
          background: #0891b2;
          animation: ambient-drift 16s ease-in-out infinite;
        }

        .floating-particles {
          position: absolute;
          inset: 0;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 12px #8b5cf6;
          animation: particle-float 8s ease-in-out infinite;
        }

        ${Array.from({ length: 18 })
          .map(
            (_, index) => `
              .particle-${index + 1} {
                left: ${((index * 37 + 11) % 95) + 2}%;
                top: ${((index * 53 + 17) % 90) + 5}%;
                animation-delay: ${index * -0.7}s;
                animation-duration: ${7 + (index % 5) * 2}s;
                opacity: ${0.3 + (index % 4) * 0.15};
              }
            `
          )
          .join("")}

        .ambient-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 30%,
            rgba(8,11,24,.45) 100%
          );
        }

        .intensity-subtle .ambient-light {
          opacity: .08;
        }

        .intensity-strong .ambient-light {
          opacity: .28;
        }

        @keyframes ambient-drift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(35px, -25px) scale(1.15);
          }
        }

        @keyframes particle-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-25px);
          }
        }

        @media (max-width: 600px) {
          .ambient-light {
            width: 200px;
            height: 200px;
            filter: blur(75px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animated-background *,
          .animated-background *::before {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
