/** @type {import('tailwindcss').Config} */

// Careflow palette — bright clinical azure, soft mist canvas, safety greens.
// `brand` aliases `medical` so existing classes keep working.
const medical = {
  50: '#eef5ff',
  100: '#dcecff',
  200: '#c2dcff',
  300: '#93c0ff',
  400: '#5a9dff',
  500: '#4894fe',
  600: '#2f7ae8',
  700: '#1f63c9',
  800: '#1a4f9e',
  900: '#163f7c',
};

const clinical = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  500: '#10b981',
  600: '#0e9f6e',
  700: '#047857',
  800: '#065f46',
};

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        medical,
        clinical,
        brand: medical,
        surface: {
          light: '#ffffff',
          canvas: '#f2f6fc',
          mist: '#e8f0fb',
          dark: '#0b1f38',
        },
        caution: {
          50: '#fffbeb',
          100: '#fef3c7',
          600: '#e8a317',
          800: '#92400e',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          600: '#e5484d',
          800: '#991b1b',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      spacing: {
        4.5: '18px',
      },
    },
  },
  plugins: [],
};
