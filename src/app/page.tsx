import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Code2,
  Command,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <main className="welcome-page">
      <div className="ambient-glow violet" />
      <div className="ambient-glow cyan" />

      <nav className="navbar">
        <a href="/" className="brand">
          <div className="brand-icon">
            <BrainCircuit size={25} />
          </div>
          <span>
            ZENTRIX<span className="brand-ai"> AI</span>
          </span>
        </a>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <a href="/chat" className="nav-button">
          Get Started <ArrowUpRight size={16} />
        </a>
      </nav>

      <section className="hero" id="start">
        <div className="hero-content">
          <div className="status-badge">
            <span className="status-dot" />
            THE NEXT GENERATION OF AI
          </div>

          <h1>
            Think Beyond.
            <br />
            <span className="gradient-text">
              Build Without Limits.
            </span>
          </h1>

          <p className="hero-description">
            Meet a smarter way to think, create, learn and build.
            ZENTRIX AI brings intelligent conversations,
            programming assistance and creativity together
            in one powerful experience.
          </p>

          <div className="hero-actions">
            <a href="/chat" className="primary-button">
              Explore ZENTRIX
              <ArrowRight size={19} />
            </a>

            <a href="#about" className="secondary-button">
              Discover More
            </a>
          </div>

          <div className="hero-trust">
            <div className="trust-icon">
              <Sparkles size={17} />
            </div>
            <span>Intelligence. Creativity. Possibility.</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />

          <div className="neural-core">
            <div className="core-inner">
              <BrainCircuit size={76} strokeWidth={1.2} />
            </div>
          </div>

          <div className="floating-card card-top">
            <Sparkles size={17} />
            <span>Creative Intelligence</span>
          </div>

          <div className="floating-card card-left">
            <Code2 size={17} />
            <span>Code Assistant</span>
          </div>

          <div className="floating-card card-right">
            <MessageSquare size={17} />
            <span>Smart Conversations</span>
          </div>

          <div className="floating-card card-bottom">
            <Zap size={17} />
            <span>Next-Level Thinking</span>
          </div>

          <div className="visual-glow" />
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span>ONE INTELLIGENT PLATFORM</span>

          <h2>
            More than a chatbot.
            <br />
            <span className="gradient-text">
              A world of possibilities.
            </span>
          </h2>

          <p>
            Everything you need to turn ideas into meaningful results.
          </p>
        </div>

        <div className="feature-grid">
          <Feature
            icon={<MessageSquare size={23} />}
            title="Smart Conversations"
            description="Engage in natural conversations and explore ideas with an intelligent AI companion."
          />

          <Feature
            icon={<Code2 size={23} />}
            title="Code Assistant"
            description="Write, understand, debug and improve code in a dedicated programming workspace."
          />

          <Feature
            icon={<BrainCircuit size={23} />}
            title="Intelligent Models"
            description="Choose from supported AI models to power different tasks and experiences."
          />

          <Feature
            icon={<Sparkles size={23} />}
            title="Creative Thinking"
            description="Bring your imagination to life with assistance for writing, learning and innovation."
          />
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-icon">
          <Command size={30} />
        </div>

        <span>BUILT FOR WHAT'S NEXT</span>

        <h2>
          Your ideas deserve
          <br />
          <span className="gradient-text">
            a powerful companion.
          </span>
        </h2>

        <p>
          ZENTRIX AI is being developed by Ayanfe Innovation
          Labs Limited to make intelligent technology more
          accessible, useful and inspiring.
        </p>

        <a href="/chat" className="primary-button about-button">
          Start Exploring
          <ArrowRight size={18} />
        </a>

        <div className="coming-soon">
          <span className="status-dot" />
          EXPLORE THE ZENTRIX EXPERIENCE
        </div>
      </section>

      <footer className="footer">
        <a href="/" className="brand">
          <div className="brand-icon small">
            <BrainCircuit size={19} />
          </div>

          <span>
            ZENTRIX<span className="brand-ai"> AI</span>
          </span>
        </a>

        <p>Think Beyond. Build Without Limits.</p>

        <span>
          © {new Date().getFullYear()} Ayanfe Innovation Labs Limited.
        </span>
      </footer>

      <style>{`
        .welcome-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: #080b18;
        }

        .navbar {
          position: relative;
          z-index: 5;
          max-width: 1250px;
          height: 85px;
          margin: auto;
          padding: 0 35px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          font-family: "Space Grotesk", sans-serif;
          font-size: 21px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .brand-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #c4b5fd;
          background: linear-gradient(135deg,#6d28d9,#164e9b);
          box-shadow: 0 0 25px rgba(139,92,246,.25);
        }

        .brand-icon.small {
          width: 34px;
          height: 34px;
        }

        .brand-ai {
          color: #a78bfa;
        }

        .nav-links {
          display: flex;
          gap: 35px;
          color: #a3a8c0;
          font-size: 14px;
        }

        .nav-links a:hover {
          color: white;
        }

        .nav-button,
        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(110deg,#7c3aed,#5b21b6);
          border: 1px solid rgba(196,181,253,.25);
          border-radius: 12px;
          padding: 12px 19px;
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 8px 30px rgba(109,40,217,.2);
          transition: .3s ease;
        }

        .nav-button:hover,
        .primary-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(139,92,246,.35);
        }

        .hero {
          position: relative;
          z-index: 1;
          max-width: 1250px;
          min-height: 640px;
          margin: auto;
          padding: 90px 35px;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          align-items: center;
          gap: 30px;
        }

        .hero-content {
          animation: fade-up .8s ease both;
        }

        .status-badge,
        .coming-soon {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: 1px solid rgba(167,139,250,.22);
          background: rgba(139,92,246,.08);
          color: #c4b5fd;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22d3ee;
          box-shadow: 0 0 12px #22d3ee;
        }

        .hero h1 {
          margin-top: 30px;
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(43px,5.5vw,72px);
          line-height: 1.12;
          letter-spacing: -3px;
          font-weight: 700;
        }

        .hero-description {
          max-width: 530px;
          margin-top: 25px;
          color: #a0a6bf;
          font-size: 16px;
          line-height: 1.9;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 32px;
        }

        .primary-button {
          padding: 16px 22px;
          font-size: 14px;
        }

        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 15px 22px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px;
          color: #d6d9e8;
          font-size: 14px;
          transition: .3s;
        }

        .secondary-button:hover {
          border-color: #8b5cf6;
          background: rgba(139,92,246,.08);
        }

        .hero-trust {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-top: 42px;
          color: #858ca8;
          font-size: 12px;
        }

        .trust-icon {
          color: #22d3ee;
        }

        .hero-visual {
          position: relative;
          height: 470px;
          display: grid;
          place-items: center;
          animation: float 7s ease-in-out infinite;
        }

        .neural-core {
          position: relative;
          z-index: 2;
          width: 190px;
          height: 190px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: radial-gradient(circle,#272052 0%,#11152c 65%,#080b18 100%);
          border: 1px solid rgba(167,139,250,.5);
          box-shadow: 0 0 70px rgba(139,92,246,.35),
                      inset 0 0 35px rgba(34,211,238,.08);
        }

        .core-inner {
          color: #c4b5fd;
          filter: drop-shadow(0 0 18px #8b5cf6);
        }

        .orbit {
          position: absolute;
          border: 1px solid rgba(139,92,246,.2);
          border-radius: 50%;
          pointer-events: none;
        }

        .orbit-one {
          width: 280px;
          height: 280px;
        }

        .orbit-two {
          width: 380px;
          height: 380px;
          border-color: rgba(34,211,238,.15);
        }

        .orbit-three {
          width: 455px;
          height: 455px;
          border-style: dashed;
          border-color: rgba(167,139,250,.12);
        }

        .floating-card {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 15px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(17,23,45,.85);
          backdrop-filter: blur(15px);
          color: #d8d5f7;
          font-size: 11px;
          box-shadow: 0 10px 35px rgba(0,0,0,.25);
        }

        .floating-card svg {
          color: #a78bfa;
        }

        .card-top {
          top: 22px;
          left: 50%;
          transform: translateX(-50%);
        }

        .card-left {
          left: -2px;
          top: 43%;
        }

        .card-right {
          right: -2px;
          top: 43%;
        }

        .card-bottom {
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
        }

        .visual-glow {
          position: absolute;
          width: 280px;
          height: 280px;
          background: #6d28d9;
          filter: blur(130px);
          opacity: .22;
        }

        .features-section {
          position: relative;
          z-index: 1;
          padding: 100px 35px;
          border-top: 1px solid rgba(255,255,255,.06);
          background: rgba(15,19,38,.55);
        }

        .section-heading {
          text-align: center;
        }

        .section-heading > span,
        .about-section > span {
          color: #22d3ee;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .section-heading h2,
        .about-section h2 {
          margin-top: 18px;
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(32px,4vw,48px);
          line-height: 1.2;
          letter-spacing: -1.5px;
        }

        .section-heading p {
          margin-top: 15px;
          color: #9298b3;
          font-size: 14px;
        }

        .feature-grid {
          max-width: 1100px;
          margin: 55px auto 0;
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 18px;
        }

        .feature-card {
          padding: 26px 21px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(17,23,45,.65);
          border-radius: 18px;
          transition: .3s;
        }

        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(139,92,246,.45);
          box-shadow: 0 15px 40px rgba(0,0,0,.2);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          color: #c4b5fd;
          border-radius: 14px;
          background: rgba(139,92,246,.15);
        }

        .feature-card h3 {
          margin-top: 22px;
          font-size: 16px;
        }

        .feature-card p {
          margin-top: 12px;
          color: #9298b3;
          font-size: 12px;
          line-height: 1.8;
        }

        .about-section {
          position: relative;
          z-index: 1;
          padding: 110px 25px;
          text-align: center;
        }

        .about-icon {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          margin: 0 auto 25px;
          color: #c4b5fd;
          background: rgba(139,92,246,.13);
          border: 1px solid rgba(139,92,246,.25);
          border-radius: 20px;
        }

        .about-section p {
          max-width: 580px;
          margin: 22px auto;
          color: #9298b3;
          font-size: 14px;
          line-height: 1.9;
        }

        .about-button {
          margin-top: 10px;
        }

        .coming-soon {
          margin-top: 25px;
        }

        .footer {
          position: relative;
          z-index: 1;
          min-height: 100px;
          padding: 25px 35px;
          border-top: 1px solid rgba(255,255,255,.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          color: #858ca8;
          font-size: 11px;
        }

        @media (max-width: 850px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 75px;
          }

          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions,
          .hero-trust {
            justify-content: center;
          }

          .hero-visual {
            height: 430px;
          }

          .feature-grid {
            grid-template-columns: repeat(2,1fr);
          }
        }

        @media (max-width: 550px) {
          .navbar {
            height: 72px;
            padding: 0 17px;
          }

          .brand {
            font-size: 17px;
          }

          .brand-icon {
            width: 36px;
            height: 36px;
          }

          .nav-links {
            display: none;
          }

          .nav-button {
            padding: 10px 12px;
            font-size: 11px;
          }

          .hero {
            padding: 65px 20px 45px;
          }

          .hero h1 {
            font-size: 43px;
            letter-spacing: -2px;
          }

          .hero-description {
            font-size: 14px;
          }

          .hero-visual {
            height: 340px;
          }

          .neural-core {
            width: 145px;
            height: 145px;
          }

          .core-inner svg {
            width: 60px;
          }

          .orbit-one {
            width: 220px;
            height: 220px;
          }

          .orbit-two {
            width: 290px;
            height: 290px;
          }

          .orbit-three {
            width: 330px;
            height: 330px;
          }

          .floating-card {
            padding: 10px;
            font-size: 9px;
            gap: 6px;
          }

          .card-left {
            left: -5px;
          }

          .card-right {
            right: -5px;
          }

          .features-section {
            padding: 75px 17px;
          }

          .feature-grid {
            grid-template-columns: 1fr;
            gap: 13px;
          }

          .feature-card {
            padding: 22px;
          }

          .about-section {
            padding: 80px 20px;
          }

          .footer {
            justify-content: center;
            text-align: center;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
      }
