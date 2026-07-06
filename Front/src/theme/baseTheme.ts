import { palette } from './palette';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { breakpoints } from './breakpoints';
import { zIndex } from './zIndex';
import { buttonTheme } from './components/buttons';

export const baseTheme = {
  palette,
  typography,
  spacing,
  shadows,
  breakpoints,
  zIndex,
  components: {
    button: buttonTheme,
  },
} as const;

export type Theme = typeof baseTheme;