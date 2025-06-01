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
      },
    },
  },
  plugins: [],
}

