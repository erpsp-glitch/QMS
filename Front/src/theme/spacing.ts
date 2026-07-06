const spacingUnit = 8;

export const spacing = {
  /** @param multiplier 1 = 8px */
  get: (multiplier: number) => `${multiplier * spacingUnit}px`,
  unit: spacingUnit,
  
  // Common presets
  small: `${spacingUnit}px`,
  medium: `${spacingUnit * 2}px`,
  large: `${spacingUnit * 3}px`,
  xlarge: `${spacingUnit * 4}px`,
} as const;

export type Spacing = typeof spacing;