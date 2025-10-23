/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#102E50', // Navy
          500: '#F5C45E', // Yellow
          400: '#E78B48', // Golden/Orange
          600: '#BE3D2A', // Orange Red
        },
        primary: {
          900: '#102E50',
        },
        accent: {
          500: '#F5C45E',
          400: '#E78B48',
        },
        warn: {
          600: '#BE3D2A',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}