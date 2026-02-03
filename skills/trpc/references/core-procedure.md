---
name: core-procedure
description: Defining queries, mutations, and subscriptions
---

# Procedures

Procedures are the functions exposed to the client. There are three types: `query`, `mutation`, and `subscription`.

## Queries

Used for fetching data. They should not have side effects.

```ts
const appRouter = router({
  getUser: publicProcedure
    .input(z.string())
    .query(async (opts) => {
      const { input } = opts;
      return await db.user.findUnique({ where: { id: input } });
    }),
});
```

## Mutations

Used for creating, updating, or deleting data (any side effects).

```ts
const appRouter = router({
  createUser: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async (opts) => {
      const { input } = opts;
      return await db.user.create({ data: input });
    }),
});
```

## Subscriptions

Used for real-time data using WebSockets or SSE.

```ts
const appRouter = router({
  onMessage: publicProcedure.subscription(() => {
    return ee.on('message'); // Returns an AsyncIterable
  }),
});
```

## Key Points

- Queries for GET-like operations (idempotent fetching).
- Mutations for POST/PUT/DELETE-like operations (side effects).
- Subscriptions for real-time updates.
- Use `opts.input` to access validated input and `opts.ctx` for context.

<!--
Source references:
- https://trpc.io/docs/v11/server/procedures
-->
