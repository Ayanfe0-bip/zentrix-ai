import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ThemeProvider from "@/components/theme-provider";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ZENTRIX AI — Think Beyond. Build Without Limits.",
    template: "%s | ZENTRIX AI",
  },
  description:
    "Meet ZENTRIX AI, your intelligent companion for creativity, productivity, learning and software development.",
  applicationName: "ZENTRIX AI",
  keywords: [
    "ZENTRIX AI",
    "Artificial Intelligence",
    "AI Assistant",
    "AI Coding Assistant",
    "Smart AI Chat",
  ],
  authors: [
    {
      name: "Ayanfe Innovation Labs Limited",
    },
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080B18",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
