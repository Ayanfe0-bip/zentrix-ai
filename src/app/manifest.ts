import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ZENTRIX AI",
    short_name: "ZENTRIX",
    description:
      "Your intelligent companion for creativity, productivity, learning and software development.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#080B18",
    theme_color: "#080B18",
    categories: ["productivity", "education", "utilities"],
    icons: [
      {
        src: "/images/zentrix-ai-logo.jpg",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
