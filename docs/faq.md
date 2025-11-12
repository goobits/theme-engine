# Frequently Asked Questions

Quick answers to common questions about @goobits/themes.

## Installation & Setup

### Q: Can I use this with Svelte 4?

**A:** No. @goobits/themes requires Svelte 5.0.0+ because it uses runes (`$state`, `$derived`, `$effect`). For Svelte 4 projects, consider [theme-change](https://github.com/saadeghi/theme-change) or [svelte-themer](https://github.com/joshnuss/svelte-themer).

### Q: Does this work with SvelteKit 1.x?

**A:** No. SvelteKit 2.0.0+ is required. The package uses updated APIs from SvelteKit 2.

### Q: Why do I get "Cannot find module" errors?

**A:** Ensure `@goobits/themes` is in `dependencies` (not `devDependencies`) in your `package.json`. Run `npm install @goobits/themes` to fix.

### Q: Do I need to install any peer dependencies?

**A:** No. Svelte 5 and SvelteKit 2 are peer dependencies but should already be in your project.

---

## Configuration

### Q: Can I have more than 2 color schemes?

**A:** Yes! Define as many schemes as you want in `themeConfig.schemes`. Each scheme needs a unique name and preview colors.

### Q: How do I set a default theme?

**A:** The first scheme in your `themeConfig.schemes` object becomes the default. Or specify defaults in `loadThemePreferences()`:

```typescript
export function load({ cookies }) {
    return {
        preferences: {
            theme: 'dark', // default mode
            themeScheme: 'ocean', // default scheme
        },
    };
}
```

### Q: Can I use custom theme names?

**A:** Yes! Use any lowercase, hyphenated name. Avoid `light`, `dark`, `system`, `auto` as these are reserved.

✅ Good: `ocean`, `forest-green`, `sunset-2024`
❌ Bad: `Ocean`, `forest_green`, `2-sunset`, `dark`

---

## TypeScript

### Q: How do I add type safety for my custom schemes?

**A:** Extend the `ThemeScheme` type using module augmentation:

```typescript
// src/lib/types/theme.d.ts
declare module '@goobits/themes/core' {
    export type ThemeScheme = 'default' | 'spells' | 'ocean' | 'forest';
}
```

### Q: Why doesn't TypeScript recognize my imports?

**A:** Make sure you're importing from the correct subpaths:

- `@goobits/themes/core` - Types and config
- `@goobits/themes/svelte` - Components and hooks
- `@goobits/themes/server` - Server-side utilities

### Q: Can I get IntelliSense for CSS variables?

**A:** Yes! Create a `theme.d.css.ts` file with CSS variable declarations, or use the [CSS Var Complete](https://marketplace.visualstudio.com/items?itemName=phoenisx.cssvar) VS Code extension.

---

## Styling & Customization

### Q: Do I need to write CSS for each theme?

**A:** Only for custom schemes. The included `default` and `spells` schemes work out of the box. Import them:

```typescript
import '@goobits/themes/themes/default.css';
import '@goobits/themes/themes/spells.css';
```

### Q: Can I use Tailwind CSS with this?

**A:** Yes! Tailwind and @goobits/themes can coexist. Use Tailwind utilities for component styles and @goobits/themes for theming/dark mode.

### Q: How do I customize hover effects?

**A:** Override FX tokens in your scheme CSS:

```css
html.scheme-custom {
    --fx-hover-transform: translateY(-4px);
    --fx-hover-duration: 200ms;
    --enable-card-float: 1;
}
```

### Q: Can I disable animations entirely?

**A:** Yes! Set FX tokens to `0` or `none`:

```css
html.scheme-custom {
    --enable-card-float: 0;
    --enable-magical-glow: 0;
    --fx-transition-duration: 0ms;
}
```

---

## Dark Mode & Themes

### Q: What's the difference between "theme mode" and "color scheme"?

**A:**

- **Theme Mode**: Light, dark, or system (OS preference)
- **Color Scheme**: Your brand colors (default, spells, ocean, etc.)

You can have a "dark mode" with any color scheme.

### Q: How do I detect if user is in dark mode?

**A:** Use the theme store:

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();
    const isDark = $derived(theme.theme === 'dark');
</script>

{#if isDark}
    <!-- Dark mode content -->
{/if}
```

### Q: Can I force dark mode on specific routes?

**A:** Yes! Use `routeThemes` in your config:

```typescript
routeThemes: {
  '/admin': {
    theme: { base: 'dark', scheme: 'default' },
    override: true
  }
}
```

---

## SSR & Performance

### Q: Why do I see a flash of unstyled content (FOUC)?

**A:** You're missing the server-side hooks. Follow steps 2 and 3 in [Getting Started](./getting-started.md#quick-setup):

1. Add `createThemeHooks()` to `hooks.server.ts`
2. Add `%sveltekit.theme%` to your `app.html`

### Q: Does this work with static site generation (SSG)?

**A:** Yes! The theme system works with adapter-static. The initial theme is set via cookies/localStorage on first load.

### Q: Will this slow down my app?

**A:** No. The package is <10KB gzipped. Theme switching is instant (just CSS class changes). No runtime CSS generation.

### Q: Can I preload theme CSS?

**A:** Yes! Add to your `app.html`:

```html
<link rel="preload" href="/path/to/theme.css" as="style" />
```

---

## Components

### Q: Do I have to use the built-in components?

**A:** No! Use `useTheme()` to build your own. The built-in components are convenience helpers.

### Q: Can I style the ThemeToggle component?

**A:** Yes! It uses CSS variables:

```css
.theme-toggle {
    --toggle-bg: var(--bg-secondary);
    --toggle-color: var(--text-primary);
    --toggle-hover: var(--hover-overlay);
}
```

Or build your own with `useTheme()`.

### Q: How do I add theme preview colors to the selector?

**A:** Use the scheme `preview` property in your config:

```typescript
preview: {
  primary: '#3b82f6',
  accent: '#60a5fa',
  background: '#ffffff'
}
```

Then access via `theme.availableSchemes` in your component.

---

## Troubleshooting

### Q: Theme toggle doesn't work. What's wrong?

**A:** Ensure:

1. Component is inside `<ThemeProvider>`
2. You're importing theme CSS
3. `%sveltekit.theme%` is in `app.html`
4. Server hooks are configured

See [Troubleshooting Guide](./troubleshooting.md) for details.

### Q: TypeScript complains about my custom scheme names

**A:** You need to extend the `ThemeScheme` type. See [TypeScript](#q-how-do-i-add-type-safety-for-my-custom-schemes) section above.

### Q: Colors don't change when I switch themes

**A:** Check that you're using CSS variables (`var(--bg-primary)`) not hard-coded colors (`#ffffff`).

### Q: How do I debug theme issues?

**A:** Check the applied classes:

```javascript
// In browser console
console.log(document.documentElement.className);
// Should show: theme-dark scheme-ocean (or similar)
```

Check CSS variables:

```javascript
getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
```

---

## Migration & Compatibility

### Q: Can I migrate from another theme library?

**A:** Yes. See [migration patterns](./recipes.md#migration-patterns) for common transitions. Key differences:

- Use `ThemeProvider` instead of a context
- Import theme CSS explicitly
- Use `useTheme()` instead of props

### Q: Is there a codemod for migration?

**A:** Not currently. Most migrations require manual updates to import statements and component structure.

### Q: What browsers are supported?

**A:** Modern browsers that support CSS custom properties:

- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+

IE11 is **not supported**.

---

## See Also

**Guides:**

- [Getting Started](./getting-started.md) - Installation and setup
- [Recipes](./recipes.md) - Code examples for common patterns
- [Troubleshooting](./troubleshooting.md) - Detailed problem solving

**Reference:**

- [API Reference](./api-reference.md) - Complete API documentation
- [Components](./components.md) - Component details and props

---

📋 [Changelog](../CHANGELOG.md) | 🏠 [Documentation Home](./README.md)
