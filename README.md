<h1 align="center">@goobits/themes</h1>

<p align="center"><strong>A SvelteKit theme system with Svelte 5 state and zero-flash server rendering.</strong></p>
<p align="center">Resolve light, dark, system, and named schemes consistently across cookies, local storage, server hooks, blocking startup, and application controls.</p>

<p align="center">
  <a href="#why-themes">Why Themes</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#public-surface">Public surface</a> ·
  <a href="#documentation">Documentation</a>
</p>

---

## Why Themes

The repository directory is `theme-engine`; the published package and canonical
consumer identity are `@goobits/themes`.

The package keeps theme configuration, persistence, server preference parsing,
pre-paint initialization, Svelte state, controls, design tokens, and preset CSS
behind one contract. It supports light, dark, and system modes, named schemes,
fixed-mode schemes, route overrides, namespaced cookies and local storage, Goo
presets, and one-step migration from a legacy scheme key.

## Quick start

In the current workspace dependency graph, use Node.js 22 or newer with Svelte
5/SvelteKit. The manifest still declares Node 18, but the runtime
`@goobits/logger` dependency declares Node 22; reconcile those engines before
claiming Node 18 support. `@goobits/themes` currently depends on the source-only
`@goobits/logger` workspace package, so consume both from pinned
workspace/submodule checkouts until that distribution dependency is reconciled;
a standalone registry install is not verified by this checkout.

Create configuration:

```ts
import { createThemeConfig } from '@goobits/themes/core'

export const themeConfig = createThemeConfig({
  schemes: {
    default: {},
    dark: { displayName: 'Dark Mode', fixedMode: 'dark' },
  },
  defaultMode: 'system',
  defaultScheme: 'default',
  persistence: {
    storageKey: 'my-app-theme',
    themeCookie: 'my-app-theme-mode',
    schemeCookie: 'my-app-theme-scheme',
  },
})
```

Wire server preferences and the blocking script through the SvelteKit hook:

```ts
import { createThemeHooks } from '@goobits/themes/server'
import { themeConfig } from '$lib/config/theme'

export const handle = createThemeHooks(themeConfig, {
  blockingScript: true,
}).transform
```

Keep `<html lang="en" class="%sveltekit.theme%">` in `src/app.html`, return
`{ preferences: locals.themePreferences }` from
`src/routes/+layout.server.ts`, and wrap the application with `ThemeProvider`
from `@goobits/themes/svelte`. It reads `data.preferences`, or callers can pass
the value as `serverPreferences`. Import one theme bundle, such as
`@goobits/themes/themes/bundle.css`.

## Public surface

| Import | Responsibility |
| --- | --- |
| `@goobits/themes` | Convenience barrel re-exporting core, Goo, server, Svelte, and utility surfaces |
| `/core` | Configuration, types, theme resolution, and theme management |
| `/svelte` | `ThemeProvider`, controls, and Svelte integration |
| `/server` | SvelteKit hooks, preference parsing, and blocking script generation |
| `/server/goo` | Goo-specific SSR support |
| `/goo` | Goo preset helpers |
| `/utils` | Focused shared utilities |
| `/themes/*` | Base tokens, presets, Goo bundles, and generated preset assets |

Source-aware workspace conditions point to `src`; published defaults point to
the built `dist` surface. The export map is the exact package inventory.

## CSS contract

`data-theme` carries the resolved `light` or `dark` mode. Explicit and
system-resolved mode classes remain separate, while scheme identity belongs in
`.scheme-*` classes. For a one-time migration, configure
`legacySchemeStorageKey` and optional `schemeAliases`; the blocking script
canonicalizes the stored value before paint and removes the old key after the
new preference is saved.

## Documentation

- [Getting started](docs/getting-started.md)
- [API reference](docs/api-reference.md)
- [Components](docs/components.md)
- [Design tokens](docs/design-tokens.md)
- [Custom themes](docs/custom-themes.md)
- [Best practices](docs/best-practices.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Contributing](CONTRIBUTING.md)

## Development

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm check:goo
```

`pnpm release` changes versions, generated Goo assets, Git state, and the npm
registry. It is an owner-only publication command, not a verification step.

## License

[MIT](LICENSE) © [Goobits](https://github.com/goobits)
