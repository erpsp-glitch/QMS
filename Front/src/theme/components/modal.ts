import { palette } from '../palette';
import { shadows } from '../shadows';
import { spacing } from '../spacing';

export const modalTheme = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1300,
  },
  container: {
    backgroundColor: palette.background.paper,
    borderRadius: '0.5rem',
    boxShadow: shadows[4],
    padding: spacing.large,
    maxWidth: '600px',
    margin: 'auto',
  },
  header: {
    fontWeight: 600,
    marginBottom: spacing.medium,
  },
  footer: {
    marginTop: spacing.medium,
    textAlign: 'right' as const,
  },
} as const;

export type ModalTheme = typeof modalTheme;
