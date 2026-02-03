# Eamon Hyland's Skills

Repo structure & scripts from [antfu/skills](https://github.com/antfu/skills)

A curated collection of [Agent Skills](https://agentskills.io/home) reflecting [Eamon Hyland](https://github.com/ehyland)'s preferences, experience, and best practices, along with usage documentation for the tools.

## Installation

```bash
pnpx skills add ehyland/skills --skill='*'
```

or to install all of them globally:

```bash
pnpx skills add ehyland/skills --skill='*' -g
```

Learn more about the CLI usage at [skills](https://github.com/vercel-labs/skills).

## Skills

This WIP collection targets how I build hobby side projects / personal apps.

### Hand-maintained Skills

> Opinionated

Manually maintained by Eamon Hyland with his preferred tools, setup conventions, and best practices.

| Skill | Description |
|-------|-------------|
| [ehyland](skills/ehyland) | Eamon Hyland's preferences and best practices for app/library projects |

### Skills Generated from Official Documentation

> Unopinionated but with tilted focus (e.g. TypeScript, ESM, Composition API, and other modern stacks)

Generated from official documentation and fine-tuned by Eamon.

| Skill | Description | Source |
|-------|-------------|--------|
| [vitest](skills/vitest) | Vitest - unit testing framework powered by Vite | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) |
| [trpc](skills/trpc) | trpc - atomic CSS engine, presets, transformers | [trpc/trpc](https://github.com/trpc/trpc) |

### Vendored Skills

Synced from external repositories that maintain their own skills.

| Skill | Description | Source |
|-------|-------------|--------|
| [tsdown](skills/tsdown) (Official) | tsdown - TypeScript library bundler powered by Rolldown | [rolldown/tsdown](https://github.com/rolldown/tsdown) |
| [turborepo](skills/turborepo) (Official) | Turborepo - high-performance build system for monorepos | [vercel/turborepo](https://github.com/vercel/turborepo) |
| [web-design-guidelines](skills/web-design-guidelines) | Web design guidelines for building beautiful interfaces | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |

## Generate Your Own Skills

Fork this project to create your own customized skill collection.

1. Fork or clone this repository
2. Install dependencies: `pnpm install`
3. Update `meta.ts` with your own projects and skill sources
4. Run `pnpm start cleanup` to remove existing submodules and skills
5. Run `pnpm start init` to clone the submodules
6. Run `pnpm start sync` to sync vendored skills
7. Ask your agent to `Generate skills for \<project\>` (recommended one at a time to manage token usage)

See [AGENTS.md](AGENTS.md) for detailed generation guidelines.

