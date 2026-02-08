---
name: bun-trpc-setup
description: Configuration for Bun.serve with native routes and tRPC fetch adapter
---

# Bun with tRPC Setup

When using Bun with tRPC, prefer using `Bun.serve` with the native `routes` property instead of a manual `fetch` handler.

## Setup Routes

The tRPC handler is integrated into the `routes` object using the `@trpc/server/adapters/fetch` adapter.

```ts
// src/server/server.ts
import indexHtml from "../client/index.html";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./routers/_app";
import { config } from "./config";

type ServerOptions = { unix: string } | { port: number };

export function createServer(options: ServerOptions) {
  return Bun.serve({
    ...options,
    routes: {
      // API Routes
      "/api/trpc/*": async (req) => {
        return fetchRequestHandler({
          endpoint: "/api/trpc",
          req,
          router: appRouter,
          createContext: () => ({}),
          onError: ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
          },
        });
      },
      // SPA Fallback
      "/": indexHtml,
      "/*": indexHtml,
    },
  });
}
```

## Setup test server & client

Create a test helper that creates a server listening on a in memory unix socket

```ts
// src/test/install-server.ts
import { createTRPCClient, httpLink } from "@trpc/client";
import { afterAll, beforeAll, beforeEach } from "bun:test";
import { fetch } from "bun";
import { isTable } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { sql } from "drizzle-orm/sql";
import { randomUUID } from "node:crypto";
import { db, dbSchema, runMigration } from "../db";
import { createServer } from "../index";
import type { AppRouter } from "../routers/_app";

export function installServerHooks() {
  const UNIX_SOCKET = "\0example-app-" + randomUUID();

  let server: ReturnType<typeof createServer>;

  beforeAll(async () => {
    runMigration();
    server = createServer({ unix: UNIX_SOCKET });
  });

  beforeEach(async () => {
    await resetDB();
  });

  afterAll(() => {
    void server?.stop();
  });

  const trpc = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: "http://localhost/api/trpc",
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            unix: UNIX_SOCKET,
          });
        },
      }),
    ],
  });

  return { trpc };
}

async function resetDB() {
  db.run(sql.raw("PRAGMA foreign_keys=OFF"));

  for (const table of Object.values(dbSchema)) {
    if (isTable(table)) {
      await db.delete(table);
    }
  }

  db.run(sql.raw("PRAGMA foreign_keys=ON"));
}
```

Usage example

```ts
const { trpc } = installServerHooks();

it("should return an empty list of podcasts initially", async () => {
  const podcasts = await trpc.getPodcasts.query();
  expect(podcasts).toEqual([]);
});
```