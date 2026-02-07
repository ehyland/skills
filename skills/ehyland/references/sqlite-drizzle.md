---
name: sqlite-drizzle
description: How to set up SQLite with Drizzle ORM in the Bun runtime. Covers schema definition, database connection, migrations, and test configuration.
---

# SQLite with Drizzle (Bun Runtime)

## Dependencies

```bash
bun add drizzle-orm
bun add -D drizzle-kit
```

Bun has a built-in SQLite driver (`bun:sqlite`), so no additional database driver is needed.

## Drizzle-kit config

```ts
// drizzle.config.ts
import type { Config } from "drizzle-kit";

import { config } from "./src/config";

export default {
  schema: "./src/db-schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: { url: config.DATABASE_URL },
} satisfies Config;
```

## Schema Definition

Define tables in `src/db/db-schema.ts`. Export all tables from a single barrel file so Drizzle Kit and the `schema` option in `drizzle()` can consume them.

### Database Connection & Migrations

Migrations are to be run as the server starts, not via `drizzle-kit migrate` cli

```ts
// src/db/index.ts

import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { config } from "./config";
import * as dbSchema from "./db-schema";

export const db = drizzle(config.DATABASE_URL, { schema: dbSchema });

export { dbSchema };

export function runMigration() {
  migrate(db, {
    migrationsFolder: "./migrations",
  });
}
```

```ts
// src/index.ts

import { config } from "./config";
import { runMigration } from "./db";
import { createServer } from "./server";

runMigration();

const server = createServer({ port: config.PORT });

console.log(`listening on http://localhost:${server.port}`);
```

## Drizzle Kit Config

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "sqlite.db",
  },
});
```

## Test Setup

Use an in-memory database for tests to ensure isolation and speed.

```ts
// src/test/setup.ts
process.env.DATABASE_URL = ":memory:";
```

For tests that interact with the running server, create a helper that resets the DB for each test

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
