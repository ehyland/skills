---
name: Core Styles
description: CSS Modules, Style Props, and Styles API
---

# Styling in Mantine

Mantine 8 uses native CSS with PostCSS. CSS Modules is the recommended styling approach.

## Style Props

Style props are used for quick styling directly on components. They map to CSS properties.

- `m`, `mt`, `mb`, `ml`, `mr`, `mx`, `my`: Margins.
- `p`, `pt`, `pb`, `pl`, `pr`, `px`, `py`: Paddings.
- `bg`, `c`: Background color and text color (supports theme tokens like `blue.6`).
- `fz`, `fw`, `ff`: Font size, weight, family.
- `w`, `h`, `miw`, `maw`: Width and height constraints.

```tsx
<Box m="md" p="xl" bg="blue.1" c="white" fz="lg">
  Style Props Example
</Box>
```

## CSS Modules

Define styles in `.module.css` and reference them via `className`.

```css
/* MyComponent.module.css */
.root {
  background-color: var(--mantine-color-blue-light);
  padding: var(--mantine-spacing-md);
}
```

```tsx
import classes from './MyComponent.module.css';
<Box className={classes.root} />
```

## Styles API

Used to style internal elements of a Mantine component. Each component defines a list of "selectors".

```tsx
import classes from './CustomTextInput.module.css';

// Styles internal 'input' and 'label' elements
<TextInput
  label="Custom Input"
  classNames={{
    input: classes.customInput,
    label: classes.customLabel,
  }}
/>
```

## CSS Variables

Mantine exposes theme tokens as CSS variables:
- Colors: `var(--mantine-color-blue-6)`
- Spacing: `var(--mantine-spacing-md)`
- Radius: `var(--mantine-radius-sm)`
- Breakpoints: `@media (max-width: em(768px))`

## light-dark function

Requires `postcss-preset-mantine`. Useful for theme-dependent colors in CSS.

```css
.root {
  color: light-dark(var(--mantine-color-black), var(--mantine-color-white));
}
```

<!--
Source references:
- https://mantine.dev/styles/styles-overview/
- https://mantine.dev/styles/style-props/
- https://mantine.dev/styles/styles-api/
- https://mantine.dev/styles/css-variables/
-->
