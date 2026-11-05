import type { Config } from "tailwindcss";

const config: Config = {
content: [
"./src/pages//*.{js,ts,jsx,tsx,mdx}",
"./src/components//.{js,ts,jsx,tsx,mdx}",
"./src/app/**/.{js,ts,jsx,tsx,mdx}"
],
theme: {
extend: {
colors: {
zentrix: {
midnight: "#070817",
navy: "#0D1028",
violet: "#8B5CF6",
cyan: "#22D3EE",
purple: "#6D28D9"
}
},
fontFamily: {
sans: ["DM Sans", "sans-serif"],
display: ["Space Grotesk", "sans-serif"]
},
boxShadow: {
glow: "0 0 35px rgba(139, 92, 246, 0.25)",
"cyan-glow": "0 0 35px rgba(34, 211, 238, 0.2)"
}
}
},
plugins: []
};

export default config;
