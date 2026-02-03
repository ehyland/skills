---
name: features-error-handling
description: Throwing and handling TRPCError
---

# Error Handling

tRPC provides a standardized way to throw and handle errors across the boundary.

## Throwing Errors

Use the `TRPCError` class on the server.

```ts
import { TRPCError } from '@trpc/server';

throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'User does not exist',
  cause: originalError, // Optional
});
```

## Common Error Codes

| Code | HTTP Status |
|------|-------------|
| `BAD_REQUEST` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `INTERNAL_SERVER_ERROR` | 500 |

## Error Formatting

You can customize how errors are sent to the client.

```ts
const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
```

## Key Points

- Use `TRPCError` for all API-level errors.
- Standardized codes map to HTTP statuses.
- `errorFormatter` allows adding custom metadata (like Zod validation details).

<!--
Source references:
- https://trpc.io/docs/v11/server/error-handling
-->
