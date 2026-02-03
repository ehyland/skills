---
name: features-links
description: Understanding and using tRPC links
---

# Links

Links are a way to customize the data flow between the tRPC client and the server.

## Batching

The `httpBatchLink` is the most common link. It batches multiple concurrent procedure calls into a single HTTP request.

```ts
httpBatchLink({
  url: 'http://localhost:3000/trpc',
  // You can specify how many calls to batch
  maxBatchSize: 10,
})
```

## Terminating Links

Every link chain must end with a "terminating link" that actually sends the request (e.g., `httpLink`, `httpBatchLink`, `wsLink`).

## Composition

Links are executed in order. You can add middleware-like links (e.g., `loggerLink`).

```ts
const client = createTRPCClient<AppRouter>({
  links: [
    loggerLink(),
    httpBatchLink({ url: '...' }),
  ],
});
```

## Key Points

- Use `httpBatchLink` for efficiency.
- Terminating link must be the last in the array.
- `splitLink` can be used to route requests (e.g., queries over HTTP, subscriptions over WS).

<!--
Source references:
- https://trpc.io/docs/v11/client/links/overview
-->
