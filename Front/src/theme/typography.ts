export const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  htmlFontSize: 16, // Base for rem units

  // Heading variants
  h1: {
    fontSize: '2.5rem',
    fontWeight: 500,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 500,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },

  // Body variants
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43,
  },

  // Button text
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
  },

  // Caption text
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66,
  },
} as const;

export type Typography = typeof typography;