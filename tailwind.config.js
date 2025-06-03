/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "savoy-blue": "#6369D1",
        "tiffany-blue": "#60E1E0",
        "lavender": "#D8D2E1",
        "rosy-brown": "#B8E8D",
        "delft-blue": "#34435E",
        primary: "#217a3b",      // Deep Green
        secondary: "#43a047",    // Lighter Green
        accent: "#FFD700",       // Gold
        bg: "#f6fff7",           // Very light green background
        card: "#ffffff",         // White for cards
        border: "#b2dfdb",       // Soft green border
        text: "#1b3c1a",         // Dark green text
        muted: "#a5a5a5",        // Muted gray
      },
    },
  },
  plugins: [],
};

