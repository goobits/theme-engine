# @goobits/themes

Theme management for SvelteKit applications with Svelte 5 runes support.

## Features

- Light, dark, and system theme modes with zero-flash SSR
- Custom color schemes with extensible configuration
- Reactive theme state using Svelte 5 runes
- Cookie-based preference persistence
- Route-specific theme overrides

## Quick Start

**1. Install**

```bash
npm install @goobits/themes
```

**2. Create config** → `src/lib/config/theme.ts`

```typescript
import { createThemeConfig } from '@goobits/themes/core';

export const themeConfig = createThemeConfig({
    schemes: {
        default: {}, // All fields optional!
        dark: { displayName: 'Dark Mode' },
    },
});
```

**3. Add server hooks** → `src/hooks.server.ts`

```typescript
import { createThemeHooks } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

export const handle = createThemeHooks(themeConfig, {
    blockingScript: true
}).transform;
```

**4. Add layout loader** → `src/routes/+layout.server.ts`

```typescript
export function load({ locals }) {
    return { preferences: locals.themePreferences };
}
```

**5. Update HTML** → `src/app.html`

```html
<html lang="en" class="%sveltekit.theme%"></html>
```

**6. Wrap your app** → `src/routes/+layout.svelte`

```svelte
<script>
    import { ThemeProvider } from '@goobits/themes/svelte';
    import { themeConfig } from '$lib/config/theme';
    import '@goobits/themes/themes/bundle.css';

    const { children } = $props();
</script>

<ThemeProvider config={themeConfig}>
    {@render children?.()}
</ThemeProvider>
```

**Optional: Goo presets + SSR helpers**

```svelte
<script>
    import '@goobits/themes/themes/goo/bundle.css';
</script>
```

```typescript
import { generateBlockingThemeScript } from '@goobits/themes/server/goo';
```

**7. Add controls** (optional)

```svelte
<script>
    import { ThemeToggle, SchemeSelector } from '@goobits/themes/svelte';
</script>

<ThemeToggle />
<SchemeSelector />
```

**That's it!** See [Getting Started](./docs/getting-started.md) for FOUC prevention and custom themes.

## Documentation

| Guide                                        | Description                     |
| -------------------------------------------- | ------------------------------- |
| [Getting Started](./docs/getting-started.md) | Full setup with FOUC prevention |
| [API Reference](./docs/api-reference.md)     | Complete API documentation      |
| [Components](./docs/components.md)           | Built-in components and hooks   |
| [Custom Themes](./docs/custom-themes.md)     | Create your own color schemes   |
| [Troubleshooting](./docs/troubleshooting.md) | Common issues and solutions     |

## CSS Structure

The theme engine applies classes and attributes to `<html>`:

```css
/* Target by attribute (recommended) */
[data-theme='dark'] {
    --bg: #000;
}
[data-theme='light'] {
    --bg: #fff;
}

/* Target by class (for system vs explicit) */
.theme-dark {
    /* explicit dark */
}
.theme-system-dark {
    /* system detected dark */
}

/* Scheme-specific */
.scheme-spells {
    --accent: #7c3aed;
}
```

## License

MIT
