# @goobits/themes

A reusable theme system for SvelteKit projects with Svelte 5 runes support.

## Installation

```bash
npm install @goobits/themes
```

## Usage

```typescript
// In your root layout (+layout.svelte)
import { ThemeProvider } from '@goobits/themes/svelte';
import { themeConfig } from '$lib/config/theme';

<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>
  {@render children?.()}
</ThemeProvider>

// In any component
import { useTheme } from '@goobits/themes/svelte';

const theme = useTheme();
const currentScheme = $derived(theme.scheme);
```
