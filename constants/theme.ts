export const THEME = {
  colors: {
    primary: {
      DEFAULT: 'oklch(0.6 0.15 250)', // Soft Blue
      foreground: 'oklch(0.98 0 0)',
    },
    secondary: {
      DEFAULT: 'oklch(0.95 0.03 250)', // Very Light Blue
      foreground: 'oklch(0.2 0.05 250)',
    },
    background: 'oklch(0.99 0.01 250)', // Almost white with blue tint
    card: 'oklch(1 0 0)', // White
    success: 'oklch(0.7 0.15 150)', // Soft Green
    warning: 'oklch(0.75 0.15 50)', // Soft Orange/Yellow
    danger: 'oklch(0.6 0.2 25)', // Soft Red
  },
  borderRadius: {
    card: '1.5rem', // 24px - Soft rounded corners
    button: '9999px', // Fully rounded
  }
};

export const LEVELS = {
  MAX_LEVEL: 100,
  XP_PER_LEVEL: 1000,
  calculateLevel: (xp: number) => Math.floor(xp / 1000) + 1,
  calculateProgress: (xp: number) => (xp % 1000) / 1000 * 100,
};
