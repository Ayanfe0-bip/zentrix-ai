"use client";

import { useEffect, type ReactNode } from "react";

const STORAGE_KEY = "zentrix-ai-preferences";

export default function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    function applyTheme() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) {
          document.documentElement.dataset.theme = "dark";
          document.documentElement.style.colorScheme = "dark";
          return;
        }

        const preferences = JSON.parse(stored);

        const theme =
          preferences.theme === "light" ? "light" : "dark";

        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.style.colorScheme = "dark";
      }
    }

    applyTheme();

    window.addEventListener("storage", applyTheme);

    window.addEventListener("zentrix-theme-updated", applyTheme);

    return () => {
      window.removeEventListener("storage", applyTheme);
      window.removeEventListener("zentrix-theme-updated", applyTheme);
    };
  }, []);

  return <>{children}</>;
}
