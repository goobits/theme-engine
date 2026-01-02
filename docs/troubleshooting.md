# Troubleshooting

Common issues and solutions when using @goobits/themes.

## Quick Symptom Index

Jump directly to your issue:

- **White flash on page load** → [Theme Flashes](#theme-flashes-on-page-load-fouc)
- **TypeScript errors** → [TypeScript Errors](#typescript-errors-on-import)
- **Module not found** → [Module Import Errors](#module-import-errors)
- **No theme styles** → [CSS Not Loading](#css-not-loading)
- **Theme toggle not working** → [Theme Not Switching](#theme-not-switching)
- **System theme not detected** → [System Theme Not Detecting](#system-theme-not-detecting)
- **Settings don't persist** → [Cookies Not Persisting](#cookies-not-persisting)
- **Custom colors not applying** → [Custom Scheme Not Applying](#custom-scheme-not-applying)
- **Hover effects missing** → [Hover Effects Not Working](#hover-effects-not-working)
- **Slow theme switching** → [Slow Theme Switching](#slow-theme-switching)

## Quick Diagnostic Checklist

Before diving into specific issues, verify these basics:

- [ ] Server hooks installed in `hooks.server.ts`
- [ ] HTML template has `%sveltekit.theme%` class placeholder
- [ ] Theme CSS imported in root layout
- [ ] ThemeProvider wraps your entire app
- [ ] Package in `dependencies`, not `devDependencies`

## Common Error Messages

If you see these exact error messages, here are the solutions:

| Error Message                                                      | Solution                                                                         |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `Cannot find module '@goobits/themes/svelte'`                      | [TypeScript Errors](#typescript-errors-on-import)                                |
| `theme is not defined`                                             | [Theme Not Switching](#theme-not-switching) - Component not inside ThemeProvider |
| `ReferenceError: document is not defined`                          | [Module Import Errors](#module-import-errors) - SSR issue                        |
| `TypeError: Cannot read property 'theme'`                          | [Theme Not Switching](#theme-not-switching) - Missing theme store                |
| `Failed to resolve import "@goobits/themes/...`                    | [Module Import Errors](#module-import-errors) - Check import path                |
| `Uncaught Error: Function called outside component initialization` | Component using useTheme() outside ThemeProvider                                 |

## Setup Issues

### Theme Flashes on Page Load (FOUC)

**Symptom:** Brief flash of unstyled content or wrong theme when page loads.

**Cause:** Missing server-side rendering configuration.

**Solution:**

1. Verify server hooks are configured:

```typescript
// src/hooks.server.ts
import { createThemeHooks } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

const { transform } = createThemeHooks(themeConfig);
export const handle = transform;
```

2. Ensure HTML template has theme placeholder:

```html
<!-- src/app.html -->
<html lang="en" class="%sveltekit.theme%">
    <!-- Not just <html lang="en"> -->
</html>
```

3. Verify layout loads preferences:

```typescript
// src/routes/+layout.server.ts
// Simplified! Preferences are auto-populated by the hook in locals
export function load({ locals }) {
    return {
        preferences: locals.themePreferences,
    };
}
```

---

### TypeScript Errors on Import

**Symptom:** `Cannot find module '@goobits/themes/svelte'` or similar errors.

**Cause:** Package installed as dev dependency or incorrect import path.

**Solution:**

1. Check package.json:

```json
{
    "dependencies": {
        "@goobits/themes": "^1.0.0" // ✅ Should be here
    },
    "devDependencies": {
        // ❌ NOT here
    }
}
```

2. Reinstall if needed:

```bash
npm uninstall @goobits/themes
npm install @goobits/themes
```

3. Clear SvelteKit cache:

```bash
rm -rf .svelte-kit
npm run dev
```

---

### Module Import Errors

**Symptom:** Import fails with "Module not found" error.

**Cause:** Incorrect import path or missing module export.

**Solution:**

Use correct import paths:

```typescript
// ✅ Correct
import { ThemeProvider } from '@goobits/themes/svelte';
import { createThemeHooks } from '@goobits/themes/server';
import type { ThemeConfig } from '@goobits/themes/core';

// ❌ Incorrect
import { ThemeProvider } from '@goobits/themes';
import { createThemeHooks } from '@goobits/themes';
```

---

### CSS Not Loading

**Symptom:** No theme styles applied, default browser styles visible.

**Cause:** CSS import missing or incorrect path.

**Solution:**

Import theme CSS in root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
    // Import theme CSS
    import '@goobits/themes/themes/default.css';
    import '@goobits/themes/themes/spells.css';

    // Or your custom themes
    import '../styles/themes/ocean.css';
</script>
```

---

## Runtime Issues

### Theme Not Switching

**Symptom:** Clicking theme toggle does nothing.

**Cause:** Component not inside ThemeProvider or incorrect method usage.

**Solution:**

1. Ensure component is inside ThemeProvider:

```svelte
<!-- src/routes/+layout.svelte -->
<ThemeProvider config={themeConfig}>
    <!-- All theme controls must be here -->
    <ThemeToggle />
    {@render children?.()}
</ThemeProvider>
```

2. Use correct method names:

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();

    // ✅ Correct
    theme.setTheme('dark');

    // ❌ Incorrect (old docs)
    theme.setMode('dark'); // This doesn't exist
</script>
```

---

### System Theme Not Detecting

**Symptom:** Theme stays in light or dark mode instead of following OS preference.

**Cause:** Theme mode not set to 'system'.

**Solution:**

Set theme mode to 'system':

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();

    // Set to system mode
    theme.setTheme('system');
</script>
```

Or configure as default:

```typescript
// Default to system in your initial preferences
export function load({ cookies }) {
    return {
        preferences: {
            theme: 'system', // Will follow OS
            themeScheme: 'default',
        },
    };
}
```

---

### Cookies Not Persisting

**Symptom:** Theme resets to default on page reload.

**Cause:** Cookie configuration issue or browser blocking cookies.

**Solution:**

1. Check browser allows cookies for localhost/your domain
2. Verify cookie is being written (check devtools → Application → Cookies)
3. Ensure server hooks are processing cookies:

```typescript
// src/hooks.server.ts must have transform hook
export const handle = createThemeHooks(themeConfig).transform;
```

4. Check cookie path and options:

```typescript
// utils/cookies.ts should have correct options
export const COOKIE_OPTIONS = {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax' as const,
};
```

---

### System Theme Not Updating When OS Changes

**Symptom:** Theme doesn't update when OS theme preference changes.

**Cause:** MediaQuery listener not attached or page needs reload.

**Solution:**

1. Ensure theme mode is set to 'system' (not 'light' or 'dark')
2. The system theme listener auto-updates without reload
3. If it doesn't work, try:

```bash
# Clear cache and restart dev server
rm -rf .svelte-kit
npm run dev
```

---

## Styling Issues

### Custom Scheme Not Applying

**Symptom:** Custom theme colors don't appear.

**Cause:** CSS not imported, incorrect selector, or specificity issue.

**Solution:**

1. Verify CSS file is imported:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
    import '../styles/themes/ocean.css'; // ✅ Imported
</script>
```

2. Check CSS selector uses correct format:

```css
/* ✅ Correct */
html.scheme-ocean {
    --accent-primary: #0066cc;
}

html.theme-dark.scheme-ocean {
    --bg-primary: #001a33;
}

/* ❌ Incorrect */
.scheme-ocean {
    /* Missing html prefix */
}
html .scheme-ocean {
    /* Space adds specificity issue */
}
```

3. Verify scheme name matches config:

```typescript
// Config
schemes: {
  ocean: { name: 'ocean', ... } // Must match CSS
}
```

---

### CSS Variables Not Working

**Symptom:** `var(--accent-primary)` doesn't apply color.

**Cause:** Variable not defined for current mode or typo.

**Solution:**

1. Check variable is defined:

```css
/* Define for both modes */
html.scheme-custom {
    --accent-primary: #blue; /* Light mode */
}

html.theme-dark.scheme-custom {
    --accent-primary: #lightblue; /* Dark mode */
}
```

2. Inspect in devtools:

```javascript
// In browser console
getComputedStyle(document.documentElement).getPropertyValue('--accent-primary');
```

3. Verify no typos in variable name (case-sensitive)

---

### Dark Mode Colors Look Wrong

**Symptom:** Dark mode uses light mode colors or vice versa.

**Cause:** Missing dark mode overrides in custom scheme.

**Solution:**

Always define dark mode overrides:

```css
/* Light mode colors */
html.scheme-ocean {
    --bg-primary: #ffffff;
    --text-primary: #000000;
}

/* Dark mode colors (REQUIRED) */
html.theme-dark.scheme-ocean,
html.theme-system-dark.scheme-ocean {
    --bg-primary: #001a33;
    --text-primary: #e0f2ff;
}
```

---

### Hover Effects Not Working

**Symptom:** No hover animations or effects.

**Cause:** Effects disabled or `prefers-reduced-motion` active.

**Solution:**

1. Check feature flags:

```css
html.scheme-custom {
    --enable-card-float: 1; /* 0 = off, 1 = on */
    --enable-magical-glow: 1;
}
```

2. Check user hasn't requested reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
    /* Effects might be disabled here */
}
```

3. Verify hover variables are defined:

```css
html.scheme-custom {
    --fx-hover-transform: translateY(-2px);
    --fx-hover-duration: 300ms;
}
```

---

## Configuration Issues

### ThemeConfig Type Errors

**Symptom:** TypeScript error on `createThemeConfig()`.

**Cause:** Incorrect config structure (using array instead of Record).

**Solution:**

Use Record format, not array:

```typescript
// ✅ Correct
const config: ThemeConfig = {
  schemes: {
    default: { name: 'default', ... },
    ocean: { name: 'ocean', ... }
  }
};

// ❌ Incorrect (old docs showed this)
const config = {
  schemes: ['default', 'ocean'] // This doesn't work
};
```

---

### Route Themes Not Working

**Symptom:** Route-specific themes don't apply.

**Cause:** Incorrect RouteThemeConfig structure.

**Solution:**

Use correct config format:

```typescript
// ✅ Correct
routeThemes: {
  '/admin': {
    theme: { base: 'dark', scheme: 'default' },
    override: true
  }
}

// ❌ Incorrect (old docs)
routeThemes: {
  '/admin': { mode: 'dark', scheme: 'default' } // Wrong structure
}
```

---

## Performance Issues

### Slow Theme Switching

**Symptom:** Noticeable delay when changing themes.

**Cause:** Too many CSS recalculations or heavy animations.

**Solution:**

1. Reduce animation complexity:

```css
/* Before: Complex */
--fx-hover-transform: translateY(-4px) scale(1.05) rotate(1deg);

/* After: Simple */
--fx-hover-transform: translateY(-2px);
```

2. Limit animated elements:

```css
/* Disable unnecessary animations */
--enable-card-float: 0;
--enable-magical-glow: 0;
```

3. Use CSS containment:

```css
.card {
    contain: layout style paint;
}
```

---

### Large Bundle Size

**Symptom:** Theme CSS increases bundle size significantly.

**Cause:** Importing multiple themes unnecessarily.

**Solution:**

1. Only import themes you use:

```typescript
// ✅ Good: Only what you need
import '@goobits/themes/themes/default.css';

// ❌ Avoid: Importing everything
import '@goobits/themes/themes';
import '@goobits/themes/themes/default.css';
import '@goobits/themes/themes/spells.css';
```

2. Use dynamic imports for optional themes:

```svelte
<script>
    import { onMount } from 'svelte';

    onMount(async () => {
        if (enableSpellsTheme) {
            await import('@goobits/themes/themes/spells.css');
        }
    });
</script>
```

---

## Browser Compatibility

### IE11 Support

**Issue:** Internet Explorer 11 doesn't support CSS custom properties.

**Solution:** IE11 is not supported. Minimum browser requirements:

- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+

---

### Safari Color Flash

**Symptom:** Brief color flash in Safari when theme loads.

**Cause:** Safari's rendering timing.

**Solution:**

Add transition delay to root:

```css
html.theme-switching {
    transition: none !important;
}

html.theme-switching * {
    transition: none !important;
}
```

This is already handled by the package, but if you see flashes, ensure you're not overriding `theme-switching` class.

---

## Development Issues

### Hot Module Reload Not Working

**Symptom:** Changes to theme CSS require full page reload.

**Cause:** Vite HMR doesn't detect CSS changes.

**Solution:**

This is expected behavior. CSS changes require reload. To speed up development:

```bash
# Watch mode with auto-reload
npm run dev
```

---

### Build Errors

**Symptom:** `npm run build` fails with theme-related errors.

**Cause:** TypeScript errors or missing dependencies.

**Solution:**

1. Check TypeScript config includes theme package:

```json
{
    "compilerOptions": {
        "types": ["@sveltejs/kit", "svelte", "vite/client"]
    }
}
```

2. Clear cache and rebuild:

```bash
rm -rf .svelte-kit node_modules
npm install
npm run build
```

---

## Getting More Help

### Enable Debug Logging

The package uses a logger that can be configured. Check browser console for warnings/errors.

### Inspect Applied Classes

```javascript
// In browser console
console.log(document.documentElement.className);
// Should show: theme-dark scheme-ocean (or similar)
```

### Check Computed Styles

```javascript
// In browser console
const styles = getComputedStyle(document.documentElement);
console.log(styles.getPropertyValue('--accent-primary'));
console.log(styles.getPropertyValue('--bg-primary'));
```

### Still Stuck?

1. Check [GitHub Issues](https://github.com/goobits/goobits-themes/issues) for similar problems
2. Search [GitHub Discussions](https://github.com/goobits/goobits-themes/discussions)
3. Create a minimal reproduction
4. Open a new issue with:
    - Package version
    - SvelteKit version
    - Minimal code example
    - Expected vs actual behavior

See [SUPPORT.md](../SUPPORT.md) for detailed guidelines on asking for help.

---

[Changelog](../CHANGELOG.md) | [Documentation Home](./README.md)
