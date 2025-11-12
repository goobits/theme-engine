# @goobits/themes

Theme management for SvelteKit applications with Svelte 5 runes support.

## Features

- Light, dark, and system theme modes with zero-flash SSR
- Custom color schemes with extensible configuration
- Reactive theme state using Svelte 5 runes
- Cookie-based preference persistence
- Route-specific theme overrides
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

## Documentation

**[📚 Documentation Home](./docs/README.md)** | **[🚀 Getting Started](./docs/getting-started.md)**

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
