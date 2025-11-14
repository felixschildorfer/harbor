/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nautical palette
        navy: {
          950: '#0A2540', // Primary Deep Navy
          900: '#0F3550',
          800: '#14475F',
          700: '#1A5A7A',
        },
        ocean: {
          600: '#1E6091', // Secondary Ocean Blue
          500: '#2E7CB3',
          400: '#4A96C7',
          300: '#6BA8D5',
        },
        sand: {
          100: '#F4E1D2', // Accent Sandy Beige
          50: '#FAF5F0',
        },
        rust: {
          500: '#B23A48', // Highlight Rust Red
          600: '#A02E3C',
        },
        slate: {
          50: '#F8F9FA',   // Light Gray (Neutral)
          100: '#F0F2F5',
          200: '#E8ECEF',
          300: '#D9E0E6',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
