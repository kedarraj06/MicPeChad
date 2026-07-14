/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#070B14",
          card: "rgba(13, 20, 35, 0.65)",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#F3F4F6",
          muted: "#9CA3AF",
          blue: "#3B82F6",
          purple: "#8B5CF6",
          cyan: "#06B6D4",
          rose: "#F43F5E",
          emerald: "#10B981"
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        "blue-glow": "0 0 25px rgba(59, 130, 246, 0.35)",
        "purple-glow": "0 0 25px rgba(139, 92, 246, 0.35)",
        "cyan-glow": "0 0 25px rgba(6, 182, 212, 0.35)",
      },
      backgroundImage: {
        "cyber-grid": "radial-gradient(circle, rgba(255, 255, 255, 0.04) 1px, transparent 1.5px)",
      }
    },
  },
  plugins: [],
}
