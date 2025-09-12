module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Delius", "cursive"],
      },
      colors: {
        "zen-black": "#191314",
        "zen-lime": "#ecf95a",
        "zen-light-gray": "#f4f4f4",
        "zen-white": "#ffffff",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".btn": {
          "@apply px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2":
            {},
        },
        ".btn-primary": {
          "@apply bg-zen-black text-zen-white hover:bg-zen-lime hover:text-zen-black shadow-md hover:shadow-lg focus:ring-zen-lime":
            {},
        },
        ".btn-secondary": {
          "@apply bg-zen-light-gray text-zen-black hover:bg-zen-black hover:text-zen-lime shadow-sm hover:shadow-md focus:ring-zen-black":
            {},
        },
        ".btn-accent": {
          "@apply bg-zen-lime text-zen-black hover:bg-zen-black hover:text-zen-lime shadow-md hover:shadow-lg focus:ring-zen-black":
            {},
        },
        ".btn-outline": {
          "@apply border border-zen-light-gray text-zen-black hover:bg-zen-light-gray hover:border-zen-black focus:ring-zen-lime":
            {},
        },
        ".btn-danger": {
          "@apply bg-zen-black text-zen-white hover:bg-red-600 hover:text-white shadow-sm hover:shadow-md focus:ring-red-500":
            {},
        },
        ".btn-disabled": {
          "@apply bg-zen-light-gray text-zen-black cursor-not-allowed opacity-60":
            {},
        },
        ".btn-icon": {
          "@apply p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2":
            {},
        },
      });
    },
  ],
};
