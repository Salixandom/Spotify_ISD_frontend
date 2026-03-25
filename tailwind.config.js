/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spotify-black': '#121212',
        'spotify-dark': '#1a1a1a',
        'spotify-surface': '#242424',
        'spotify-elevated': '#2a2a2a',
        'spotify-green': '#1db954',
        'spotify-green-hover': '#1ed760',
        'spotify-text': '#ffffff',
        'spotify-subtext': '#b3b3b3',
        'spotify-border': '#333333',
      },
      fontFamily: {
        sans: ['Circular', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
