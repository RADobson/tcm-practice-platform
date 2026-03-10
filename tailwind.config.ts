import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#FDF8F3',
          100: '#F5E6D3',
          200: '#E8CBA7',
          300: '#D4A574',
          400: '#C08B52',
          500: '#A67340',
          600: '#8B5E35',
          700: '#6F4A2A',
          800: '#533720',
          900: '#3A2515',
        },
        cyan: {
          50: '#E6FFFE',
          100: '#B3FFFD',
          200: '#80FFFC',
          300: '#4DFFFB',
          400: '#00F0FF',
          500: '#00D4E0',
          600: '#00A8B3',
          700: '#007D86',
          800: '#005259',
          900: '#00262D',
        },
        dark: {
          50: '#2a2a2a',
          100: '#1f1f1f',
          200: '#1a1a1a',
          300: '#151515',
          400: '#121212',
          500: '#0f0f0f',
          600: '#0d0d0d',
          700: '#0a0a0a',
          800: '#080808',
          900: '#050505',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
