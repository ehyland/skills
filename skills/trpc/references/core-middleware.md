---
name: core-middleware
description: Procedure middlewares and context extension
---

# Middlewares

Middlewares wrap procedure execution, allowing for authorization, logging, and context extension.

## Usage

Middlewares are added using `t.procedure.use()`.

```ts
export const loggerMiddleware = t.middleware(async (opts) => {
  const start = Date.now();
  const result = await opts.next();
  console.log(`Duration: ${Date.now() - start}ms`);
  return result;
});

export const loggedProcedure = t.procedure.use(loggerMiddleware);
```

## Context Extension

Middlewares can modify the context for subsequent middlewares and the procedure handler.

```ts
export const protectedProcedure = t.procedure.use(async (opts) => {
  if (!opts.ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next({
    ctx: {
      user: opts.ctx.session.user, // Now non-nullable in procedures using this
    },
  });
});
```

## Reusable Middlewares with `.concat()`

Use `.concat()` to compose procedures.

```ts
const procedureWithAuth = publicProcedure.concat(authProcedure);
```

## Key Points

- Middlewares must call `opts.next()` and return its result.
- Use `opts.next({ ctx: { ... } })` to extend or override context.
- Order of `use()` calls matters.

<!--
Source references:
- https://trpc.io/docs/v11/server/middlewares
-->
