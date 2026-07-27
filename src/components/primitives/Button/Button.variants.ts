import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  // Base styles — monochrome per claude.com, color-only transitions (no scale on hover)
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ],
  {
    variants: {
      variant: {
        // Monochrome primary: light fill / dark text (auto-inverts in light theme
        // via .light remapping dark-50 → champagne-950, dark-950 → champagne-50).
        primary: ['bg-dark-50 text-dark-950', 'hover:bg-dark-200', 'active:bg-dark-300'],
        secondary: [
          'bg-gray-250 dark:bg-gray-850 text-dark-100',
          'border border-gray-200 dark:border-gray-800',
          'hover:bg-gray-300 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700',
          'active:bg-gray-250 dark:bg-gray-850',
        ],
        ghost: [
          'text-dark-300',
          'hover:text-dark-100 hover:bg-gray-300 dark:hover:bg-gray-800',
          'active:bg-gray-250 dark:bg-gray-850',
        ],
        destructive: [
          'bg-gray-250 dark:bg-gray-850 text-error-500',
          'border border-error-500',
          'hover:bg-gray-300 dark:hover:bg-gray-800 hover:border-error-400',
          'active:bg-gray-350 dark:bg-gray-650',
        ],
        outline: [
          'border border-gray-200 dark:border-gray-800 text-dark-200',
          'hover:bg-gray-300 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:text-dark-100',
          'active:bg-gray-250 dark:bg-gray-850',
        ],
        link: [
          'text-accent-500',
          'hover:text-accent-300 hover:underline',
          'active:text-accent-500',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-linear',
        md: 'h-10 px-4 text-sm rounded-linear',
        lg: 'h-12 px-6 text-base rounded-linear-lg',
        icon: 'h-10 w-10 rounded-linear',
        'icon-sm': 'h-8 w-8 rounded-linear',
        'icon-lg': 'h-12 w-12 rounded-linear-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
