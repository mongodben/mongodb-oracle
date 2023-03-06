const { palette } = require("@leafygreen-ui/palette");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "lg-gray": palette.gray,
        "lg-green": palette.green,
      },
    },
  },
  plugins: [],
};
