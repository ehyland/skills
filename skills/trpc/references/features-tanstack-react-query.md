---
name: features-tanstack-react-query
description: Integration with TanStack React Query
---

# TanStack React Query Integration

tRPC provides a first-class integration for `@tanstack/react-query`.

## Setup

Create a type-safe context and provider.

```ts
import { createTRPCContext } from '@trpc/tanstack-react-query';
import type { AppRouter } from '../server/router';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();
```

## Usage

Use standard `useQuery` and `useMutation` hooks with tRPC-generated options.

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '../utils/trpc';

function MyComponent() {
  const trpc = useTRPC();
  
  const userQuery = useQuery(trpc.getUser.queryOptions({ id: '1' }));
  const userCreator = useMutation(trpc.createUser.mutationOptions());

  return (
    <div>
      {userQuery.data?.name}
      <button onClick={() => userCreator.mutate({ name: 'Bob' })}>Add</button>
    </div>
  );
}
```

## Singleton Pattern (No Context)

Useful for SPAs (Vite, etc.) where you don't need SSR-aware context.

```ts
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
```

## Key Points

- Use `queryOptions()` and `mutationOptions()` to get typed parameters for TanStack Query.
- `TRPCProvider` manages the tRPC client and query client together.
- This integration is the recommended way to use tRPC with React.

<!--
Source references:
- https://trpc.io/docs/v11/client/tanstack-react-query/setup
-->
