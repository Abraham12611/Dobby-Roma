/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9ffeb',
          100: '#f3ffd7',
          200: '#e8ffb8',
          300: '#d6ff8a',
          400: '#bdff4d',
          500: '#a3ff00',
          600: '#8be600',
          700: '#6fcc00',
          800: '#5fb200',
          900: '#4d9400',
        },
        secondary: {
          50: '#faf0ff',
          100: '#f5e0ff',
          200: '#edc7ff',
          300: '#e0a3ff',
          400: '#d075ff',
          500: '#bd4dff',
          600: '#a833ff',
          700: '#8e1aff',
          800: '#7500e6',
          900: '#5f00cc',
        },
        accent: {
          50: '#f7fff0',
          100: '#efffe1',
          200: '#e4ffc7',
          300: '#d4ff94',
          400: '#bdff4d',
          500: '#a3ff00',
          600: '#8be600',
          700: '#6fcc00',
          800: '#5fb200',
          900: '#4d9400',
        }
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s infinite',
        'float': 'float 8s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(149, 255, 77, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(95, 77, 255, 0.8)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 