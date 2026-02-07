---
name: Core Setup
description: Installation, MantineProvider, and theme configuration
---

# Mantine Setup & Theming

Mantine requires `MantineProvider` to be at the root of your application. It provides the theme context and global styles.

## Installation

```bash
npm install @mantine/core @mantine/hooks
```

PostCSS setup is required for Mantine 8:
```bash
npm install postcss postcss-preset-mantine postcss-simple-vars
```

## Basic Setup

```tsx
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Open Sans, sans-serif',
  // theme overrides
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <YourApp />
    </MantineProvider>
  );
}
```

## Theme Object

The Mantine theme object stores design tokens:
- `colors`: 10-shade color palettes (0-9).
- `primaryColor`: References a key in `colors`.
- `primaryShade`: Default shade for light (`6`) and dark (`8`) modes.
- `spacing`, `radius`, `fontSizes`, `breakpoints`: Preset sizes (xs, sm, md, lg, xl).
- `components`: Default props, classNames, and styles for any component.

### Customizing Colors

```tsx
const theme = createTheme({
  colors: {
    'ocean-blue': ['#7AD1DD', '#5CC1D0', ...], // 10 shades
  },
});
```

### Component Default Props

```tsx
const theme = createTheme({
  components: {
    Button: Button.extend({
      defaultProps: {
        color: 'cyan',
        variant: 'outline',
      },
    }),
  },
});
```

<!--
Source references:
- https://mantine.dev/theming/mantine-provider/
- https://mantine.dev/theming/theme-object/
- https://mantine.dev/getting-started/
-->
