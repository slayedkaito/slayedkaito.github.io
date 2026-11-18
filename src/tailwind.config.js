/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './js/**/*.js',
  ],
  safelist: [
    'nav-scrolled',
    'border-transparent',
    'py-5',
    'text-white',
    'text-white/75',
    'hidden',
    'overflow-hidden',
    'open',
    'is-active',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"General Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        black: '#000000',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-pattern': '40px 40px',
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0%, 0, 0)' },
          '100%': { transform: 'translate3d(calc(-100% / 3), 0, 0)' },
        },
      },
    },
  },
  plugins: [],
};
