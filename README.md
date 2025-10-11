# 🎨 @goobits/themes
Theme management system for SvelteKit applications with Svelte 5 runes support.

## ✨ Key Features
- **🌓 Light/Dark/System Modes** - Automatic theme switching based on user preference or system settings
- **🎨 Custom Color Schemes** - Extensible scheme registry for brand-specific color palettes
- **⚡ SSR Support** - Server-side theme detection with zero flash of unstyled content
- **🔄 Real-time Updates** - Reactive theme state with Svelte 5 runes
- **🍪 Persistent Preferences** - Cookie-based theme persistence across sessions
- **🧩 Modular Architecture** - Separate core, Svelte, server, and utility modules

## 🚀 Quick Start
```bash
# npm
npm install @goobits/themes

# bun
bun add @goobits/themes

# pnpm
pnpm add @goobits/themes
```

### Basic Setup
```typescript
// 1. Configure your theme (src/lib/config/theme.ts)
import { createThemeConfig } from '@goobits/themes/core';

export const themeConfig = createThemeConfig({
  defaultMode: 'system',
  defaultScheme: 'default',
  schemes: ['default', 'spells'], // Your custom schemes
  enableSystemDetection: true
});

// 2. Add server hooks (src/hooks.server.ts)
import { createThemeHooks } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

const { transform } = createThemeHooks(themeConfig);

export const handle = transform;

// 3. Load preferences in root layout (src/routes/+layout.server.ts)
import { loadThemePreferences } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

export function load({ cookies }) {
  return {
    preferences: loadThemePreferences(cookies, themeConfig)
  };
}

// 4. Wrap app with ThemeProvider (src/routes/+layout.svelte)
import { ThemeProvider } from '@goobits/themes/svelte';
import { themeConfig } from '$lib/config/theme';

<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>
  {@render children?.()}
</ThemeProvider>
```

### Update Your HTML Template
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

## 📚 Components

### ThemeToggle
```svelte
<!-- Quick theme mode switcher -->
<script>
  import { ThemeToggle } from '@goobits/themes/svelte';
</script>

<ThemeToggle />
```

### SchemeSelector
```svelte
<!-- Dropdown for color scheme selection -->
<script>
  import { SchemeSelector } from '@goobits/themes/svelte';
</script>

<SchemeSelector />
```

### Custom Theme Controls
```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();

  // Reactive values with Svelte 5 runes
  const currentMode = $derived(theme.mode);
  const currentScheme = $derived(theme.scheme);

  function toggleTheme() {
    theme.setMode(currentMode === 'dark' ? 'light' : 'dark');
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

## ⚙️ Configuration

### Custom Color Schemes
```typescript
// core/scheme-registry.ts
import { SchemeRegistry } from '@goobits/themes/core';

const registry = new SchemeRegistry();

registry.register({
  name: 'ocean',
  displayName: 'Ocean',
  description: 'Cool blue tones inspired by the sea',
  icon: '🌊',
  preview: {
    primary: '#0066cc',
    accent: '#00ccff',
    background: '#f0f9ff'
  },
  cssFile: '/themes/ocean.css' // Optional: custom CSS file
});

export const schemeConfig = createThemeConfig({
  defaultMode: 'system',
  defaultScheme: 'ocean',
  schemes: ['default', 'ocean', 'sunset'],
  enableSystemDetection: true
});
```

### Route-Specific Themes
```typescript
// utils/route-themes.ts
import { getRouteTheme } from '@goobits/themes/utils';

// Apply different themes based on route
const routeTheme = getRouteTheme('/admin', {
  '/admin': { mode: 'dark', scheme: 'default' },
  '/public': { mode: 'light', scheme: 'default' }
});
```

## 🛠️ Module Structure

```typescript
// Core - Framework-agnostic theme logic
import { createThemeConfig, SchemeRegistry } from '@goobits/themes/core';
import type { ThemeMode, ThemeScheme, FullTheme } from '@goobits/themes/core';

// Svelte - Components and reactive state
import {
  ThemeProvider,
  ThemeToggle,
  SchemeSelector,
  useTheme
} from '@goobits/themes/svelte';

// Server - SvelteKit server hooks and SSR
import {
  createThemeHooks,
  loadThemePreferences
} from '@goobits/themes/server';

// Utils - Cookie management and helpers
import {
  setThemeCookie,
  getThemeCookie,
  getRouteTheme
} from '@goobits/themes/utils';
```

## 🎯 TypeScript Types

```typescript
type ThemeMode = "light" | "dark" | "system";
type ThemeScheme = "default" | string; // Extensible

interface FullTheme {
  base: ThemeMode;
  scheme: ThemeScheme;
}

interface SchemeConfig {
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  title?: string;
  preview: {
    primary: string;
    accent: string;
    background: string;
  };
  cssFile?: string;
}
```

## 🧪 Development

```bash
# Install dependencies
bun install

# Build package
bun run build

# Run tests
bun run test

# Package for distribution
bun run package
```

## 📝 License
MIT - see [LICENSE](LICENSE) for details

## 💡 Support
- **Issues**: [github.com/goobits/goobits-themes/issues](https://github.com/goobits/goobits-themes/issues)
- **Discussions**: [github.com/goobits/goobits-themes/discussions](https://github.com/goobits/goobits-themes/discussions)
