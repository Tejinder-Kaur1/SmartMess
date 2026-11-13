/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif']
      },
      colors: {
        cream: {
          50: '#FFFDF9',
          100: '#FFF8EE',
          200: '#FEF0DB',
        }
      }
    }
  },
  plugins: []
}
