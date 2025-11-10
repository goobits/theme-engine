# 🎨 @goobits/themes

Theme management for SvelteKit applications with Svelte 5 runes support.

## Features

- Light, dark, and system theme modes
- Custom color schemes with extensible configuration
- Server-side rendering with zero-flash theme detection
- Reactive theme state using Svelte 5 runes
- Cookie-based preference persistence
- Modular architecture (core/svelte/server/utils)

## Requirements

- Svelte 5.0.0 or higher
- SvelteKit 2.0.0 or higher
- Node.js 18.0.0 or higher

This package uses Svelte 5 runes and is not compatible with Svelte 4.

## Installation

```bash
npm install @goobits/themes
```

## Quick Start

### 1. Create Theme Configuration

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
    }
  }
};
```

### 2. Configure Server Hooks

```typescript
// src/hooks.server.ts
import { createThemeHooks } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

const { transform } = createThemeHooks(themeConfig);
export const handle = transform;
```

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

### 3. Update HTML Template

```html
<!-- src/app.html -->
<html lang="en" class="%sveltekit.theme%">
  <!-- ... -->
</html>
```

### 4. Add Theme Provider

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { ThemeProvider } from '@goobits/themes/svelte';
  import { themeConfig } from '$lib/config/theme';
  import '@goobits/themes/themes/default.css';

  const { data, children } = $props();
</script>

<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>
  {@render children?.()}
</ThemeProvider>
```

## Using Theme Controls

### Built-in Components

```svelte
<script>
  import { ThemeToggle, SchemeSelector } from '@goobits/themes/svelte';
</script>

<ThemeToggle />
<SchemeSelector />
```

### Custom Controls

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
  const currentMode = $derived(theme.theme);

  function toggleTheme() {
    theme.setTheme(currentMode === 'dark' ? 'light' : 'dark');
  }
</script>

<button onclick={toggleTheme}>
  {currentMode === 'dark' ? '🌙' : '☀️'}
</button>
```

## Documentation

- **[Getting Started](./docs/getting-started.md)** - Complete installation and setup guide
- **[API Reference](./docs/api-reference.md)** - Full API documentation with type definitions
- **[Components](./docs/components.md)** - Theme component usage and customization
- **[Custom Themes](./docs/custom-themes.md)** - Create your own color schemes
- **[Design Tokens](./docs/design-tokens.md)** - CSS variable reference
- **[Best Practices](./docs/best-practices.md)** - Accessibility and performance guidelines
- **[Troubleshooting](./docs/troubleshooting.md)** - Common issues and solutions

## Preset Themes

Two color schemes are included:

- **default** - Clean, professional design
- **spells** - Magical purple theme with glow effects

Import in your layout:

```typescript
import '@goobits/themes/themes/default.css';
import '@goobits/themes/themes/spells.css';
```

See [Custom Themes Guide](./docs/custom-themes.md) for creating your own.

## Module Structure

```typescript
// Core - Framework-agnostic theme logic
import type { ThemeConfig, ThemeMode, SchemeConfig } from '@goobits/themes/core';

// Svelte - Components and reactive stores
import { ThemeProvider, ThemeToggle, useTheme } from '@goobits/themes/svelte';

// Server - SvelteKit SSR utilities
import { createThemeHooks, loadThemePreferences } from '@goobits/themes/server';

// Utils - Cookie and routing helpers
import { readPreferenceCookies, writePreferenceCookies, getRouteTheme } from '@goobits/themes/utils';
```

See [API Reference](./docs/api-reference.md) for complete module documentation.

## Configuration Examples

### Custom Color Schemes

```typescript
// src/lib/config/theme.ts
export const themeConfig: ThemeConfig = {
  schemes: {
    default: {
      name: 'default',
      displayName: 'Default',
      description: 'Clean design',
      preview: {
        primary: '#3b82f6',
        accent: '#60a5fa',
        background: '#ffffff'
      }
    },
    ocean: {
      name: 'ocean',
      displayName: 'Ocean',
      description: 'Cool blue tones',
      icon: '🌊',
      preview: {
        primary: '#0066cc',
        accent: '#00ccff',
        background: '#f0f9ff'
      }
    }
  }
};
```

Then create `src/styles/themes/ocean.css`:

```css
html.scheme-ocean {
  --accent-primary: #0066cc;
  --accent-glow: #00ccff;
  --bg-card: #f0f9ff;
}

html.theme-dark.scheme-ocean {
  --bg-primary: #001a33;
  --text-primary: #e0f2ff;
}
```

See [Custom Themes Guide](./docs/custom-themes.md) for complete instructions.

### Route-Specific Themes

```typescript
// src/lib/config/theme.ts
export const themeConfig: ThemeConfig = {
  schemes: { /* ... */ },
  routeThemes: {
    '/admin': {
      theme: { base: 'dark', scheme: 'default' },
      override: true,
      description: 'Admin area uses dark theme'
    }
  }
};
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  ThemeMode,      // "light" | "dark" | "system"
  ThemeScheme,    // "default" | "spells" | string
  FullTheme,      // { base: ThemeMode, scheme: ThemeScheme }
  ThemeConfig,    // Configuration interface
  SchemeConfig    // Scheme definition interface
} from '@goobits/themes/core';
```

See [API Reference](./docs/api-reference.md) for all type definitions.

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## Support

- **Issues**: Report bugs at [github.com/goobits/goobits-themes/issues](https://github.com/goobits/goobits-themes/issues)
- **Discussions**: Ask questions at [github.com/goobits/goobits-themes/discussions](https://github.com/goobits/goobits-themes/discussions)
- **Help**: See [SUPPORT.md](./SUPPORT.md) for support guidelines

## License

MIT - see [LICENSE](./LICENSE) for details.
