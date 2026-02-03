---
name: core-client-vanilla
description: Setting up and using the vanilla tRPC client
---

# Vanilla Client

The `@trpc/client` provides a type-safe way to call your API from any environment.

## Setup

```ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/trpc';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});
```

## Usage

The client uses a Proxy to provide a natural API matching your router structure.

```ts
// Queries
const user = await client.getUser.query('id_1');

// Mutations
const newUser = await client.createUser.mutate({ name: 'Bob' });
```

## Aborting Requests

You can pass an `AbortSignal` to cancel a request.

```ts
const ac = new AbortController();
client.getUser.query('id_1', { signal: ac.signal });
ac.abort();
```

## Key Points

- Requires `AppRouter` type from the server.
- Uses Proxies for a seamless DX.
- Independent of any frontend framework.

<!--
Source references:
- https://trpc.io/docs/v11/client/vanilla/setup
-->
