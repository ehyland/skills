---
name: core-context
description: Defining and creating context
---

# Context

Context holds data accessible to all procedures, such as database connections, user sessions, or request headers.

## Defining Context Type

Pass the context type to `initTRPC`.

```ts
import { initTRPC } from '@trpc/server';

export const createContext = async (opts: CreateNextContextOptions) => {
  const session = await getSession(opts.req);
  return { session, prisma };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();
```

## Inner and Outer Context

- **Inner Context**: Data that doesn't depend on the request (e.g., DB connection). Useful for testing/server-side calls.
- **Outer Context**: Data that depends on the request (e.g., auth session, headers).

```ts
export async function createContextInner(opts?: { session: Session | null }) {
  return { prisma, session: opts?.session ?? null };
}

export async function createContext(opts: CreateNextContextOptions) {
  const session = await getSession(opts.req);
  const contextInner = await createContextInner({ session });
  return { ...contextInner, req: opts.req };
}
```

## Key Points

- Context is created for every request.
- Use `opts.ctx` in procedures to access context data.
- Split into inner/outer context for better testability and reusability.

<!--
Source references:
- https://trpc.io/docs/v11/server/context
-->
