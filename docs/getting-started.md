# Getting Started

Complete guide to installing and configuring @goobits/themes in your SvelteKit application.

## Requirements

- **Svelte** 5.0.0 or higher
- **SvelteKit** 2.0.0 or higher
- **Node.js** 18.0.0 or higher

> **Note:** This package uses Svelte 5 runes and is not compatible with Svelte 4.

## Installation

Choose your preferred package manager:

**npm:**

```bash
npm install @goobits/themes
```

**pnpm:**

```bash
pnpm add @goobits/themes
```

**bun:**

```bash
bun add @goobits/themes
```

## Quick Setup

Get themes working in your app in four steps:

### Step 1: Create Theme Configuration

Create a theme config file to define your available schemes:

**TypeScript (`src/lib/config/theme.ts`):**

```typescript
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
                background: '#ffffff',
            },
        },
        spells: {
            name: 'spells',
            displayName: 'Spells',
            description: 'Magical purple theme',
            preview: {
                primary: '#7c3aed',
                accent: '#a78bfa',
                background: '#0a0a0f',
            },
        },
    },
};
```

**JavaScript (`src/lib/config/theme.js`):**

```javascript
export const themeConfig = {
    schemes: {
        default: {
            name: 'default',
            displayName: 'Default',
            description: 'Clean, professional design',
            preview: {
                primary: '#3b82f6',
                accent: '#60a5fa',
                background: '#ffffff',
            },
        },
        spells: {
            name: 'spells',
            displayName: 'Spells',
            description: 'Magical purple theme',
            preview: {
                primary: '#7c3aed',
                accent: '#a78bfa',
                background: '#0a0a0f',
            },
        },
    },
};
```

> **Tip:** Check out the [interactive demo](https://github.com/goobits/goobits-themes/tree/main/demo) to see these features in action with tabs and visual enhancements!

### Step 2: Add Server-Side Rendering Support

Configure server hooks to prevent theme flash on page load.

**File: `src/hooks.server.ts`**

```typescript
import { createThemeHooks } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

const { transform } = createThemeHooks(themeConfig);

export const handle = transform;
```

**File: `src/routes/+layout.server.ts`**

```typescript
import { loadThemePreferences } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

export function load({ cookies }) {
    return {
        preferences: loadThemePreferences(cookies, themeConfig),
    };
}
```

> **Why SSR?** Server-side rendering eliminates the "flash of unstyled content" (FOUC) by setting theme classes before the page renders in the browser.

### Step 3: Update HTML Template

Add the theme class placeholder to your HTML template:

**File: `src/app.html`**

```html
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

> **Important:** The `%sveltekit.theme%` placeholder is replaced by the server with the actual theme classes (e.g., `theme-dark scheme-spells`).

### Step 4: Add Theme Provider

Wrap your app with the ThemeProvider component:

**File: `src/routes/+layout.svelte`**

```svelte
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

Build custom UI with the `useTheme` hook (Svelte 5 runes):

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();

    // Reactive values using $derived
    const currentMode = $derived(theme.theme);
    const currentScheme = $derived(theme.scheme);

    function toggleTheme() {
        const newMode = currentMode === 'dark' ? 'light' : 'dark';
        theme.setTheme(newMode);
    }
</script>

<button onclick={toggleTheme}>
    {currentMode === 'dark' ? '🌙' : '☀️'} Toggle Theme
</button>

<select value={currentScheme} onchange={e => theme.setScheme(e.target.value)}>
    <option value="default">Default</option>
    <option value="spells">Spells</option>
</select>
```

## Verify Your Setup

<details>
<summary><strong>Verification Checklist</strong> (click to expand)</summary>

Confirm everything works correctly:

**Check theme classes:**

```javascript
// In browser console
console.log(document.documentElement.className);
// Should show: theme-system scheme-default (or similar)
```

**Check for theme flash:**

1. Toggle to dark mode
2. Refresh page
3. Page should load directly in dark mode (no white flash)

**Check persistence:**

1. Change theme or scheme
2. Close browser tab
3. Reopen - settings should be preserved

</details>

## Next Steps

- **[Create custom themes](./custom-themes.md)** - Design your own color schemes
- **[Design Tokens](./design-tokens.md)** - Explore available CSS variables
- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Components](./components.md)** - Theme component details
- **[Best Practices](./best-practices.md)** - Accessibility and performance tips

## Troubleshooting

<details>
<summary><strong>Common Issues</strong></summary>

**Theme flashes on page load?**

- Ensure you completed Step 2 (server hooks) and Step 3 (HTML template update)
- Verify the `%sveltekit.theme%` placeholder is in your `app.html`

**TypeScript errors?**

- Verify `@goobits/themes` is in `dependencies`, not `devDependencies`
- Run `pnpm install` to ensure peer dependencies are installed

**Need additional help?**

- See the [Troubleshooting Guide](./troubleshooting.md) for detailed solutions
- Check the [FAQ](./faq.md) for quick answers

</details>

---

[Changelog](../CHANGELOG.md) | [Documentation Home](./README.md)
