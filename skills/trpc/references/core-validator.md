---
name: core-validator
description: Input and output validation
---

# Validators

tRPC uses validators to ensure type safety and runtime validation of inputs and outputs.

## Input Validation

Define what the procedure expects from the client.

```ts
import { z } from 'zod';

const hello = publicProcedure
  .input(z.object({ name: z.string() }))
  .query(({ input }) => {
    return `Hello ${input.name}`;
  });
```

## Output Validation

Define what the procedure returns to the client. This is useful for filtering sensitive data or ensuring a specific contract.

```ts
const getUser = publicProcedure
  .output(z.object({ id: z.string(), name: z.string() }))
  .query(() => {
    return { id: '1', name: 'Alice', password: 'secret' }; // password will be stripped/ignored by types but verified at runtime
  });
```

## Supported Libraries

tRPC supports any library conforming to [Standard Schema](https://standardschema.dev), including:
- **Zod** (Recommended)
- **Yup**
- **Superstruct**
- **Typia**

## Functional Validators

You can also use a plain function for validation.

```ts
const hello = publicProcedure
  .input((val: unknown) => {
    if (typeof val !== 'string') throw new Error('Not a string');
    return val;
  })
  .query(({ input }) => `Hello ${input}`);
```

## Key Points

- Input validation is essential for type safety and security.
- Output validation helps maintain internal/external API contracts.
- Zod is the most common choice in the tRPC ecosystem.

<!--
Source references:
- https://trpc.io/docs/v11/server/validators
-->
