import { palette } from '../palette';
import { typography } from '../typography';
import { spacing } from '../spacing';

export const inputTheme = {
  base: {
    fontFamily: typography.fontFamily,
    fontSize: typography.body1.fontSize,
    padding: `${spacing.small} ${spacing.medium}`,
    borderRadius: '0.375rem',
    border: `1px solid ${palette.grey[400]}`,
    outline: 'none',
    transition: '0.2s ease-in-out',
  },
  states: {
    focus: {
      borderColor: palette.primary.main,
      boxShadow: `0 0 0 2px ${palette.primary.light}`,
    },
    error: {
      borderColor: palette.error.main,
      boxShadow: `0 0 0 2px ${palette.error.light}`,
    },
    disabled: {
      backgroundColor: palette.grey[200],
      color: palette.text.disabled,
      cursor: 'not-allowed',
    },
  },
} as const;

export type InputTheme = typeof inputTheme;
