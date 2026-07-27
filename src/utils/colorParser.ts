const COLORS: Record<string, [number, number, number]> = {
  cyan: [34, 211, 238],
  teal: [32, 201, 151],
  green: [64, 192, 87],
  lime: [130, 201, 30],
  yellow: [250, 176, 5],
  orange: [253, 126, 20],
  red: [250, 82, 82],
  pink: [230, 73, 128],
  grape: [190, 75, 219],
  violet: [151, 117, 250],
  indigo: [92, 124, 250],
  blue: [34, 139, 230],
  gray: [134, 142, 150],
  dark: [55, 58, 64],
};

const DEFAULT_COLOR = COLORS.cyan;

const hexToRgb = (hex: string): [number, number, number] | null => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : null;
};

const getRgb = (color: string): [number, number, number] =>
  COLORS[color] ?? hexToRgb(color) ?? DEFAULT_COLOR;

export interface ColorGradientStyle {
  background: string;
  border: string;
  /** Solid color for the icon inside (rgb() string). */
  color?: string;
  boxShadow?: string;
}

/**
 * Per claude.com aesthetic: icon sits on a neutral surface (added by
 * ThemeIcon via `bg-gray-300/60 dark:bg-gray-700/60` Tailwind class). Here we expose only the
 * glyph color; background/border are empty so inline styles don't fight
 * the Tailwind class. Note: `rgb(var(--color-dark-700) / 0.6)` is invalid
 * inline because the CSS variable holds comma-separated values, so the
 * alpha tint must come from Tailwind, which emits legacy rgba().
 */
export const getColorGradient = (color: string, _light?: boolean): ColorGradientStyle => {
  const [r, g, b] = getRgb(color);
  return {
    background: '',
    border: '',
    color: `rgb(${r},${g},${b})`,
  };
};

/**
 * Per claude.com aesthetic: icon sits on a neutral surface (added by
 * ThemeIcon via `bg-gray-300/60 dark:bg-gray-700/60` Tailwind class). See getColorGradient.
 */
export const getColorGradientSolid = (color: string, _light?: boolean): ColorGradientStyle => {
  const [r, g, b] = getRgb(color);
  return {
    background: '',
    border: '',
    color: `rgb(${r},${g},${b})`,
  };
};
