/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './templates/**/*.html',
    './static/js/**/*.js',
    './*/templates/**/*.html',
    './*/static/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'glass': {
          'dark': 'rgba(5, 32, 59, 0.99)',
          'purple': 'rgba(60, 18, 88, 0.95)',
          'input': 'rgba(83, 40, 83, 0.99)',
          'button': 'rgba(49, 1, 47, 0.93)',
          'hover': 'rgba(7, 218, 218, 0.9)',
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}