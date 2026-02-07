---
name: Mantine Hooks
description: Essential utility hooks from @mantine/hooks
---

# Mantine Hooks

Essential utility hooks for state management and DOM interactions.

## State Management

### `useDisclosure`
Manage boolean state (e.g., modals, drawers).
```tsx
const [opened, { open, close, toggle }] = useDisclosure(false);
```

### `useListState`
Manage array state with helper functions.
```tsx
const [state, handlers] = useListState([{ name: 'Item 1' }]);
// handlers.append, handlers.remove, handlers.reorder, handlers.setItem, etc.
```

## UI & Interactions

### `useViewportSize`
Get current window dimensions.
```tsx
const { height, width } = useViewportSize();
```

### `useMediaQuery`
Listen for media query matches.
```tsx
const largerThanMd = useMediaQuery('(min-width: 62em)');
```

### `useHover`
Track hover state of an element.
```tsx
const { hovered, ref } = useHover();
<div ref={ref}>{hovered ? 'Hovered' : 'Not hovered'}</div>
```

### `useClickOutside`
Handle clicks outside an element.
```tsx
const ref = useClickOutside(() => close());
```

## Form & Input

### `useDebouncedState` & `useDebouncedValue`
```tsx
const [value, setValue] = useDebouncedState('', 200);
const [debounced] = useDebouncedValue(value, 200);
```

## Performance

### `useShallowEffect`
Similar to `useEffect` but uses shallow comparison for dependencies.

<!--
Source references:
- https://mantine.dev/hooks/getting-started/
- https://mantine.dev/hooks/use-disclosure/
- https://mantine.dev/hooks/use-list-state/
- https://mantine.dev/hooks/use-media-query/
-->
