/** @type {import('tailwindcss').Config} */

// Enterprise healthcare palette — deep clinical blues, sterile neutrals,
// and safety greens. `brand` aliases `medical` so existing classes keep working.
const medical = {
  50: '#f0f6fb',
  100: '#dceaf5',
  200: '#b5d2e9',
  300: '#86b4d9',
  400: '#5292c6',
  500: '#2e74ac',
  600: '#1c5a8d',
  700: '#154569',
  800: '#0f3049',
  900: '#091e2e',
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
          canvas: '#f4f8fb',
          dark: '#091e2e',
        },
        caution: {
          50: '#fffbeb',
          100: '#fef3c7',
          600: '#d97706',
          800: '#92400e',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          600: '#dc2626',
          800: '#991b1b',
        },
      },
      spacing: {
        4.5: '18px',
      },
    },
  },
  plugins: [],
};
