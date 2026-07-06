const breakpointValues = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

type BreakpointKey = keyof typeof breakpointValues;

export const breakpoints = {
  keys: ['xs', 'sm', 'md', 'lg', 'xl'] as const,
  values: breakpointValues,
  up: (key: BreakpointKey) =>
    `@media (min-width:${breakpointValues[key]}px)`,
  down: (key: BreakpointKey) =>
    `@media (max-width:${breakpointValues[key] - 0.05}px)`,
} as const;

export type Breakpoints = typeof breakpoints;