/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html"],
    theme: {
      extend: {
        colors: {
          'accent': '#A3B18A',
          'accent-dark': '#7A8C69',
          'accent-light': '#DADED4',
          'text': '#2D3332',
          'bg': '#FFF5F5',
          'card': 'rgba(255, 255, 255, 0.7)',
        },
        fontFamily: {
          'inter': ['Inter', 'sans-serif'],
        },
        animation: {
          'float': 'float 6s ease-in-out infinite',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          }
        },
      },
    },
    plugins: [],
  }