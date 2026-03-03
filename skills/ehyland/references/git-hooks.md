---
name: git-hooks
description: Setting up simple-git-hooks and lint-staged for automated pre-commit checks.
---

# Git Hooks Setup

Use `simple-git-hooks` and `lint-staged` to ensure that code is linted and formatted before being committed.

## Installation and Configuration

Add the following configuration to your `package.json`:

```json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm i --frozen-lockfile --ignore-scripts --offline && pnpm lint-staged"
  },
  "lint-staged": { "*": "pnpm fix" },
  "scripts": {
    "prepare": "pnpm simple-git-hooks"
  }
}
```

## How it Works

- The `prepare` script runs after `npm install` and sets up the git hooks.
- On pre-commit, `simple-git-hooks` runs `lint-staged`.
- `lint-staged` runs the `fix` script on all staged files.

## Key Points

- Automates linting and formatting on every commit.
- Prevents broken or poorly formatted code from entering the repository.
- Uses `pnpm fix` as the primary tool for cleaning up code.

<!--
Source references:
- https://github.com/toplenboren/simple-git-hooks
- https://github.com/lint-staged/lint-staged
- https://github.com/ehyland/skills
-->
