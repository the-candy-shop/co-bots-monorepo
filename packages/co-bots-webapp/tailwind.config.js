const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["AvenirNext", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        "9xl": "9rem",
      },
      colors: {
        "cobots-green": "#45E545",
        "cobots-green-2": "#7ce445",
        "cobots-green-3": "#6bea6a",
        "cobots-red": "#FF5967",
        "cobots-silver": "#CED5D9",
        "cobots-silver-2": "#919699",
        "cobots-silver-3": "#616466",
        "cobots-silver-4": "#586266",
        "cobots-silver-5": "#A0A2A3",
        "cobots-silver-6": "#6f7072",
        "cobots-silver-7": "#293033",
        "sky-400": "#00BFFF",
        "gold": "#FFDD33",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
