"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "zentrix-ai-preferences";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const current =
      document.documentElement.dataset.theme === "light"
        ? "light"
        : "dark";

    setTheme(current);
  }, []);

  function toggleTheme() {
    const nextTheme =
      theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const preferences = stored ? JSON.parse(stored) : {};

      preferences.theme = nextTheme;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(preferences)
      );
    } catch {
      console.error("Unable to save theme preference.");
    }

    window.dispatchEvent(
      new Event("zentrix-theme-updated")
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="landing-theme-toggle"
      aria-label={
        theme === "dark"
          ? "Switch to light theme"
          : "Switch to dark theme"
      }
      title={
        theme === "dark"
          ? "Switch to light theme"
          : "Switch to dark theme"
      }
    >
      {theme === "dark" ? (
        <Sun size={19} />
      ) : (
        <Moon size={19} />
      )}
    </button>
  );
        }
