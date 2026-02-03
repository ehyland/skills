---
name: best-practices-base-procedures
description: Creating and using reusable base procedures
---

# Base Procedures

Base procedures are a key pattern for code and behavior reuse in tRPC.

## Defining Base Procedures

Start with `t.procedure` and extend it with middlewares or inputs.

```ts
export const publicProcedure = t.procedure;

// Protected procedure asserting user is logged in
export const authedProcedure = publicProcedure.use(async (opts) => {
  if (!opts.ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return opts.next({ ctx: { user: opts.ctx.user } });
});

// Procedure tied to an organization
export const orgProcedure = authedProcedure
  .input(z.object({ orgId: z.string() }))
  .use(async (opts) => {
    // Check if user belongs to orgId
    return opts.next({ ctx: { org: ... } });
  });
```

## Using Base Procedures

Compose your router using these specialized procedures.

```ts
const appRouter = router({
  getSettings: authedProcedure.query(({ ctx }) => {
    return ctx.user.settings;
  }),
  updateOrg: orgProcedure.mutation(({ ctx, input }) => {
    // Both ctx.user and ctx.org are available and typed
    return db.org.update({ where: { id: input.orgId }, data: ... });
  }),
});
```

## Key Points

- Export `publicProcedure` as the default starting point.
- Build layers of security and validation into named procedures.
- Procedures created from base procedures inherit all their middlewares and input requirements.

<!--
Source references:
- https://trpc.io/docs/v11/server/procedures#reusable-base-procedures
-->
