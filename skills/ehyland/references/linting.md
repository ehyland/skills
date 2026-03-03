---
name: linting
description: Configuration for Oxlint and Oxfmt for fast TypeScript linting and formatting.
---

# Linting and Formatting Setup

Eamon Hyland prefers using [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) from the OXC project for their extreme performance and TypeScript support.

## Configuration

### Oxlint Configuration

Create a `.oxlintrc.json` file in the root of your project:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript"],
  "rules": {
    "typescript/no-floating-promises": "error",
    "typescript/no-unsafe-assignment": "warn"
  }
}
```

### Oxfmt Configuration

Create a `.oxfmtrc.json` file in the root of your project:

```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "trailingComma": "all",
  "printWidth": 80,
  "ignorePatterns": []
}
```

## Usage

Fix linting errors and formatting errors using the `fix` script defined in `package.json`:

```bash
bun run fix
# or
pnpm run fix
```

```json
// package.json

{
  "scripts": {
    "format": "oxfmt src",
    "format:check": "oxfmt src --check",

    "lint": "oxlint --type-aware",
    "lint:fix": "oxlint --type-aware --fix --fix-suggestions --fix-dangerously",

    "fix": "bun run --parallel 'format' 'lint:fix'"
  }
}
```

## Key Points

- Use `oxlint` for fast linting.
- Use `oxfmt` for fast formatting.
- `fix` script should combine both for a seamless developer experience.

<!--
Source references:
- https://oxc.rs
- https://github.com/ehyland/skills
-->
