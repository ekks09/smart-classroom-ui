import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'void-black': '#050505',
        'neon-cyan': '#00f5d4',
        'electric-blue': '#00bbf9',
        'warning-purple': '#9b5de5',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #00f5d4, 0 0 10px #00f5d4, 0 0 15px #00f5d4' },
          '50%': { boxShadow: '0 0 10px #00f5d4, 0 0 20px #00f5d4, 0 0 30px #00f5d4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        scan: 'scan 2s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config