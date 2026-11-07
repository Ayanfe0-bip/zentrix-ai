"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push("/chat");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.session) {
          router.push("/chat");
          router.refresh();
        } else {
          setMessage("Registration successful! Check your email to confirm your account.");
        }
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try agwain."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          ZENTRIX <span>AI</span>
        </Link>

        <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>

        <p className="auth-description">
          {isLogin
            ? "Sign in to access your personal AI memory."
            : "Join ZENTRIX AI and build your personalised experience."}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          {isLogin ? "New to ZENTRIX?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
          >
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </p>

        <Link href="/chat" className="guest-link">
          Continue as Guest →
        </Link>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          background: #080b18;
          color: white;
        }

        .auth-card {
          width: 100%;
          max-width: 430px;
          padding: 38px;
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 22px;
          background: #111629;
          box-shadow: 0 20px 70px rgba(0, 0, 0, 0.3);
        }

        .auth-brand {
          display: block;
          margin-bottom: 35px;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .auth-brand span {
          color: #a78bfa;
        }

        h1 {
          font-size: 29px;
          margin-bottom: 10px;
        }

        .auth-description {
          color: #a3a8bd;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        label {
          display: block;
          margin: 18px 0 8px;
          font-size: 13px;
          color: #d5d8e7;
        }

        input {
          width: 100%;
          padding: 14px;
          border: 1px solid #303951;
          border-radius: 10px;
          background: #080b18;
          color: white;
          outline: none;
        }

        input:focus {
          border-color: #8b5cf6;
        }

        form > button {
          width: 100%;
          margin-top: 25px;
          padding: 15px;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(110deg, #7c3aed, #5b21b6);
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        form > button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .auth-message {
          margin-top: 18px;
          color: #c4b5fd;
          font-size: 13px;
          line-height: 1.6;
        }

        .auth-switch {
          margin-top: 25px;
          text-align: center;
          color: #a3a8bd;
          font-size: 13px;
        }

        .auth-switch button {
          color: #c4b5fd;
          background: none;
          border: 0;
          cursor: pointer;
          font-weight: 700;
        }

        .guest-link {
          display: block;
          margin-top: 25px;
          text-align: center;
          color: #67e8f9;
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 27px 22px;
          }
        }
      `}</style>
    </main>
  );
          }
