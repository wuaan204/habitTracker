/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
      },
      colors: {
        canvas: '#FAFAFA',
        ink: '#2D3748',
      },
    },
  },
  plugins: [],
};
