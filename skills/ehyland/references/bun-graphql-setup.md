---
name: bun-graphql-setup
description: Configuration for Bun.serve with Yoga GraphQL
---

# Bun with GraphQL Setup

When using Bun with GraphQL, prefer using `graphql-yoga` and `Bun.serve` with the native `routes` property.

## Server Setup

The Yoga handler is integrated into the `routes` object.

```ts
// src/server.ts
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  landingPage: false,
});

export function createServer(options: { port: number } | { unix: string }) {
  return Bun.serve({
    ...options,
    routes: {
      "/api/graphql": (req) => yoga.fetch(req),
    },
  });
}
```

## Schema Setup

Prefer using `graphql-codegen` with `@eddeee888/gcg-typescript-resolver-files` to manage a structured schema.

```ts
// src/schema.ts
import { createSchema } from "graphql-yoga";
import { typeDefs } from "./schema/typeDefs.generated";
import { resolvers } from "./schema/resolvers.generated";

export const schema = createSchema({
  typeDefs,
  resolvers,
});
```

## Codegen Configuration

```ts
// graphql.config.ts
import { defineConfig } from "@eddeee888/gcg-typescript-resolver-files";
import type { CodegenConfig } from "@graphql-codegen/cli";
import type { IGraphQLConfig } from "graphql-config";

export default {
  schema: "src/schema/**/*.graphql",
  exclude: ["**/*.generated.ts"],
  documents: ["src/tests/operation.graphql"],
  extensions: {
    codegen: {
      overwrite: true,
      generates: {
        "src/schema": defineConfig({
          typesPluginsConfig: {
            contextType: "./context#Context",
          },
        }),
        "src/tests/clien/graphql.generated.ts": {
          plugins: [
            "@graphql-codegen/typescript",
            "@graphql-codegen/typescript-operations",
            "@graphql-codegen/typescript-graphql-request",
          ],
          config: {
            nonOptionalTypename: true,
          },
        },
      },
      hooks: {
        afterAllFileWrite: ["bun run format", "bun run lint:fix"],
      },
    } satisfies CodegenConfig,
  },
} satisfies IGraphQLConfig;
```

## Entry Point

```ts
// src/index.ts
import { config } from "./config";
import { createServer } from "./server";

const server = createServer({ port: config.PORT });

console.log(
  `🚀 Server is running on http://${server.hostname}:${server.port}/api/graphql`,
);
```

## Setup test server & client

Create a test helper that creates a server listening on an in-memory unix socket and provides a typed GraphQL client.

```ts
// src/test/install-server.ts
import { afterAll, beforeAll } from "bun:test";
import { fetch } from "bun";
import { GraphQLClient } from "graphql-request";
import { createServer } from "../server";
import { getSdk } from "../test/client/graphql.generated";

export function installServerHooks() {
  const UNIX_SOCKET = "\0example-app-" + Bun.randomUUIDv7();
  let server: ReturnType<typeof createServer>;

  beforeAll(() => {
    server = createServer({ unix: UNIX_SOCKET });
  });

  afterAll(async () => {
    await server?.stop();
  });

  const testFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, { ...options, unix: UNIX_SOCKET });
  };

  const client = getSdk(
    new GraphQLClient("http://localhost/api/graphql", {
      fetch: testFetch as typeof globalThis.fetch,
    }),
  );

  return { client };
}
```

## Recommended Dependencies

```json
{
  "dependencies": {
    "graphql": "^16.x",
    "graphql-yoga": "^5.x"
  },
  "devDependencies": {
    "@eddeee888/gcg-typescript-resolver-files": "^0.x",
    "@graphql-codegen/cli": "^6.x",
    "@graphql-codegen/typescript": "^5.x",
    "@graphql-codegen/typescript-resolvers": "^5.x"
  }
}
```

<!--
Source references:
- https://github.com/ehyland/podcast-player-offline
-->
