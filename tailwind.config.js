/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          red: "#B22026",
          navy: "#123A66",
          navyHover: "#18497d",
          navyDark: "#0b233e",
          lightBlue: "#A9C8EE",
          lightBlueMuted: "rgba(169, 200, 238, 0.15)",
          white: "#FFFFFF",
        },
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'pill': '9999px',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        '200': '200ms',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 0 0 1px rgba(169, 200, 238, 0.12)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(169, 200, 238, 0.15)',
        'redGlow': '0 0 25px -5px rgba(178, 32, 38, 0.4)',
        'blueGlow': '0 0 25px -5px rgba(169, 200, 238, 0.25)',
      },
    },
  },
  plugins: [],
};
