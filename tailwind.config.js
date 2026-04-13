/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563EB',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        surface: {
          bg: '#F5F7FB',
          card: '#FFFFFF',
          border: '#E8ECF4',
        },
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      boxShadow: {
        card: '0 2px 16px rgba(37,99,235,0.07)',
        'card-hover': '0 8px 32px rgba(37,99,235,0.13)',
        blue: '0 4px 24px rgba(37,99,235,0.25)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'count-up': 'countUp 0.6s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'toast-in': 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'toast-out': 'toastOut 0.25s ease-in forwards',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        toastIn: { '0%': { opacity: '0', transform: 'translateX(110%)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        toastOut: { '0%': { opacity: '1', transform: 'translateX(0)' }, '100%': { opacity: '0', transform: 'translateX(110%)' } },
      }
    },
  },
  plugins: [],
}
