# AGENTS.md

> Guidance for AI coding agents. See [agents.md](https://agents.md) spec.

## Quick Reference

```bash
pnpm install          # Install dependencies (root package)
pnpm test             # Run unit tests (Vitest)
pnpm lint             # Lint source (ESLint)
pnpm build            # Build package (svelte-package)

pnpm --dir demo install  # Install demo app deps
pnpm --dir demo dev      # Start demo dev server (Vite)
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Svelte 5 + SvelteKit (demo app) |
| Language | TypeScript (strict) |
| Build | svelte-package + Vite |
| Testing | Vitest |
| Lint/Format | ESLint + Prettier (prettier-plugin-svelte) |

## Code Style

- **ESLint-only formatting** - @stylistic rules, no Prettier
- **Tabs** for indentation
- **Single quotes** for strings (avoid escape)
- **No semicolons**
- **No trailing commas**
- **Spaces inside** `{ foo }`, `[ foo ]`, and `${ foo }`
- **Arrow parens** only when needed (`x => x`)
- **No space** before function parens (`function()` / `foo()`)
- **Blank line before** line comments (except at block start)
- **Import sorting** via eslint-plugin-simple-import-sort
- **ES Modules** - import/export syntax with `.js` extensions

## Project Conventions

- **No defensive programming** except for external user input
- **No lazy getters** for circular deps
- **Types** colocate by default; centralize only when shared

## Svelte

- **Prefer** `$derived`/`$derived.by` over `$effect`

## Svelte 5 Runes

```svelte
const { data, children } = $props()
{@render children?.()}
```

## Agent Behavior

- **Minimal changes** - only what's requested
- **Read before edit** - open files before modifying
- **Lint before commit** - run `pnpm lint` when changes are made
