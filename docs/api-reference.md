# API Reference

Complete reference for all @goobits/themes modules, types, and functions.

## Module Structure

@goobits/themes is organized into focused modules:

- **core** - Framework-agnostic theme logic and configuration
- **svelte** - Svelte 5 components and reactive stores
- **server** - SvelteKit server-side hooks and utilities
- **utils** - Cookie management and routing helpers

## Core Module

Framework-agnostic theme configuration and types.

### `createThemeConfig(config)`

Creates a theme configuration object.

```typescript
import { createThemeConfig } from '@goobits/themes/core';
import type { ThemeConfig } from '@goobits/themes/core';

const config: ThemeConfig = createThemeConfig({
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
    }
  },
  routeThemes: {
    '/admin': {
      theme: { base: 'dark', scheme: 'default' },
      override: true,
      description: 'Admin area uses dark theme'
    }
  }
});
```

**Parameters:**
- `config` (ThemeConfig) - Configuration object

**Returns:** ThemeConfig

### Types

#### `ThemeConfig`

```typescript
interface ThemeConfig {
  schemes: Record<string, SchemeConfig>;
  routeThemes?: Record<string, RouteThemeConfig>;
}
```

**Properties:**
- `schemes` - Available color schemes as a Record (not an array)
- `routeThemes` - Optional route-specific theme overrides

#### `SchemeConfig`

```typescript
interface SchemeConfig {
  name: string;           // Used in CSS class: .scheme-{name}
  displayName: string;    // Shown to users in UI
  description: string;    // Scheme description
  icon?: string;          // Optional emoji or icon
  title?: string;         // Optional page title override
  preview: {              // Colors for selector preview
    primary: string;
    accent: string;
    background: string;
  };
  cssFile?: string;       // Optional CSS file path
}
```

#### `ThemeMode`

```typescript
type ThemeMode = "light" | "dark" | "system";
```

Theme mode options:
- `"light"` - Force light mode
- `"dark"` - Force dark mode
- `"system"` - Follow OS preference

#### `ThemeScheme`

```typescript
type ThemeScheme = "default" | "spells" | string;
```

Extensible color scheme type. Default schemes are "default" and "spells".

#### `FullTheme`

```typescript
interface FullTheme {
  base: ThemeMode;
  scheme: ThemeScheme;
}
```

Combines base theme mode with color scheme.

## Svelte Module

Svelte 5 components and reactive theme store.

### `ThemeProvider`

Root component that manages theme state.

```svelte
<script>
  import { ThemeProvider } from '@goobits/themes/svelte';
  import type { ThemeConfig } from '@goobits/themes/core';

  const config: ThemeConfig = { /* ... */ };
  const serverPrefs = { theme: 'system', themeScheme: 'default' };
</script>

<ThemeProvider config={config} serverPreferences={serverPrefs}>
  <!-- Your app -->
</ThemeProvider>
```

**Props:**
- `config` (ThemeConfig) - Theme configuration object
- `serverPreferences` (ServerPreferences) - Initial preferences from server

### `ThemeToggle`

Button component for cycling through theme modes.

```svelte
<script>
  import { ThemeToggle } from '@goobits/themes/svelte';
</script>

<ThemeToggle />
```

Cycles through: light → dark → system

### `SchemeSelector`

Dropdown component for selecting color schemes.

```svelte
<script>
  import { SchemeSelector } from '@goobits/themes/svelte';
</script>

<SchemeSelector />
```

### `useTheme()`

Hook to access theme store in components.

```typescript
import { useTheme } from '@goobits/themes/svelte';

const theme = useTheme();
```

**Returns:** ThemeStore

#### `ThemeStore`

```typescript
interface ThemeStore {
  // Reactive properties (use with $derived)
  readonly theme: ThemeMode;
  readonly scheme: ThemeScheme;
  readonly settings: ThemeSettings;
  readonly availableSchemes: SchemeConfig[];

  // Methods
  setTheme(theme: ThemeMode): void;
  setScheme(scheme: ThemeScheme): void;
  cycleMode(): void;

  // Store subscription
  subscribe(fn: (value: any) => void): () => void;
}
```

**Properties:**
- `theme` - Current theme mode
- `scheme` - Current color scheme
- `settings` - Full settings object
- `availableSchemes` - Array of available schemes from config

**Methods:**
- `setTheme(theme)` - Change theme mode
- `setScheme(scheme)` - Change color scheme
- `cycleMode()` - Cycle through light → dark → system

**Example:**

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
  const currentMode = $derived(theme.theme);

  function toggle() {
    theme.setTheme(currentMode === 'dark' ? 'light' : 'dark');
  }
</script>

<button onclick={toggle}>
  Current: {currentMode}
</button>
```

## Server Module

SvelteKit server-side hooks and utilities.

### `createThemeHooks(config)`

Creates SvelteKit hooks for server-side theme handling.

```typescript
import { createThemeHooks } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

const { transform } = createThemeHooks(themeConfig);

export const handle = transform;
```

**Parameters:**
- `config` (ThemeConfig) - Theme configuration

**Returns:** `{ transform: Handle }`

### `loadThemePreferences(cookies, config)`

Loads theme preferences from cookies for SSR.

```typescript
import { loadThemePreferences } from '@goobits/themes/server';
import type { Cookies } from '@sveltejs/kit';

export function load({ cookies }: { cookies: Cookies }) {
  return {
    preferences: loadThemePreferences(cookies, themeConfig)
  };
}
```

**Parameters:**
- `cookies` (Cookies) - SvelteKit cookies object
- `config` (ThemeConfig) - Theme configuration

**Returns:** `ServerPreferences`

#### `ServerPreferences`

```typescript
interface ServerPreferences {
  theme: ThemeMode;
  themeScheme: ThemeScheme;
}
```

## Utils Module

Helper utilities for cookies and route theming.

### `readPreferenceCookies()`

Reads user preferences from cookies (client-side).

```typescript
import { readPreferenceCookies } from '@goobits/themes/utils';

const prefs = readPreferenceCookies();
// { theme: 'dark', themeScheme: 'spells', ... }
```

**Returns:** `Partial<UserPreferences>`

### `writePreferenceCookies(preferences)`

Writes user preferences to cookies (client-side).

```typescript
import { writePreferenceCookies } from '@goobits/themes/utils';

writePreferenceCookies({
  theme: 'dark',
  themeScheme: 'default'
});
```

**Parameters:**
- `preferences` (Partial<UserPreferences>) - Preferences to save

### `getRouteTheme(pathname, routeThemes)`

Gets theme configuration for a specific route.

```typescript
import { getRouteTheme } from '@goobits/themes/utils';
import type { RouteThemeConfig } from '@goobits/themes/utils';

const routeThemes: Record<string, RouteThemeConfig> = {
  '/admin': {
    theme: { base: 'dark', scheme: 'default' },
    override: true,
    description: 'Admin dark theme'
  },
  '/blog/*': {
    theme: { base: 'light', scheme: 'default' },
    override: false
  }
};

const config = getRouteTheme('/admin', routeThemes);
```

**Parameters:**
- `pathname` (string) - Current route path
- `routeThemes` (Record<string, RouteThemeConfig>) - Route theme configuration

**Returns:** `RouteThemeConfig | null`

#### `RouteThemeConfig`

```typescript
interface RouteThemeConfig {
  theme: FullTheme;        // Theme to apply
  override: boolean;       // Override user preferences?
  description?: string;    // Optional description
}
```

**Properties:**
- `theme` - Full theme with base mode and scheme
- `override` - Whether to override user preferences (true) or suggest only (false)
- `description` - Optional description for debugging

### Other Route Utilities

```typescript
// Check if route has a theme
import { routeHasTheme } from '@goobits/themes/utils';
const hasTheme = routeHasTheme('/admin', routeThemes);

// Get all routes using a scheme
import { getRoutesForScheme } from '@goobits/themes/utils';
const routes = getRoutesForScheme('spells', routeThemes);

// Check if route theme overrides preferences
import { routeThemeOverrides } from '@goobits/themes/utils';
const overrides = routeThemeOverrides('/admin', routeThemes);
```

## CSS Imports

Theme CSS files are available through package exports:

```typescript
// All base design tokens
import '@goobits/themes/themes';

// Base tokens only (reset + design system)
import '@goobits/themes/themes/base';

// Individual token files
import '@goobits/themes/themes/base/design-tokens.css';
import '@goobits/themes/themes/base/fx-tokens.css';
import '@goobits/themes/themes/base/reset.css';

// Preset color schemes
import '@goobits/themes/themes/default.css';
import '@goobits/themes/themes/spells.css';
```

## Type Exports

All types are exported from their respective modules:

```typescript
// Core types
import type {
  ThemeMode,
  ThemeScheme,
  FullTheme,
  ThemeConfig,
  SchemeConfig
} from '@goobits/themes/core';

// Svelte types
import type {
  ThemeStore,
  ThemeSettings
} from '@goobits/themes/svelte';

// Utils types
import type {
  RouteThemeConfig,
  UserPreferences
} from '@goobits/themes/utils';
```

## Advanced: Low-Level APIs

For advanced use cases, low-level theme management functions are available:

```typescript
import {
  applyThemeScheme,
  applyFullTheme,
  getCurrentScheme
} from '@goobits/themes/core';

// Apply scheme directly to DOM
applyThemeScheme('spells');

// Apply full theme (mode + scheme)
applyFullTheme({ base: 'dark', scheme: 'spells' });

// Get current scheme from DOM
const current = getCurrentScheme();
```

**Note:** Most applications should use `ThemeProvider` and `useTheme()` instead of these low-level APIs.
