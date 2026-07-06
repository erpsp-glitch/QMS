
import { palette } from '../palette';
import { spacing } from '../spacing';
import { typography } from '../typography';

export const tableTheme = {
  header: {
    backgroundColor: palette.grey[200],
    color: palette.text.primary,
    fontWeight: 600,
    fontSize: typography.body2.fontSize,
    padding: spacing.medium,
  },
  row: {
    padding: spacing.medium,
    borderBottom: `1px solid ${palette.grey[300]}`,
    '&:hover': { backgroundColor: palette.grey[100] },
  },
  cell: {
    fontSize: typography.body1.fontSize,
    padding: spacing.medium,
    color: palette.text.secondary,
  },
} as const;

export type TableTheme = typeof tableTheme;
