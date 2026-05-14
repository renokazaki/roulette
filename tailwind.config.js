/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        casino: {
          bg:       '#09090b',
          surface:  '#18181c',
          border:   '#2a2a32',
          gold:     '#d4aa3a',
          'gold-l': '#e8c96b',
          felt:     '#1a3a1a',
          red:      '#c0392b',
          green:    '#1a7a1a',
          lime:     '#a3e635',
          amber:    '#fbbf24',
        },
        strategy: {
          flat:       '#a3e635',
          martin:     '#f87171',
          revmartin:  '#fbbf24',
          dalembert:  '#60a5fa',
          aggressive: '#c084fc',
          fibonacci:  '#2dd4bf',
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'Courier New', 'monospace'],
        ui:      ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 20px rgba(212,170,58,0.3)',
        win:  '0 0 30px rgba(163,230,53,0.4)',
        lose: '0 0 20px rgba(248,113,113,0.3)',
      },
      animation: {
        'spin-slow':  'spin 3s linear infinite',
        'pulse-gold': 'pulseGold 1.5s ease-in-out infinite',
        'float-up':   'floatUp 2s ease-out forwards',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(212,170,58,0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(212,170,58,0.8)' },
        },
        floatUp: {
          '0%':   { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-60px)' },
        },
      },
    }
  },
  plugins: [],
}
