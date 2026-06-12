/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  safelist: [
    'bg-blue-700',
    'bg-blue-800',
    'text-white',
    'hover:bg-blue-800',

    'bg-white/10',
    'border-white/20',
    'hover:bg-white/20',

    'border-blue-700',
    'text-blue-700',
    'hover:bg-blue-50',

    'bg-red-600',
    'hover:bg-red-700',

    'rounded-lg',
    'shadow-sm',
  ],

  theme: {
    extend: {},
  },
  plugins: [],
}
