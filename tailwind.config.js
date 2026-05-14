/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        casino: {
          bg:         '#09090b',
          'bg-warm':  '#0d0608',
          surface:    '#18181c',
          'surface-2':'#1e1e24',
          border:     '#2a2a32',
          'border-l': '#3a3a46',
          gold:       '#d4aa3a',
          'gold-l':   '#e8c96b',
          'gold-d':   '#a07820',
          felt:       '#0e1c0e',
          'felt-l':   '#162a16',
          red:        '#c0392b',
          green:      '#1a7a1a',
          lime:       '#a3e635',
          amber:      '#fbbf24',
          ruby:       '#9b1a2a',
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
        gold:    '0 0 20px rgba(212,170,58,0.3)',
        'gold-l':'0 0 40px rgba(212,170,58,0.5)',
        win:     '0 0 30px rgba(163,230,53,0.4)',
        lose:    '0 0 20px rgba(248,113,113,0.3)',
        ruby:    '0 0 24px rgba(155,26,42,0.6)',
        inset:   'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'spin-slow':    'spin 3s linear infinite',
        'pulse-gold':   'pulseGold 1.5s ease-in-out infinite',
        'float-up':     'floatUp 2s ease-out forwards',
        'shimmer':      'shimmer 2.5s ease-in-out infinite',
        'pulse-hot':    'pulseHot 1.2s ease-in-out infinite',
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
        shimmer: {
          '0%, 100%': { opacity: '0.7' },
          '50%':      { opacity: '1' },
        },
        pulseHot: {
          '0%, 100%': { boxShadow: '0 0 6px currentColor' },
          '50%':      { boxShadow: '0 0 14px currentColor, 0 0 24px currentColor' },
        },
      },
    }
  },
  plugins: [],
}
