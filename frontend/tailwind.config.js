/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mm: {
          black:  "#FFF9E6", // warm buttery-yellow background
          card:   "#FFFDF6", // vanilla-cream card background
          card2:  "#FFF5DB", // custard-cream highlight background
          red:    "#E8284B",
          gold:   "#F5A623",
          cream:  "#2A1E1B", // deep chocolate text color
          muted:  "#7A625C", // warm brown muted text color
          border: "rgba(45,34,30,0.08)", // subtle warm border
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', "cursive"],
        brand:   ['"Dancing Script"', "cursive"],
        body:    ['"Nunito"', "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-14px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%":       { transform: "rotate(3deg)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":       { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        marquee: {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        float:       "float 3.5s ease-in-out infinite",
        float2:      "float 4s ease-in-out 0.8s infinite",
        float3:      "float 3s ease-in-out 1.6s infinite",
        wiggle:      "wiggle 2s ease-in-out infinite",
        "gradient-x":"gradient-x 5s ease infinite",
        shimmer:     "shimmer 2.5s linear infinite",
        marquee:     "marquee 18s linear infinite",
      },
      backgroundSize: {
        "200%": "200%",
      },
      boxShadow: {
        "glow-red":  "0 0 35px rgba(232, 40, 75, 0.25)",
        "glow-gold": "0 0 35px rgba(245, 166, 35, 0.25)",
        "card":      "0 8px 32px rgba(42, 30, 27, 0.06)",
      },
    },
  },
  plugins: [],
};