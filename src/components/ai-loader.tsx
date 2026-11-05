import { BrainCircuit, Sparkles } from "lucide-react";

interface AILoaderProps {
  message?: string;
  compact?: boolean;
}

export default function AILoader({
  message = "ZENTRIX is thinking",
  compact = false,
}: AILoaderProps) {
  return (
    <div className={`ai-loader ${compact ? "loader-compact" : ""}`}>
      <div className="loader-visual">
        <div className="loader-orbit orbit-a" />
        <div className="loader-orbit orbit-b" />
        <div className="loader-orbit orbit-c" />

        <div className="loader-core">
          <div className="loader-core-glow" />
          <BrainCircuit className="loader-brain" />
        </div>

        <Sparkles className="loader-spark spark-one" />
        <Sparkles className="loader-spark spark-two" />
        <Sparkles className="loader-spark spark-three" />
      </div>

      <div className="loader-message">
        <span>{message}</span>
        <span className="loader-dots">
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="loader-progress">
        <div className="loader-progress-bar" />
      </div>

      <style>{`
        .ai-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 25px;
          color: #c4b5fd;
        }

        .loader-visual {
          position: relative;
          width: 145px;
          height: 145px;
          display: grid;
          place-items: center;
        }

        .loader-orbit {
          position: absolute;
          border: 1px solid rgba(139,92,246,.35);
          border-radius: 50%;
        }

        .orbit-a {
          width: 75px;
          height: 75px;
          border-top-color: #22d3ee;
          animation: loader-spin 3s linear infinite;
        }

        .orbit-b {
          width: 110px;
          height: 110px;
          border-right-color: #22d3ee;
          animation: loader-spin 5s linear infinite reverse;
        }

        .orbit-c {
          width: 140px;
          height: 140px;
          border-style: dashed;
          opacity: .45;
          animation: loader-spin 12s linear infinite;
        }

        .loader-core {
          position: relative;
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(196,181,253,.6);
          border-radius: 21px;
          background: linear-gradient(145deg,#39236d,#112d52);
          box-shadow: 0 0 35px rgba(139,92,246,.35);
          animation: loader-pulse 2s ease-in-out infinite;
        }

        .loader-core-glow {
          position: absolute;
          width: 35px;
          height: 35px;
          background: #8b5cf6;
          filter: blur(20px);
          opacity: .7;
        }

        .loader-brain {
          position: relative;
          z-index: 2;
          width: 32px;
          height: 32px;
          color: #ddd6fe;
        }

        .loader-spark {
          position: absolute;
          width: 15px;
          height: 15px;
          color: #22d3ee;
          filter: drop-shadow(0 0 5px #22d3ee);
        }

        .spark-one {
          top: 9px;
          right: 27px;
          animation: loader-twinkle 2s infinite;
        }

        .spark-two {
          bottom: 15px;
          left: 12px;
          animation: loader-twinkle 2.5s infinite;
        }

        .spark-three {
          bottom: 20px;
          right: 12px;
          animation: loader-twinkle 1.7s infinite;
        }

        .loader-message {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #c4b5fd;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .5px;
        }

        .loader-dots {
          display: flex;
          gap: 3px;
        }

        .loader-dots i {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #22d3ee;
          animation: loader-dot 1.2s infinite;
        }

        .loader-dots i:nth-child(2) {
          animation-delay: .2s;
        }

        .loader-dots i:nth-child(3) {
          animation-delay: .4s;
        }

        .loader-progress {
          width: 115px;
          height: 2px;
          overflow: hidden;
          border-radius: 10px;
          background: rgba(139,92,246,.15);
        }

        .loader-progress-bar {
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg,#8b5cf6,#22d3ee);
          box-shadow: 0 0 10px #8b5cf6;
          animation: loader-progress 2s ease-in-out infinite;
        }

        .loader-compact {
          padding: 10px;
          gap: 5px;
        }

        .loader-compact .loader-visual {
          transform: scale(.65);
          margin: -22px;
        }

        .loader-compact .loader-progress {
          display: none;
        }

        @keyframes loader-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes loader-pulse {
          0%, 100% { transform: scale(.95); }
          50% { transform: scale(1.06); }
        }

        @keyframes loader-twinkle {
          0%, 100% { opacity: .35; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes loader-dot {
          0%, 80%, 100% { opacity: .25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-4px); }
        }

        @keyframes loader-progress {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(280%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ai-loader *,
          .ai-loader *::before {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
      }
