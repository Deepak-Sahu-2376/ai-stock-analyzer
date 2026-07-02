/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#f8f9fa", // Light neutral backdrop
        surface: "#ffffff", // Pure white surface
        "surface-dim": "#e5e7eb",
        "surface-bright": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f9fafb",
        "surface-container": "#ffffff", // Level 1 Card Container
        "surface-container-high": "#f3f4f6",
        "surface-container-highest": "#e5e7eb",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#4b5563",
        "inverse-surface": "#374151",
        "inverse-on-surface": "#f9fafb",
        outline: "#9ca3af",
        "outline-variant": "#d1d5db",
        border: "#e5e7eb",
        "border-subtle": "#f3f4f6",
        primary: "#005cab", // Signature blue
        "on-primary": "#ffffff",
        "primary-container": "#ebf5ff",
        "on-primary-container": "#005cab",
        secondary: "#006e1c",
        "on-secondary": "#ffffff",
        "secondary-container": "#91f78e",
        tertiary: "#ac2c2b",
        "on-tertiary": "#ffffff",
        error: "#ba1a1a",
        up: "#4CAF50",
        down: "#DF514C",
        "market-up": "#4CAF50",
        "market-down": "#DF514C",
        "brand-orange": "#FF5724", // Custom Brand Orange
        "heatmap-sg": "#129E57",
        "heatmap-lg": "#80C686",
        "heatmap-neu": "#CFD4D8",
        "heatmap-lr": "#F37B7D",
        "heatmap-dr": "#B42326"
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}

