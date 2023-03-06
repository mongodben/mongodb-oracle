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
      },
    },
  },
  plugins: [],
};
