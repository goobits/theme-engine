# Best Practices

Guidelines for building accessible, performant, and maintainable themes with @goobits/themes.

## Accessibility

### Color Contrast

Maintain [WCAG AA standards](https://www.w3.org/WAI/WCAG21/Understanding/conformance#levels) for all text and interactive elements.

**Requirements:**

- Normal text on background: **4.5:1** contrast ratio minimum
- Large text (18pt+ or 14pt+ bold): **3:1** contrast ratio minimum
- Interactive elements: **3:1** against background

**Testing:**

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)
- Browser DevTools (Lighthouse accessibility audit)

**Example:**

```css
/* ✅ Good: High contrast */
html.scheme-custom {
    --bg-primary: #ffffff;
    --text-primary: #1a1a1a; /* 15:1 contrast */
}

html.theme-dark.scheme-custom {
    --bg-primary: #0a0a0a;
    --text-primary: #f5f5f5; /* 14:1 contrast */
}

/* ❌ Avoid: Low contrast */
html.scheme-custom {
    --bg-primary: #ffffff;
    --text-primary: #cccccc; /* 2.6:1 - fails WCAG AA */
}
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible.

**Requirements:**

- All theme controls must be focusable
- Clear focus indicators
- Logical tab order
- No keyboard traps

**Example:**

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();
</script>

<!-- ✅ Good: Keyboard accessible -->
<button onclick={() => theme.cycleMode()} aria-label="Toggle theme mode"> Toggle Theme </button>

<!-- ❌ Avoid: Not keyboard accessible -->
<div onclick={() => theme.cycleMode()}>Toggle Theme</div>
```

### Focus Indicators

Always provide visible focus indicators.

```css
/* ✅ Good: Clear focus ring */
button:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
}

/* ❌ Avoid: No focus indicator */
button:focus {
    outline: none;
}
```

### Screen Reader Support

Announce theme changes to screen readers.

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();
    const mode = $derived(theme.theme);
</script>

<!-- Screen reader announcement -->
<div role="status" aria-live="polite" class="sr-only">
    Theme changed to {mode} mode
</div>

<button onclick={() => theme.cycleMode()} aria-label="Toggle theme. Current: {mode}">
    {mode === 'dark' ? '🌙' : '☀️'}
</button>

<style>
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }
</style>
```

### Reduced Motion

Respect user motion preferences.

```css
@media (prefers-reduced-motion: reduce) {
    html {
        /* Disable animations */
        --fx-hover-transform: none;
        --fx-ambient-float: none;
        --fx-ambient-pulse: none;

        /* Remove transitions */
        --transition-fast: 0ms;
        --transition-base: 0ms;
        --transition-slow: 0ms;
    }

    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## Performance

### Minimize CSS Recalculation

Use CSS containment to limit reflow scope.

```css
.card {
    /* Isolate layout calculations */
    contain: layout style paint;
}

.theme-toggle {
    /* Prevent layout shifts */
    contain: layout paint;
}
```

### Optimize Transitions

Keep animations performant.

```css
/* ✅ Good: GPU-accelerated properties */
.card {
    transition:
        transform 200ms,
        opacity 200ms;
}

.card:hover {
    transform: translateY(-2px); /* GPU-accelerated */
    opacity: 0.9;
}

/* ❌ Avoid: Layout-triggering properties */
.card {
    transition:
        height 200ms,
        width 200ms; /* Triggers layout */
}
```

### Lazy Load Themes

Import themes dynamically when needed.

```svelte
<script>
    import { onMount } from 'svelte';

    let spellsEnabled = false;

    onMount(async () => {
        if (needsSpellsTheme()) {
            await import('@goobits/themes/themes/spells.css');
            spellsEnabled = true;
        }
    });
</script>
```

### Bundle Optimization

Only import what you need.

```typescript
// ✅ Good: Specific imports
import { ThemeProvider, useTheme } from '@goobits/themes/svelte';
import '@goobits/themes/themes/default.css';

// ❌ Avoid: Importing everything
import * from '@goobits/themes/svelte';
import '@goobits/themes/themes';
```

---

## Code Organization

### Theme Configuration

Keep configuration centralized and typed.

```typescript
// src/lib/config/theme.ts
import type { ThemeConfig, SchemeConfig } from '@goobits/themes/core';

const schemes: Record<string, SchemeConfig> = {
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
};

export const themeConfig: ThemeConfig = {
    schemes,
};
```

### CSS Organization

Structure theme CSS consistently.

```css
/* src/styles/themes/ocean.css */

html.scheme-ocean {
    /* ========================================
   * COLOR PALETTE - LIGHT MODE
   * ======================================== */
    --accent-primary: #0066cc;
    --accent-glow: #00ccff;

    /* ========================================
   * BACKGROUNDS - LIGHT MODE
   * ======================================== */
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f7;

    /* ========================================
   * EFFECTS
   * ======================================== */
    --fx-hover-transform: translateY(-2px);
    --fx-hover-duration: 300ms;
}

/* ========================================
 * DARK MODE OVERRIDES
 * ======================================== */
html.theme-dark.scheme-ocean,
html.theme-system-dark.scheme-ocean {
    --bg-primary: #001a33;
    --text-primary: #e0f2ff;
}
```

### Component Patterns

Use consistent patterns for theme-aware components.

```svelte
<!-- ✅ Good: Separation of concerns -->
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();
    const isDark = $derived(theme.theme === 'dark');
</script>

<div class="component" class:dark={isDark}>
    <!-- Component content -->
</div>

<style>
    .component {
        background: var(--bg-card);
        color: var(--text-primary);
    }
</style>
```

---

## Testing

### Visual Testing

Test themes across all pages and states.

**Test coverage:**

- Light mode on all pages
- Dark mode on all pages
- System mode (both light and dark)
- All color schemes
- Hover states
- Focus states
- Active states
- Disabled states
- Loading states
- Error states

### Browser Testing

Test across browsers and devices.

**Minimum browsers:**

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Devices:**

- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

### Automated Testing

Add theme tests to your test suite.

```typescript
import { render } from '@testing-library/svelte';
import { ThemeProvider } from '@goobits/themes/svelte';
import { themeConfig } from '$lib/config/theme';

test('theme provider initializes correctly', () => {
    const { container } = render(ThemeProvider, {
        props: {
            config: themeConfig,
            serverPreferences: { theme: 'dark', themeScheme: 'default' },
        },
    });

    const html = document.documentElement;
    expect(html.classList.contains('theme-dark')).toBe(true);
    expect(html.classList.contains('scheme-default')).toBe(true);
});
```

---

## Security

### Cookie Configuration

Configure cookies securely for production.

```typescript
// utils/cookies.ts
export const COOKIE_OPTIONS = {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // Must be false for client access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax' as const,
};
```

### Input Validation

Validate theme values before applying.

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();
    const validModes = ['light', 'dark', 'system'];

    function setThemeSafely(mode: string) {
        if (validModes.includes(mode)) {
            theme.setTheme(mode as ThemeMode);
        } else {
            console.warn('Invalid theme mode:', mode);
        }
    }
</script>
```

---

## Maintenance

### Version Control

Track theme changes in version control.

```gitignore
# Don't ignore theme files
!src/styles/themes/
!docs/

# Do ignore generated files
.svelte-kit/
node_modules/
```

### Documentation

Document custom themes.

```typescript
// src/styles/themes/ocean.css
/**
 * Ocean Theme
 *
 * Cool blue tones inspired by the sea.
 * Best for: Marine, environmental, or tech applications
 *
 * Accent: #0066cc (Ocean Blue)
 * Background: #ffffff (Light) / #001a33 (Dark)
 *
 * @author Design Team
 * @version 1.0.0
 */
```

### Breaking Changes

Document breaking changes in theme updates.

````markdown
## Theme Update v2.0.0

### Breaking Changes

- Renamed `--primary-color` to `--accent-primary`
- Removed `--legacy-bg` variable
- Changed dark mode selector from `.dark` to `.theme-dark`

### Migration

```css
/* Before */
html.dark {
    --primary-color: #blue;
}

/* After */
html.theme-dark.scheme-custom {
    --accent-primary: #blue;
}
```
````

````

---

## Common Patterns

### Theme Switcher with Preview

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
  const modes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' }
  ];
</script>

<div class="theme-switcher">
  {#each modes as { value, label, icon }}
    <button
      class="mode-button"
      class:active={theme.theme === value}
      onclick={() => theme.setTheme(value)}
      aria-label="Switch to {label} mode"
    >
      <span class="icon">{icon}</span>
      <span class="label">{label}</span>
    </button>
  {/each}
</div>
````

### Persistent Theme Choice

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';
    import { browser } from '$app/environment';

    const theme = useTheme();

    // Theme is automatically persisted via cookies and localStorage
    // No additional code needed!
</script>
```

### Route-Specific Themes

```typescript
// src/lib/config/theme.ts
export const themeConfig: ThemeConfig = {
    schemes: {
        /* ... */
    },
    routeThemes: {
        '/admin': {
            theme: { base: 'dark', scheme: 'default' },
            override: true,
            description: 'Admin area always uses dark theme',
        },
        '/docs/*': {
            theme: { base: 'light', scheme: 'default' },
            override: false,
            description: 'Docs suggest light theme',
        },
    },
};
```

---

## Anti-Patterns

### Don't Mix Theme Logic

```svelte
<!-- ❌ Avoid: Theme logic in components -->
<script>
  function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', 'dark');
  }
</script>

<!-- ✅ Good: Use theme store -->
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
</script>

<button onclick={() => theme.cycleMode()}>Toggle</button>
```

### Don't Hard-Code Colors

```css
/* ❌ Avoid: Hard-coded colors */
.card {
    background: #ffffff;
    color: #000000;
    border: 1px solid #e5e5e5;
}

/* ✅ Good: CSS variables */
.card {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
}
```

### Don't Skip Dark Mode

```css
/* ❌ Avoid: Only light mode */
html.scheme-custom {
    --bg-primary: #ffffff;
}

/* ✅ Good: Both modes */
html.scheme-custom {
    --bg-primary: #ffffff;
}

html.theme-dark.scheme-custom {
    --bg-primary: #0a0a0a;
}
```

---

## Production Checklist

Before deploying, verify:

- All themes tested in light and dark modes
- Color contrast meets WCAG AA standards
- Keyboard navigation works on all theme controls
- Focus indicators visible
- Screen reader announcements work
- Reduced motion preferences respected
- Themes work in all target browsers
- No console errors or warnings
- Cookies persist correctly
- SSR works without flash
- Bundle size optimized
- Theme transitions smooth
- Mobile responsive
- Documentation updated

---

## See Also

**Encountered issues?**

- [Troubleshooting](./troubleshooting.md) - Debug common problems

**External resources:**

- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [Web.dev: Color and Contrast](https://web.dev/color-and-contrast-accessibility/) - Contrast guidance

---

[Changelog](../CHANGELOG.md) | [Documentation Home](./README.md)
