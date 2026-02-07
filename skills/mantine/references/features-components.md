---
name: Component Patterns
description: Polymorphic components and common UI layouts
---

# Mantine Component Patterns

## Polymorphic Components

Many Mantine components support the `component` prop to change the rendered root element while keeping Mantine styles.

```tsx
import { Button, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

// Renders as <a> tag
<Button component="a" href="https://mantine.dev">Mantine</Button>

// Renders as react-router-dom Link
<Button component={Link} to="/home">Home</Button>

// Text as <h1>
<Text component="h1" fz="xl" fw={700}>Title</Text>
```

## Layout Components

### AppShell
Structure for application layouts.
```tsx
<AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: 'sm' }} padding="md">
  <AppShell.Header>Header</AppShell.Header>
  <AppShell.Navbar>Navbar</AppShell.Navbar>
  <AppShell.Main>Main content</AppShell.Main>
</AppShell>
```

### Flex, Group, Stack
- `Flex`: Wrapper for `display: flex`.
- `Group`: Horizontal flex container with fixed spacing.
- `Stack`: Vertical flex container.

### Grid & SimpleGrid
- `Grid`: 12-column responsive grid.
- `SimpleGrid`: Equal-width column grid (easier to manage for many items).

## Overlays

### Modal & Drawer
Use `useDisclosure` for state.
```tsx
const [opened, { open, close }] = useDisclosure(false);
<Modal opened={opened} onClose={close} title="Modal Title">Content</Modal>
```

### Popover & Menu
Handle relative positioning automatically.
```tsx
<Menu shadow="md" width={200}>
  <Menu.Target><Button>Toggle menu</Button></Menu.Target>
  <Menu.Dropdown>
    <Menu.Item>Settings</Menu.Item>
    <Menu.Item color="red">Delete account</Menu.Item>
  </Menu.Dropdown>
</Menu>
```

<!--
Source references:
- https://mantine.dev/guides/polymorphic/
- https://mantine.dev/core/app-shell/
- https://mantine.dev/core/group/
- https://mantine.dev/core/stack/
- https://mantine.dev/core/grid/
-->
