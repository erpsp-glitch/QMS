import { palette } from '../palette';
import { typography } from '../typography';
import { spacing } from '../spacing';
import { shadows } from '../shadows';

export const buttonTheme = {
  base: {
    fontFamily: typography.fontFamily,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    textTransform: typography.button.textTransform,
    borderRadius: '0.375rem',
    padding: `${spacing.small} ${spacing.medium}`,
    boxShadow: shadows[1],
  },
  variants: {
    primary: {
      backgroundColor: palette.primary.main,
      color: palette.primary.contrastText,
      '&:hover': { backgroundColor: palette.primary.dark },
    },
    secondary: {
      backgroundColor: palette.secondary.main,
      color: palette.secondary.contrastText,
      '&:hover': { backgroundColor: palette.secondary.dark },
    },
    outlined: {
      backgroundColor: 'transparent',
      border: `1px solid ${palette.primary.main}`,
      color: palette.primary.main,
      '&:hover': { backgroundColor: palette.primary.light },
    },
  },
} as const;

export type ButtonTheme = typeof buttonTheme;
