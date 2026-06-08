/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#000086",
          blue: "#007FFE",
          green: "#71B434",
          yellow: "#FCD418",
          orange: "#F2A116",
          gray: "#6B7280",
          page: "#F5F7FA",
          border: "#DDE3EA",
          chip: "#EEF1F4",
          chipActive: "#D7DCE2",
        },
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 30px rgba(0, 59, 115, 0.08)",
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
