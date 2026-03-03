---
name: scripts
description: Eamon Hyland's preferred set of package.json scripts for development, database management, and CI.
---

# Package.json Scripts

These are the preferred set of `package.json` scripts for Eamon Hyland's TypeScript projects. Note that not all scripts are relevant to every project (e.g., library packages will not have database scripts).

## Preferred Scripts

```jsonc
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",

    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio",

    "typecheck": "tsc --noEmit",

    "format": "oxfmt src",
    "format:check": "oxfmt src --check",

    "lint": "oxlint --type-aware",
    "lint:fix": "oxlint --type-aware --fix --fix-suggestions --fix-dangerously",

    "fix": "bun run --parallel 'format' 'lint:fix'",

    "check": "concurrently 'bun:format' 'bun:lint:fix' 'bun:typecheck' 'bun:test' 'bun:test:e2e'",

    "test": "bun test",
    "test:e2e": "playwright test",
  },
}
```

## Key Points

- `dev`: Rapid development with `bun` watch mode.
- `db:*`: Drizzle ORM management.
- `lint` / `format`: Fast linting and formatting using OXC tools.
- `fix`: Combined command to automatically fix formatting and linting issues.
- `check`: Comprehensive CI check running all validations in parallel.

<!--
Source references:
- https://github.com/ehyland/skills
-->
