/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Pedagogical tick palette — one color per side-correspondence pair.
        pair: {
          1: '#D7263D',
          2: '#1B998B',
          3: '#F46036',
          4: '#5E60CE',
        },
      },
    },
  },
  plugins: [],
};
