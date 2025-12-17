# @goobits/themes

Theme management for SvelteKit applications with Svelte 5 runes support.

## Features

- Light, dark, and system theme modes with zero-flash SSR
- Native `data-theme` attribute support (both SSR and client-side)
- Custom color schemes with extensible configuration
- Reactive theme state using Svelte 5 runes
- Cookie-based preference persistence
- Route-specific theme overrides with automatic navigation tracking
- Built-in components and design tokens

## Installation

```bash
npm install @goobits/themes
```

**Requirements:** Svelte 5+, SvelteKit 2+, Node.js 18+

## Quick Start

```typescript
// 1. Create theme config → src/lib/config/theme.ts
import type { ThemeConfig } from '@goobits/themes/core';
export const themeConfig: ThemeConfig = { schemes: { /*...*/ } };

// 2. Add server hooks → src/hooks.server.ts
import { createThemeHooks } from '@goobits/themes/server';
export const handle = createThemeHooks(themeConfig).transform;

// 3. Wrap app → src/routes/+layout.svelte
import { ThemeProvider } from '@goobits/themes/svelte';
import '@goobits/themes/themes/default.css';
<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>
  {@render children?.()}
</ThemeProvider>
```

**Complete setup guide:** [Getting Started](./docs/getting-started.md)

## CSS Structure

The theme engine automatically manages both CSS classes and attributes on your `<html>` element, giving you flexibility in how you write theme styles.

### What Gets Applied

**CSS Classes:**
- `.theme-light` | `.theme-dark` | `.theme-system` - User's theme preference
- `.theme-system-light` | `.theme-system-dark` - Resolved system preference (when using system mode)
- `.scheme-default` | `.scheme-{name}` - Active color scheme

**Data Attributes:**
- `data-theme="light"` | `data-theme="dark"` - Resolved visual theme (always reflects what's actually shown)

### Writing Theme Styles

You can target themes using either approach:

```css
/* Option 1: Use data-theme attribute (recommended - more semantic) */
[data-theme="dark"] {
    --bg-primary: #000;
    --text-primary: #fff;
}

[data-theme="light"] {
    --bg-primary: #fff;
    --text-primary: #000;
}

/* Option 2: Use CSS classes (if you need to distinguish system vs explicit choice) */
.theme-dark,
.theme-system-dark {
    --bg-primary: #000;
}

/* Scheme-specific overrides work with both approaches */
.scheme-spells {
    --accent-primary: #7c3aed;
}

[data-theme="dark"].scheme-spells {
    --accent-glow: #a78bfa;
}
```

**Key behaviors:**
- When theme is set to `system`, `data-theme` reflects the **resolved** value (`"light"` or `"dark"`), not `"system"`
- Both classes and attributes are set during SSR to prevent flash of unstyled content
- Route-specific theme changes update automatically on navigation
- All updates are synchronized between classes and attributes

## Documentation

**[Documentation](./docs/README.md)** | **[Getting Started](./docs/getting-started.md)**

| Guide                                        | Description                               |
| -------------------------------------------- | ----------------------------------------- |
| [API Reference](./docs/api-reference.md)     | Complete API documentation with types     |
| [Components](./docs/components.md)           | Built-in components and `useTheme()` hook |
| [Custom Themes](./docs/custom-themes.md)     | Create color schemes and design tokens    |
| [Design Tokens](./docs/design-tokens.md)     | CSS variable reference                    |
| [Best Practices](./docs/best-practices.md)   | Accessibility and performance             |
| [Troubleshooting](./docs/troubleshooting.md) | Common issues and solutions               |

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## Support

- **Issues**: Report bugs at [github.com/goobits/goobits-themes/issues](https://github.com/goobits/goobits-themes/issues)
- **Discussions**: Ask questions at [github.com/goobits/goobits-themes/discussions](https://github.com/goobits/goobits-themes/discussions)
- **Help**: See [SUPPORT.md](./SUPPORT.md) for support guidelines

## License

MIT - see [LICENSE](./LICENSE) for details.
