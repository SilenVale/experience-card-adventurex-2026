/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme tokens - responds to :root / .dark CSS variables
        theme: {
          bg: 'var(--bg-primary)',
          'bg-secondary': 'var(--bg-secondary)',
          'bg-card': 'var(--bg-card)',
          'bg-card-alt': 'var(--bg-card-alt)',
          text: 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-muted': 'var(--text-muted)',
          border: 'var(--border-primary)',
          'border-secondary': 'var(--border-secondary)',
          'border-accent': 'var(--border-accent)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          'accent-light': 'var(--accent-light)',
          'accent-subtle': 'var(--accent-subtle)',
          gold: 'var(--gold)',
          'gold-dark': 'var(--gold-dark)',
          'gold-light': 'var(--gold-light)',
          'gold-subtle': 'var(--gold-subtle)',
        },
        // Legacy palette aliases (kept for backward compat)
        warm: {
          50: '#FAF7F3',
          100: '#F5F0EB',
          200: '#EDE5DD',
          300: '#D9CDC1',
          400: '#B8A296',
          500: '#8C7A74',
          600: '#6B5B55',
          700: '#4A3D38',
          800: '#2D2320',
          900: '#1A1514',
        },
        brand: {
          red: '#E63B30',
          'red-dark': '#C72D24',
          'red-light': 'rgba(230, 59, 48, 0.08)',
        },
        gold: {
          light: 'rgba(184, 149, 91, 0.3)',
          DEFAULT: '#B8955B',
          dark: '#8C6E3C',
        },
        // Legacy dark palette (other pages)
        dark: {
          DEFAULT: '#0C0908',
          lighter: '#110D0C',
        },
        red: {
          accent: '#E63B30',
          dark: '#C42B22',
        },
        ivory: {
          DEFAULT: '#EAE2DD',
          muted: '#A89A95',
        },
      },
      fontFamily: {
        heading: ['"Inter"', '"Noto Sans SC"', 'sans-serif'],
        label: ['"Inter"', '"Noto Sans SC"', 'sans-serif'],
        body: ['"Inter"', '"Noto Sans SC"', 'sans-serif'],
      },
      maxWidth: {
        'site': '1440px',
      },
      letterSpacing: {
        'tighter2': '-0.04em',
      },
    },
  },
  plugins: [],
}