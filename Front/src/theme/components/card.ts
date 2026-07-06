import { palette } from '../palette';
import { shadows } from '../shadows';
import { spacing } from '../spacing';

export const cardTheme = {
  base: {
    backgroundColor: palette.background.paper,
    borderRadius: '0.5rem',
    boxShadow: shadows[2],
    padding: spacing.large,
  },
  header: {
    fontWeight: 600,
    marginBottom: spacing.medium,
  },
  content: {
    fontSize: '0.95rem',
    color: palette.text.primary,
  },
} as const;

export type CardTheme = typeof cardTheme;
