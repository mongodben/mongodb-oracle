const { palette } = require("@leafygreen-ui/palette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./styles/**/*.ts",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "lg-gray": palette.gray,
        "lg-green": palette.green,
      },
      keyframes: {
        floating: {
          "0%, 100%": { transform: "translateY(-3px)" },
          "50%": { transform: "translateY(3px)" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(5px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
