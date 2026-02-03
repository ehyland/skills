---
name: core-router
description: Initializing tRPC and defining routers
---

# Routers

Routers are the foundation of a tRPC API. They group procedures and other routers together.

## Initialization

tRPC should be initialized exactly once per application.

```ts
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
```

## Defining a Router

A router is defined by passing an object of procedures to `t.router()`.

```ts
import { publicProcedure, router } from './trpc';

const appRouter = router({
  greeting: publicProcedure.query(() => 'hello tRPC!'),
});

// Export only the type for the client
export type AppRouter = typeof appRouter;
```

## Nesting Routers

Routers can be nested to organize the API.

```ts
const userRouter = router({
  list: publicProcedure.query(() => [{ id: '1', name: 'Alice' }]),
});

const appRouter = router({
  user: userRouter, // accessible as client.user.list.query()
});
```

## Key Points

- Initialize tRPC only once.
- Always export the `AppRouter` type for client-side type safety.
- Use nesting to keep the root router manageable.

<!--
Source references:
- https://trpc.io/docs/v11/server/routers
-->
