import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0faf9',
          100: '#ccebe8',
          200: '#99d6d5',
          500: '#3a9e9d',
          700: '#1b6b6a',
          800: '#155554',
          900: '#0c3333',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config