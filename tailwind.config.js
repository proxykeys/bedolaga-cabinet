/** @type {import('tailwindcss').Config} */

// Helper function to create color with opacity support using CSS variables
const withOpacity = (variableName, fallback) => {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        // Desktop header: включается с hdr (928px). Ниже — физически не влезает:
        // 32 (px-4) + 71 (логотип-иконка) + 32 (gap-4) + 621 (компактная капсула,
        // 6 пунктов RU/Manrope, px-2/gap-1) + 160 (правая зона) = 916 + запас.
        // Паддинги пунктов единые на всей полосе ≥928 — без скачка на 1120.
        // nav (1120) — единственный переход: возвращает подпись appName (max-nav:hidden).
        hdr: '928px',
        nav: '1120px',
      },
      colors: {
        // Modern neutral palette
        dark: {
          50: withOpacity('--color-dark-50'),
          100: withOpacity('--color-dark-100'),
          150: withOpacity('--color-dark-150'),
          200: withOpacity('--color-dark-200'),
          250: withOpacity('--color-dark-250'),
          300: withOpacity('--color-dark-300'),
          350: withOpacity('--color-dark-350'),
          400: withOpacity('--color-dark-400'),
          450: withOpacity('--color-dark-450'),
          500: withOpacity('--color-dark-500'),
          550: withOpacity('--color-dark-550'),
          600: withOpacity('--color-dark-600'),
          650: withOpacity('--color-dark-650'),
          700: withOpacity('--color-dark-700'),
          750: withOpacity('--color-dark-750'),
          800: withOpacity('--color-dark-800'),
          850: withOpacity('--color-dark-850'),
          900: withOpacity('--color-dark-900'),
          950: withOpacity('--color-dark-950'),
        },
        // Champagne light theme palette
        champagne: {
          50: withOpacity('--color-champagne-50'),
          100: withOpacity('--color-champagne-100'),
          200: withOpacity('--color-champagne-200'),
          300: withOpacity('--color-champagne-300'),
          400: withOpacity('--color-champagne-400'),
          500: withOpacity('--color-champagne-500'),
          600: withOpacity('--color-champagne-600'),
          700: withOpacity('--color-champagne-700'),
          800: withOpacity('--color-champagne-800'),
          900: withOpacity('--color-champagne-900'),
          950: withOpacity('--color-champagne-950'),
        },
        // Neutral warm-gray palette — 1:1 match with claude.com surface
        // hierarchy (bg-bg-100/200/300/400). NOT subject to the `.light`
        // palette swap (stable across themes), so safe for backgrounds and
        // borders where the dark/champagne swap would invert the hierarchy.
        // Always pair `bg-gray-NNN` with the matching `dark:bg-gray-NNN`
        // variant so both themes render at the correct step.
        // String keys for values with leading zeros (050, 060, etc.) — those
        // would otherwise be parsed as octal literals in strict mode.
        gray: {
          '050': withOpacity('--color-gray-050'),
          100: withOpacity('--color-gray-100'),
          150: withOpacity('--color-gray-150'),
          200: withOpacity('--color-gray-200'),
          250: withOpacity('--color-gray-250'),
          300: withOpacity('--color-gray-300'),
          350: withOpacity('--color-gray-350'),
          400: withOpacity('--color-gray-400'),
          450: withOpacity('--color-gray-450'),
          500: withOpacity('--color-gray-500'),
          550: withOpacity('--color-gray-550'),
          600: withOpacity('--color-gray-600'),
          650: withOpacity('--color-gray-650'),
          700: withOpacity('--color-gray-700'),
          750: withOpacity('--color-gray-750'),
          800: withOpacity('--color-gray-800'),
          850: withOpacity('--color-gray-850'),
          900: withOpacity('--color-gray-900'),
          950: withOpacity('--color-gray-950'),
          960: withOpacity('--color-gray-960'),
          1000: withOpacity('--color-gray-1000'),
        },
        // Readable text on top of status-colored fills (computed from the
        // operator palette in useThemeColors — black or white, whichever reads)
        'on-accent': withOpacity('--color-on-accent'),
        'on-success': withOpacity('--color-on-success'),
        'on-warning': withOpacity('--color-on-warning'),
        'on-error': withOpacity('--color-on-error'),
        // Accent - dynamic color scheme
        accent: {
          50: withOpacity('--color-accent-50'),
          100: withOpacity('--color-accent-100'),
          200: withOpacity('--color-accent-200'),
          300: withOpacity('--color-accent-300'),
          400: withOpacity('--color-accent-400'),
          500: withOpacity('--color-accent-500'),
          600: withOpacity('--color-accent-600'),
          700: withOpacity('--color-accent-700'),
          800: withOpacity('--color-accent-800'),
          900: withOpacity('--color-accent-900'),
          950: withOpacity('--color-accent-950'),
        },
        // Success - green
        success: {
          50: withOpacity('--color-success-50'),
          100: withOpacity('--color-success-100'),
          200: withOpacity('--color-success-200'),
          300: withOpacity('--color-success-300'),
          400: withOpacity('--color-success-400'),
          500: withOpacity('--color-success-500'),
          600: withOpacity('--color-success-600'),
          700: withOpacity('--color-success-700'),
          800: withOpacity('--color-success-800'),
          900: withOpacity('--color-success-900'),
          950: withOpacity('--color-success-950'),
        },
        // Warning - amber
        warning: {
          50: withOpacity('--color-warning-50'),
          100: withOpacity('--color-warning-100'),
          200: withOpacity('--color-warning-200'),
          300: withOpacity('--color-warning-300'),
          400: withOpacity('--color-warning-400'),
          500: withOpacity('--color-warning-500'),
          600: withOpacity('--color-warning-600'),
          700: withOpacity('--color-warning-700'),
          800: withOpacity('--color-warning-800'),
          900: withOpacity('--color-warning-900'),
          950: withOpacity('--color-warning-950'),
        },
        // Error - red
        error: {
          50: withOpacity('--color-error-50'),
          100: withOpacity('--color-error-100'),
          200: withOpacity('--color-error-200'),
          300: withOpacity('--color-error-300'),
          400: withOpacity('--color-error-400'),
          500: withOpacity('--color-error-500'),
          600: withOpacity('--color-error-600'),
          700: withOpacity('--color-error-700'),
          800: withOpacity('--color-error-800'),
          900: withOpacity('--color-error-900'),
          950: withOpacity('--color-error-950'),
        },
        // Subscription-status semantic tokens — synced to warning/error palette
        // in useThemeColors.ts so they follow operator's custom colors.
        urgent: {
          400: withOpacity('--color-urgent-400'),
          500: withOpacity('--color-urgent-500'),
        },
        critical: {
          400: withOpacity('--color-critical-400'),
          500: withOpacity('--color-critical-500'),
        },
      },
      fontFamily: {
        // 'Twemoji Country Flags' is first in every stack so Windows renders flag
        // emoji (it's unicode-range-scoped to flag codepoints only — see globals.css —
        // so it never affects any other glyph). Global root fix for flags everywhere.
        sans: [
          'Twemoji Country Flags',
          'Manrope',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: ['Twemoji Country Flags', 'Outfit', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['Twemoji Country Flags', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        bento: '24px',
        '4xl': '32px',
        // Linear design tokens
        linear: '8px',
        'linear-lg': '12px',
      },
      spacing: {
        bento: '16px',
        'bento-lg': '24px',
        // Linear design tokens
        'linear-xs': '4px',
        'linear-sm': '8px',
        'linear-md': '16px',
        'linear-lg': '24px',
        'linear-xl': '32px',
      },
      backdropBlur: {
        linear: '12px',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
        card: '0 4px 24px -4px rgba(0, 0, 0, 0.4)',
        // Linear design tokens
        'linear-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        linear: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'linear-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        // Gradient utilities removed per claude.com flat aesthetic
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-fast': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in-bounce': 'scaleInBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        // Decorative animations (aurora, meteor, float, glow-pulse, spotlight,
        // pulse-slow, traffic-shimmer, unlimited-*, trial-glow, move-*,
        // spotlight-ace) removed per claude.com flat aesthetic.
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleInBounce: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Decorative keyframes (float, glowPulse, spotlight, aurora, meteor,
        // moveVertical, moveInCircle, moveHorizontal, spotlightAce,
        // trafficShimmer, unlimitedFlow, unlimitedPulse, trialGlow)
        // removed per claude.com flat aesthetic.
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('light', '.light &');
    },
  ],
};
