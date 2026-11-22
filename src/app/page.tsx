import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Code2,
  MessageSquare,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Video,
  Globe,
  Command,
  ShieldCheck,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/chat");
  }

  return (
    <main className="welcome-page">
      <div className="aurora-background">
        <div className="aurora-blob blob-one" />
        <div className="aurora-blob blob-two" />
        <div className="aurora-blob blob-three" />
      </div>

      <nav className="navbar">
        <Link href="/" className="brand">
          <div className="brand-icon">
            <BrainCircuit size={25} />
          </div>
          <span>
            ZENTRIX<span className="brand-ai"> AI</span>
          </span>
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <Link href="/chat" className="nav-button">
          Get Started
          <ArrowUpRight size={17} />
        </Link>
      </nav>

      <section className="hero" id="start">
        <div className="hero-content">
          <div className="status-badge">
            <span className="status-dot" />
            YOUR INTELLIGENCE, REIMAGINED
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
            <Link href="/chat" className="primary-button">
              Explore ZENTRIX
              <ArrowRight size={19} />
            </Link>

            <a href="#features" className="secondary-button">
              Discover Features
            </a>
          </div>

          <div className="hero-trust">
            <div className="trust-icon">
              <ShieldCheck size={19} />
            </div>
            <span>
              Intelligence. Creativity. Possibility.
            </span>
          </div>

          <div className="hero-stats">
            <div>
              <strong>AI</strong>
              <span>Intelligent assistance</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>∞</strong>
              <span>Ideas without limits</span>
            </div>

            <div className="stat-divider" />

            <div>
              <strong>1</strong>
              <span>Powerful workspace</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="robot-halo" />
          <div className="robot-orbit orbit-one" />
          <div className="robot-orbit orbit-two" />
          <div className="robot-orbit orbit-three" />

          <div className="robot-image-container">
            <Image
              src="/images/zentrix-ai-robot.webp"
              alt="ZENTRIX AI futuristic intelligent robot"
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 90vw, 550px"
              className="robot-image"
            />
          </div>

          <div className="floating-card card-top">
            <Sparkles size={18} />
            <span>Creative Intelligence</span>
          </div>

          <div className="floating-card card-left">
            <Code2 size={18} />
            <span>Code Assistant</span>
          </div>

          <div className="floating-card card-right">
            <MessageSquare size={18} />
            <span>Smart Conversations</span>
          </div>

          <div className="floating-card card-bottom">
            <Zap size={18} />
            <span>Next-Level Thinking</span>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="eyebrow">
            ONE INTELLIGENT PLATFORM
          </span>

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
            icon={<MessageSquare size={24} />}
            title="Smart Conversations"
            description="Engage in natural conversations and explore ideas with an intelligent AI companion."
          />

          <Feature
            icon={<Code2 size={24} />}
            title="Code Assistant"
            description="Write, understand, debug and improve code in a dedicated programming workspace."
          />

          <Feature
            icon={<BrainCircuit size={24} />}
            title="Intelligent Models"
            description="Choose from supported AI models to power different tasks and experiences."
          />

          <Feature
            icon={<Sparkles size={24} />}
            title="Creative Intelligence"
            description="Bring your imagination to life with AI-powered creative experiences."
          />

          <Feature
            icon={<ImageIcon size={24} />}
            title="Image Creation"
            description="Explore visual creativity and bring your ideas to life."
          />

          <Feature
            icon={<Video size={24} />}
            title="AI Video Studio"
            description="Transform creative prompts into exciting video experiences."
          />

          <Feature
            icon={<Globe size={24} />}
            title="Live Web Search"
            description="Explore information and discover useful knowledge from across the web."
          />

          <Feature
            icon={<Zap size={24} />}
            title="AI App Builder"
            description="Turn your ideas into applications with intelligent building assistance."
          />
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-card">
          <div className="about-icon">
            <Command size={31} />
          </div>

          <span className="eyebrow">
            BUILT FOR WHAT&apos;S NEXT
          </span>

          <h2>
            Your ideas deserve
            <br />
            <span className="gradient-text">
              a powerful companion.
            </span>
          </h2>

          <p>
            ZENTRIX AI is developed by Ayanfe Innovation Labs
            Limited to make intelligent technology more
            accessible, useful and inspiring.
          </p>

          <Link href="/chat" className="primary-button">
            Start Exploring
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="footer">
        <Link href="/" className="brand footer-brand">
          <div className="brand-icon small">
            <BrainCircuit size={19} />
          </div>

          <span>
            ZENTRIX<span className="brand-ai"> AI</span>
          </span>
        </Link>

        <p>
          Think Beyond. Build Without Limits.
        </p>

        <span>
          © {new Date().getFullYear()} Ayanfe Innovation Labs Limited.
        </span>
      </footer>

      <style>{`
        .welcome-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          isolation: isolate;
          background: #f3f0e9;
          color: #211a32;
          font-family: "DM Sans", sans-serif;
        }

        .aurora-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: -1;
        }

        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: .35;
        }

        .blob-one {
          width: 450px;
          height: 450px;
          top: -180px;
          right: -100px;
          background: #d9c4ff;
          opacity: .22;
        }

        .blob-two {
          width: 400px;
          height: 400px;
          top: 400px;
          left: -180px;
          background: #e5dccc;
          opacity: .25;
        }

        .blob-three {
          width: 350px;
          height: 350px;
          bottom: 100px;
          right: -100px;
          background: #cbb8df;
          opacity: .12;
        }

        .navbar {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          height: 85px;
          margin: auto;
          padding: 0 35px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(137,87,229,.1);
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
          border-radius: 14px;
          color: white;
          background: linear-gradient(135deg,#8957e5,#b58aff);
          box-shadow: 0 8px 25px rgba(137,87,229,.25);
        }

        .brand-icon.small {
          width: 35px;
          height: 35px;
        }

        .brand-ai {
          color: #8957e5;
        }

        .nav-links {
          display: flex;
          gap: 36px;
          color: #777087;
          font-size: 14px;
          font-weight: 500;
        }

        .nav-links a:hover {
          color: #8957e5;
        }

        .nav-button,
        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: white;
          background: linear-gradient(110deg,#8957e5,#a477f5);
          border: 1px solid rgba(137,87,229,.2);
          border-radius: 13px;
          padding: 13px 20px;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 8px 25px rgba(137,87,229,.2);
          transition: .3s ease;
        }

        .nav-button:hover,
        .primary-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 13px 32px rgba(137,87,229,.3);
        }

        .hero {
          position: relative;
          max-width: 1280px;
          min-height: 690px;
          margin: auto;
          padding: 75px 35px;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          align-items: center;
          gap: 20px;
        }

        .hero-content {
          animation: aurora-fade-up .8s ease both;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 15px;
          border: 1px solid rgba(137,87,229,.17);
          background: rgba(249,246,239,.82);
          color: #8957e5;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8957e5;
          box-shadow: 0 0 12px rgba(137,87,229,.6);
        }

        .hero h1 {
          margin-top: 30px;
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(43px,5.3vw,72px);
          line-height: 1.12;
          letter-spacing: -3px;
          font-weight: 700;
        }

        .gradient-text {
          background: linear-gradient(110deg,#8957e5,#b58aff,#d5a9ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-description {
          max-width: 535px;
          margin-top: 25px;
          color: #777087;
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
          padding: 16px 23px;
          font-size: 14px;
        }

        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 15px 22px;
          border: 1px solid rgba(137,87,229,.2);
          background: rgba(249,246,239,.82);
          border-radius: 13px;
          color: #8957e5;
          font-size: 14px;
          font-weight: 600;
          transition: .3s;
        }

        .secondary-button:hover {
          border-color: #8957e5;
          background: #eee7dc;
        }

        .hero-trust {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-top: 35px;
          color: #777087;
          font-size: 12px;
        }

        .trust-icon {
          color: #8957e5;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 38px;
        }

        .hero-stats div:not(.stat-divider) {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .hero-stats strong {
          color: #8957e5;
          font-size: 21px;
          font-family: "Space Grotesk",sans-serif;
        }

        .hero-stats span {
          color: #89839a;
          font-size: 10px;
        }

        .stat-divider {
          width: 1px;
          height: 35px;
          background: rgba(137,87,229,.2);
        }

        .hero-visual {
          position: relative;
          height: 530px;
          display: grid;
          place-items: center;
          animation: robot-float 7s ease-in-out infinite;
        }

        .robot-halo {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            #e4d9e9 0%,
            #eee8e3 48%,
            transparent 72%
          );
          filter: blur(10px);
        }

        .robot-orbit {
          position: absolute;
          border: 1px solid rgba(137,87,229,.15);
          border-radius: 50%;
          pointer-events: none;
        }

        .orbit-one {
          width: 300px;
          height: 300px;
        }

        .orbit-two {
          width: 400px;
          height: 400px;
          border-style: dashed;
          border-color: rgba(137,87,229,.18);
        }

        .orbit-three {
          width: 490px;
          height: 490px;
          border-color: rgba(181,138,255,.15);
        }

        .robot-image-container {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          max-width: 550px;
        }

        .robot-image {
          object-fit: contain;
          filter: drop-shadow(0 20px 35px rgba(137,87,229,.16));
        }

        .floating-card {
          position: absolute;
          z-index: 4;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 15px;
          border-radius: 14px;
          border: 1px solid rgba(137,87,229,.14);
          background: rgba(249,246,239,.86);
          backdrop-filter: blur(18px);
          color: #514665;
          font-size: 11px;
          font-weight: 600;
          box-shadow: 0 12px 30px rgba(81,57,120,.09);
        }

        .floating-card svg {
          color: #8957e5;
        }

        .card-top {
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
        }

        .card-left {
          left: 0;
          top: 43%;
        }

        .card-right {
          right: 0;
          top: 43%;
        }

        .card-bottom {
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
        }

        .features-section {
          position: relative;
          padding: 100px 35px;
          background: rgba(236,228,216,.62);
          border-top: 1px solid rgba(137,87,229,.1);
          border-bottom: 1px solid rgba(137,87,229,.1);
        }

        .section-heading {
          text-align: center;
        }

        .eyebrow {
          color: #8957e5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .section-heading h2,
        .about-section h2 {
          margin-top: 18px;
          font-family: "Space Grotesk",sans-serif;
          font-size: clamp(32px,4vw,49px);
          line-height: 1.2;
          letter-spacing: -1.5px;
        }

        .section-heading p {
          margin-top: 15px;
          color: #777087;
          font-size: 14px;
        }

        .feature-grid {
          max-width: 1120px;
          margin: 55px auto 0;
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 18px;
        }

        .feature-card {
          padding: 26px 21px;
          border: 1px solid rgba(137,87,229,.12);
          background: rgba(249,246,239,.90);
          border-radius: 19px;
          box-shadow: 0 8px 30px rgba(81,57,120,.035);
          transition: .3s ease;
        }

        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(137,87,229,.4);
          box-shadow: 0 18px 40px rgba(137,87,229,.1);
        }

        .feature-icon {
          width: 49px;
          height: 49px;
          display: grid;
          place-items: center;
          color: #8957e5;
          border-radius: 15px;
          background: #eae1f0;
        }

        .feature-card h3 {
          margin-top: 22px;
          color: #302541;
          font-size: 15px;
          font-weight: 700;
        }

        .feature-card p {
          margin-top: 12px;
          color: #777087;
          font-size: 12px;
          line-height: 1.8;
        }

        .about-section {
          position: relative;
          padding: 110px 25px;
          text-align: center;
        }

        .about-card {
          max-width: 780px;
          margin: auto;
          padding: 55px 25px;
          border: 1px solid rgba(137,87,229,.14);
          border-radius: 30px;
          background: rgba(249,246,239,.86);
          box-shadow: 0 20px 70px rgba(137,87,229,.07);
        }

        .about-icon {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          margin: 0 auto 25px;
          color: white;
          background: linear-gradient(135deg,#8957e5,#b58aff);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(137,87,229,.22);
        }

        .about-section p {
          max-width: 580px;
          margin: 22px auto;
          color: #777087;
          font-size: 14px;
          line-height: 1.9;
        }

        .about-section .primary-button {
          margin-top: 10px;
        }

        .footer {
          position: relative;
          min-height: 100px;
          padding: 25px 35px;
          border-top: 1px solid rgba(137,87,229,.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          background: rgba(243,239,230,.85);
          color: #89839a;
          font-size: 11px;
        }

                .footer-brand {
          color: #211a32;
        }

        @keyframes robot-float {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes aurora-fade-up {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media(max-width:900px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 70px;
          }

          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions,
          .hero-trust,
          .hero-stats {
            justify-content: center;
          }

          .hero-visual {
            height: 480px;
          }

          .feature-grid {
            grid-template-columns: repeat(2,1fr);
          }
        }

        @media(max-width:550px) {
          .navbar {
            height: 72px;
            padding: 0 17px;
          }

          .brand {
            font-size: 17px;
          }

          .brand-icon {
            width: 37px;
            height: 37px;
          }

          .nav-links {
            display: none;
          }

          .nav-button {
            padding: 10px 12px;
            font-size: 11px;
          }

          .hero {
            padding: 60px 18px 35px;
          }

          .hero h1 {
            font-size: 42px;
            letter-spacing: -2px;
          }

          .hero-description {
            font-size: 14px;
          }

          .hero-stats {
            gap: 12px;
          }

          .hero-stats span {
            font-size: 9px;
          }

          .hero-visual {
            height: 360px;
          }

          .robot-halo {
            width: 240px;
            height: 240px;
          }

          .orbit-one {
            width: 210px;
            height: 210px;
          }

          .orbit-two {
            width: 290px;
            height: 290px;
          }

          .orbit-three {
            width: 340px;
            height: 340px;
          }

          .floating-card {
            padding: 9px 10px;
            font-size: 9px;
            gap: 6px;
          }

          .card-left {
            left: -4px;
          }

          .card-right {
            right: -4px;
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
            padding: 75px 17px;
          }

          .about-card {
            padding: 40px 18px;
          }

          .footer {
            justify-content: center;
            text-align: center;
            flex-direction: column;
          }
        }

        @media(prefers-reduced-motion:reduce) {
          .hero-content,
          .hero-visual {
            animation: none;
          }

          .feature-card,
          .primary-button,
          .secondary-button {
            transition: none;
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
