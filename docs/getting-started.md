# Getting Started

Complete guide to installing and configuring @goobits/themes in your SvelteKit application.

## Requirements

- **Svelte** 5.0.0 or higher
- **SvelteKit** 2.0.0 or higher
- **Node.js** 18.0.0 or higher

This package uses Svelte 5 runes and is not compatible with Svelte 4.

## Installation

```bash
# npm
npm install @goobits/themes

# bun
bun add @goobits/themes

# pnpm
pnpm add @goobits/themes
```

## Quick Setup

Get themes working in your app with three simple steps:

### Step 1: Create Theme Configuration

Create a theme config file to define your available schemes:

```typescript
// src/lib/config/theme.ts
import type { ThemeConfig } from '@goobits/themes/core';

export const themeConfig: ThemeConfig = {
  schemes: {
    default: {
      name: 'default',
      displayName: 'Default',
      description: 'Clean, professional design',
      preview: {
        primary: '#3b82f6',
        accent: '#60a5fa',
        background: '#ffffff'
      }
    },
    spells: {
      name: 'spells',
      displayName: 'Spells',
      description: 'Magical purple theme',
      preview: {
        primary: '#7c3aed',
        accent: '#a78bfa',
        background: '#0a0a0f'
      }
    }
  }
};
```

### Step 2: Add Server-Side Rendering Support

Configure server hooks to prevent theme flash on page load:

```typescript
// src/hooks.server.ts
import { createThemeHooks } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

const { transform } = createThemeHooks(themeConfig);

export const handle = transform;
```

Load theme preferences in your root layout:

```typescript
// src/routes/+layout.server.ts
import { loadThemePreferences } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

export function load({ cookies }) {
  return {
    preferences: loadThemePreferences(cookies, themeConfig)
  };
}
```

### Step 3: Update HTML Template

Add the theme class placeholder to your HTML template:

```html
<!-- src/app.html -->
<html lang="en" class="%sveltekit.theme%">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### Step 4: Add Theme Provider

Wrap your app with the ThemeProvider component:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { ThemeProvider } from '@goobits/themes/svelte';
  import { themeConfig } from '$lib/config/theme';

  // Import preset theme CSS (optional)
  import '@goobits/themes/themes/default.css';
  import '@goobits/themes/themes/spells.css';

  const { data, children } = $props();
</script>

<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>
  {@render children?.()}
</ThemeProvider>
```

## Using Theme Controls

Add theme switching UI with built-in components:

```svelte
<script>
  import { ThemeToggle, SchemeSelector } from '@goobits/themes/svelte';
</script>

<!-- Quick light/dark toggle -->
<ThemeToggle />

<!-- Scheme selector dropdown -->
<SchemeSelector />
```

## Custom Theme Controls

Build custom UI with the `useTheme` hook:

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();

  // Reactive values
  const currentMode = $derived(theme.theme);
  const currentScheme = $derived(theme.scheme);

  function toggleTheme() {
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    theme.setTheme(newMode);
  }

  function changeScheme(scheme: string) {
    theme.setScheme(scheme);
  }
</script>

<button onclick={toggleTheme}>
  {currentMode === 'dark' ? '🌙' : '☀️'} Toggle Theme
</button>

<select value={currentScheme} onchange={(e) => changeScheme(e.target.value)}>
  <option value="default">Default</option>
  <option value="spells">Spells</option>
</select>
```

## Next Steps

- **[Create custom themes](./custom-themes.md)** - Design your own color schemes
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Components](./components.md)** - Theme component details
- **[Best Practices](./best-practices.md)** - Accessibility and performance tips

## Troubleshooting

**Theme flashes on page load?**
Ensure you completed Step 2 (server hooks) and Step 3 (HTML template update).

**TypeScript errors?**
Verify `@goobits/themes` is in `dependencies`, not `devDependencies`.

**More help needed?**
See the [Troubleshooting Guide](./troubleshooting.md) for common issues and solutions.
