/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sabitx: {
          dark: "#000000",
          metal: "#1a1a1a",
          glow: "#0affff",
        },
      },
      backgroundImage: {
        "lion-ghost": "url(/assets/background/lion-ghost.png)",
        "lion-crest": "url(/assets/crest/lion-crest.png)",
      },
      animation: {
        flicker: "sabitx-flicker 1s linear",
        fadeup: "sabitx-fadeup 0.8s ease forwards",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
