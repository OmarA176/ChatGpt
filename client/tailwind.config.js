/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emeraldTheme: '#10b981',
        charcoal: '#374151',
        soft: '#f8fafc'
      }
    }
  },
  plugins: []
};
