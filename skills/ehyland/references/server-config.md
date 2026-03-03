---
name: server-config
description: Server environment configuration and validation using zod.
---

# Server Environment Configuration

Server configuration should be loaded from environment variables and validated with zod. This ensures that the application has all required configuration at startup and provides clear error messages if variables are missing or invalid.

## Usage

Configuration should be defined in `src/config.ts` or `src/server/config.ts` (for fullstack apps).

```ts
// src/config.ts
import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().default("sqlite.db"),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const config = parsed.data;
```

## Testing Defaults

Default values for development are set in the schema. For testing, you can override these in your test runner's setup script (e.g., `bun test` or `vitest` setup script).

```ts
// src/test/setup.ts
process.env.DATABASE_URL = ":memory:";
```

## Key Points

- Always validate environment variables at startup.
- Use `zod` for type-safe configuration.
- Provide sensible defaults for development.
- Override sensitive or environment-specific values in test setup.

<!--
Source references:
- https://github.com/ehyland/skills
-->
