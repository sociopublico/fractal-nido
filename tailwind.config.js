/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
      },
      colors: {
        cyan: '#00A1DE',
        teal: '#18D4B4',
        gray: '#86898B',
        navy: '#003087',
        coral: '#DE5A3F',
        purple: '#7D00B2',
        gold: '#E3BF2D',
        redmap: '#CA2626',
        greenmap: '#87C066',
      },
      /* Uso: text-navy, bg-blue, bg-teal/20, border-gray, etc. Satoshi es la única fuente. */
    },
  },
  plugins: [],
};
