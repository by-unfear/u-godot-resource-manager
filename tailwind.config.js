/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        bg: {
          base: "#0d0d0f",
          panel: "#141418",
          hover: "#1c1c23",
          active: "#22222c",
          border: "#2a2a35",
        },
        text: {
          primary: "#e8e6e0",
          secondary: "#8a8898",
          muted: "#4a4a58",
        },
      },
    },
  },
  plugins: [],
};
