import { createGlobalStyle } from 'styled-components';
import { baseTheme } from '../theme';

export const GlobalStyles = createGlobalStyle`
  html {
    font-size: ${baseTheme.typography.htmlFontSize}px;
  }

  body {
    margin: 0;
    font-family: ${baseTheme.typography.fontFamily};
    color: ${baseTheme.palette.text.primary};
    background-color: ${baseTheme.palette.background.default};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1 { ${baseTheme.typography.h1} }
  h2 { ${baseTheme.typography.h2} }
  h3 { ${baseTheme.typography.h3} }

  .MuiButton-contained {
    ${baseTheme.components.button.contained.primary}
  }
`;