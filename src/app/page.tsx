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
          <span>ZENTRIX<span className="brand-ai"> AI</span></span>
        </a>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <a href="#start" className="nav-button">
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
            <a href="#features" className="primary-button">
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
          <span className="gradient-text">a powerful companion.</span>
        </h2>

        <p>
          ZENTRIX AI is being developed by Ayanfe Innovation
          Labs Limited to make intelligent technology more
          accessible, useful and inspiring.
        </p>

        <div className="coming-soon">
          <span className="status-dot" />
          THE ZENTRIX EXPERIENCE IS TAKING SHAPE
        </div>
      </section>

      <footer className="footer">
        <a href="/" className="brand">
          <div className="brand-icon small">
            <BrainCircuit size={19} />
          </div>
          <span>ZENTRIX<span className="brand-ai"> AI</span></span>
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
          background: linear-gradient(135deg, #6d28d9, #164e9b);
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

        .nav-button, .primary-button {
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

        .nav-button:hover, .primary-button:hover {
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

        .status-badge, .coming-soon {
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
          margin-top: 32
