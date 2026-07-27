// Theme color settings interface
export interface ThemeColors {
  // Main accent color
  accent: string;

  // Dark theme
  darkBackground: string;
  darkSurface: string;
  darkText: string;
  darkTextSecondary: string;

  // Light theme
  lightBackground: string;
  lightSurface: string;
  lightText: string;
  lightTextSecondary: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
}

export interface ThemeSettings extends ThemeColors {
  id?: number;
  updated_at?: string;
}

// Enabled themes settings
export interface EnabledThemes {
  dark: boolean;
  light: boolean;
}

export const DEFAULT_ENABLED_THEMES: EnabledThemes = {
  dark: true,
  light: true,
};

// Default theme colors — warm ivory palette (claude.com-aligned, synced
// 1:1 with bedolaga-cabinet-v1 and the gray-* palette in globals.css).
// Operator can still override via /branding/colors API; these defaults
// ensure the app boots with the correct aesthetic before the API responds.
export const DEFAULT_THEME_COLORS: ThemeColors = {
  accent: '#3b82f6',

  darkBackground: '#141413',
  darkSurface: '#1f1e1d',
  darkText: '#faf9f6',
  darkTextSecondary: '#5e5d5a',

  lightBackground: '#faf9f6',
  lightSurface: '#e7e7df',
  lightText: '#141413',
  lightTextSecondary: '#262624',

  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

// Color shade levels for palette generation
export const SHADE_LEVELS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export type ShadeLevel = (typeof SHADE_LEVELS)[number];

export type ColorPalette = Record<ShadeLevel | 850, string>;
