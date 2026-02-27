/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bp: {
          green: "#084D41",
          accent: "#0A9D6E",
          "green-90": "#065C4C",
          dark: "#1A1A1A",
          muted: "#707070",
          border: "#D2D4D4",
          warm: "#F0EEEB",
        },
      },
    },
  },
  plugins: [],
};
