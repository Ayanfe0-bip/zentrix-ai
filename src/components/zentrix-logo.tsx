"use client";

interface ZentrixLogoProps {
  size?: "small" | "medium" | "large";
  showName?: boolean;
  animated?: boolean;
}

export default function ZentrixLogo({
  size = "medium",
  showName = true,
  animated = true,
}: ZentrixLogoProps) {
  return (
    <div className={`zentrix-logo logo-${size}`}>
      <div className={`zentrix-mark ${animated ? "logo-animated" : ""}`}>
        <img
          src="/images/zentrix-ai-logo.jpg"
          alt="ZENTRIX AI"
          className="logo-image"
        />
      </div>

      {showName && (
        <div className="logo-wordmark">
          <span>ZENTRIX</span>
          <span className="logo-ai">AI</span>
        </div>
      )}

      <style>{`
        .zentrix-logo {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: white;
          user-select: none;
        }

        .zentrix-mark {
          position: relative;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid rgba(196,181,253,.4);
          background: #080817;
          box-shadow: 0 0 20px rgba(139,92,246,.3);
        }

        .logo-small .zentrix-mark {
          width: 35px;
          height: 35px;
          border-radius: 11px;
        }

        .logo-medium .zentrix-mark {
          width: 45px;
          height: 45px;
          border-radius: 14px;
        }

        .logo-large .zentrix-mark {
          width: 75px;
          height: 75px;
          border-radius: 22px;
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.55);
          transform-origin: 50% 22%;
        }

        .logo-wordmark {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 21px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .logo-ai {
          color: #22d3ee;
        }

        .logo-small .logo-wordmark {
          font-size: 15px;
        }

        .logo-large .logo-wordmark {
          font-size: 28px;
          letter-spacing: 2px;
        }

        .logo-animated {
          animation: logo-breathe 4s ease-in-out infinite;
        }

        @keyframes logo-breathe {
          0%, 100% {
            box-shadow: 0 0 18px rgba(139,92,246,.25);
          }
          50% {
            box-shadow:
              0 0 30px rgba(139,92,246,.5),
              0 0 40px rgba(34,211,238,.15);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-animated {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
