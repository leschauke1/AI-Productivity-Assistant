/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EEF0E8',
        panel: '#F9FAF5',
        panelRaised: '#FFFFFF',
        ink: {
          DEFAULT: '#1B2B24',
          soft: 'rgba(27, 43, 36, 0.66)',
          faint: 'rgba(27, 43, 36, 0.42)',
        },
        border: {
          DEFAULT: 'rgba(27, 43, 36, 0.15)',
          strong: 'rgba(27, 43, 36, 0.28)',
        },
        gold: {
          DEFAULT: '#B98A2E',
          dark: '#93691E',
          light: '#D4A93C',
        },
        teal: {
          DEFAULT: '#3C6E64',
          light: '#5A9085',
          dark: '#2A4F47',
        },
        clay: {
          DEFAULT: '#9C4B32',
          bg: '#F4E7DF',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        inkwell: '3px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
