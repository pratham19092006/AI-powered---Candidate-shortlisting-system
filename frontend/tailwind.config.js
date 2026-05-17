/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        panel: '#111827',
        brand: '#14b8a6',
        accent: '#f59e0b',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(20, 184, 166, 0.18)',
      },
      backgroundImage: {
        hero: 'linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(17,24,39,1) 45%, rgba(8,145,178,0.22) 100%)',
      },
    },
  },
  plugins: [],
};
