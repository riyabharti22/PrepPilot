/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0A0D1F",
          900: "#10142B",
          850: "#141834",
          800: "#171B36",
          700: "#232848",
        },
        lavender: {
          200: "#E4DFFC",
          300: "#C7BFFB",
          400: "#A599F7",
          500: "#8B7CF6",
          600: "#7361EC",
          700: "#5C4AD1",
        },
        mist: {
          50: "#F8F8FC",
          100: "#F1F0FA",
          200: "#E5E3F3",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(139, 124, 246, 0.35)",
        card: "0 4px 24px rgba(16, 20, 43, 0.06)",
        "card-dark": "0 8px 32px rgba(0, 0, 0, 0.35)",
      },
      backgroundImage: {
        "aurora": "radial-gradient(60% 60% at 20% 20%, rgba(139,124,246,0.25) 0%, rgba(10,13,31,0) 60%), radial-gradient(50% 50% at 85% 15%, rgba(199,191,251,0.18) 0%, rgba(10,13,31,0) 60%)",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.06)", opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        waveform: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        blink: {
          "0%, 90%, 100%": { transform: "scaleY(1)" },
          "95%": { transform: "scaleY(0.1)" },
        },
        mouthTalk: {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        browRaise: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        waveform: "waveform 0.9s ease-in-out infinite",
        blink: "blink 4.5s ease-in-out infinite",
        mouthTalk: "mouthTalk 0.35s ease-in-out infinite",
        fadeUp: "fadeUp 0.5s ease-out",
        browRaise: "browRaise 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};