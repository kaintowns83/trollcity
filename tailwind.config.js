/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        troll: {
          red: '#ff0033',
          'red-600': '#e6002b',
          grey: '#1f2937',
          'grey-600': '#374151'
        }
      },
      boxShadow: {
        'neon-red': '0 0 20px rgba(255,0,51,0.25)'
      }
    }
  },
  plugins: []
}