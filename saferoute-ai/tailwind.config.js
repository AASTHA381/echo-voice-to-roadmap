/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0A111E',        // Premium slate-black bg
          panel: '#151F32',     // Slate-blue panel bg
          panelLight: '#1E2C4A',// Lighter slate panel for hover
          border: '#233554',    // Modern border color
          textMain: '#F8FAFC',  // Crisp slate-100 text
          textMuted: '#94A3B8', // Slate-400 muted text
          cyan: '#00F2FE',      // Safety/Scanner cyan
          purple: '#A855F7',    // Deep secondary purple
          warning: '#EAB308',   // Fraud alert yellow
          error: '#EF4444',     // High-risk fraud red
          success: '#10B981',   // Legitimate status green
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'scan-line': 'scan 2s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0%)', opacity: '0.4' },
          '50%': { transform: 'translateY(240px)', opacity: '1' },
          '100%': { transform: 'translateY(0%)', opacity: '0.4' },
        }
      }
    },
  },
  plugins: [],
}
