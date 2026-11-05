import { BrainCircuit } from "lucide-react";

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
        <div className="logo-glow" />
        <BrainCircuit className="logo-symbol" />
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
          color: #ffffff;
          font-family: "Space Grotesk", sans-serif;
          user-select: none;
        }

        .zentrix-mark {
          position: relative;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          overflow: hidden;
          color: #ddd6fe;
          border: 1px solid rgba(196,181,253,.4);
          background: linear-gradient(
            145deg,
            #5425a5,
            #182c65 60%,
            #102b45
          );
          box-shadow:
            0 0 20px rgba(139,92,246,.3),
            inset 0 0 15px rgba(34,211,238,.1);
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

        .logo-small .logo-symbol {
          width: 19px;
          height: 19px;
        }

        .logo-medium .logo-symbol {
          width: 25px;
          height: 25px;
        }

        .logo-large .logo-symbol {
          width: 43px;
          height: 43px;
        }

        .logo-symbol {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 0 7px #a78bfa);
        }

        .logo-glow {
          position: absolute;
          width: 70%;
          height: 70%;
          border-radius: 50%;
          background: #8b5cf6;
          filter: blur(18px);
          opacity: .35;
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
            box-shadow: 0 0 20px rgba(139,92,246,.25);
          }
          50% {
            box-shadow:
              0 0 35px rgba(139,92,246,.55),
              0 0 45px rgba(34,211,238,.15);
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
