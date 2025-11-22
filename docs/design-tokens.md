# Design Tokens

Complete CSS variable reference for @goobits/themes. These tokens form the foundation of the theming system.

## Overview

Design tokens are CSS custom properties that define your theme's visual language. Override these in your custom schemes to create unique color palettes and effects.

## Base Tokens

Import base design tokens in your layout:

```typescript
import '@goobits/themes/themes/base';
```

This includes:

- CSS reset
- Core design tokens
- FX (effects) tokens

## Core Color Tokens

### Background Colors

| Variable             | Purpose                  | Light Example | Dark Example |
| -------------------- | ------------------------ | ------------- | ------------ |
| `--bg-primary`       | Main background          | `#ffffff`     | `#0a0a0f`    |
| `--bg-secondary`     | Secondary background     | `#f5f5f7`     | `#13131f`    |
| `--bg-tertiary`      | Tertiary background      | `#e8e8ed`     | `#1a1a2e`    |
| `--color-background` | Alias for primary bg     | `#ffffff`     | `#0a0a0f`    |
| `--color-surface`    | Card/panel background    | `#ffffff`     | `#1a1a2e`    |
| `--bg-card`          | Card-specific background | `#ffffff`     | `#13131f`    |

### Text Colors

| Variable           | Purpose                | Light Example | Dark Example |
| ------------------ | ---------------------- | ------------- | ------------ |
| `--text-primary`   | Main text              | `#1d1d1f`     | `#e0e0ff`    |
| `--text-secondary` | Secondary text         | `#6e6e73`     | `#9090b0`    |
| `--text-tertiary`  | Tertiary/muted text    | `#86868b`     | `#6a6a8a`    |
| `--color-text`     | Alias for primary text | `#1d1d1f`     | `#e0e0ff`    |

### Accent Colors

| Variable              | Purpose          | Light Example | Dark Example |
| --------------------- | ---------------- | ------------- | ------------ |
| `--accent-primary`    | Primary accent   | `#007aff`     | `#7c3aed`    |
| `--accent-glow`       | Highlight/glow   | `#0051d5`     | `#a78bfa`    |
| `--accent-secondary`  | Secondary accent | `#5856d6`     | `#8b5cf6`    |
| `--color-primary-400` | Lighter shade    | `#60a5fa`     | `#a78bfa`    |
| `--color-primary-500` | Base shade       | `#3b82f6`     | `#8b5cf6`    |
| `--color-primary-600` | Medium shade     | `#2563eb`     | `#7c3aed`    |
| `--color-primary-700` | Darker shade     | `#1d4ed8`     | `#6d28d9`    |

### Border Colors

| Variable             | Purpose           | Light Example         | Dark Example              |
| -------------------- | ----------------- | --------------------- | ------------------------- |
| `--border-primary`   | Main borders      | `rgba(0, 0, 0, 0.1)`  | `rgba(124, 58, 237, 0.3)` |
| `--border-secondary` | Secondary borders | `rgba(0, 0, 0, 0.05)` | `rgba(124, 58, 237, 0.2)` |

## Interactive State Tokens

### Hover States

| Variable           | Purpose              | Light Example         | Dark Example              |
| ------------------ | -------------------- | --------------------- | ------------------------- |
| `--hover-overlay`  | Hover overlay color  | `rgba(0, 0, 0, 0.05)` | `rgba(124, 58, 237, 0.1)` |
| `--active-overlay` | Active/pressed state | `rgba(0, 0, 0, 0.1)`  | `rgba(124, 58, 237, 0.2)` |

### Focus States

| Variable             | Purpose           | Example                        |
| -------------------- | ----------------- | ------------------------------ |
| `--focus-ring`       | Focus ring effect | `0 0 0 2px var(--accent-glow)` |
| `--focus-ring-color` | Focus ring color  | `var(--accent-primary)`        |

## Shadow Tokens

| Variable      | Purpose            | Light                         | Dark                           |
| ------------- | ------------------ | ----------------------------- | ------------------------------ |
| `--shadow-sm` | Small shadow       | `0 1px 2px rgba(0,0,0,0.05)`  | `0 1px 2px rgba(0,0,0,0.5)`    |
| `--shadow-md` | Medium shadow      | `0 4px 6px rgba(0,0,0,0.1)`   | `0 4px 6px rgba(0,0,0,0.7)`    |
| `--shadow-lg` | Large shadow       | `0 10px 15px rgba(0,0,0,0.1)` | `0 10px 15px rgba(0,0,0,0.9)`  |
| `--shadow-xl` | Extra large shadow | `0 20px 25px rgba(0,0,0,0.1)` | `0 20px 25px rgba(0,0,0,0.95)` |

## Brand Tokens

### Gradients

| Variable                 | Purpose                  | Example                                                                           |
| ------------------------ | ------------------------ | --------------------------------------------------------------------------------- |
| `--brand-gradient-start` | Gradient start color     | `#007aff`                                                                         |
| `--brand-gradient-end`   | Gradient end color       | `#5856d6`                                                                         |
| `--brand-gradient`       | Full gradient definition | `linear-gradient(135deg, var(--brand-gradient-start), var(--brand-gradient-end))` |

### Card Effects

| Variable                  | Purpose               |
| ------------------------- | --------------------- |
| `--card-gradient-overlay` | Card gradient overlay |
| `--card-glow`             | Card glow effect      |

## FX (Effects) Tokens

### Hover Transforms

| Variable               | Purpose              | Default                        |
| ---------------------- | -------------------- | ------------------------------ |
| `--fx-hover-transform` | Hover transformation | `translateY(-2px)`             |
| `--fx-hover-glow`      | Hover glow effect    | `0 8px 24px rgba(accent, 0.3)` |
| `--fx-hover-shadow`    | Hover shadow         | `0 8px 32px rgba(accent, 0.2)` |
| `--fx-hover-duration`  | Animation duration   | `300ms`                        |
| `--fx-hover-easing`    | Animation easing     | `ease-out`                     |

### Ambient Animations

| Variable             | Purpose            | Default                                 |
| -------------------- | ------------------ | --------------------------------------- |
| `--fx-ambient-float` | Floating animation | `magical-float 4s ease-in-out infinite` |
| `--fx-ambient-pulse` | Pulse animation    | `magical-pulse 2s ease-in-out infinite` |
| `--fx-ambient-glow`  | Ambient glow       | `0 0 40px rgba(accent, 0.15)`           |

### Transition Tokens

| Variable            | Purpose          | Default                        |
| ------------------- | ---------------- | ------------------------------ |
| `--transition-fast` | Fast transitions | `150ms`                        |
| `--transition-base` | Base transitions | `200ms`                        |
| `--transition-slow` | Slow transitions | `300ms`                        |
| `--easing-smooth`   | Smooth easing    | `cubic-bezier(0.4, 0, 0.2, 1)` |

## Feature Flags

Enable/disable effects (0 = off, 1 = on):

| Variable                | Purpose                 | Default |
| ----------------------- | ----------------------- | ------- |
| `--enable-card-float`   | Floating card animation | `0`     |
| `--enable-magical-glow` | Magical glow effects    | `0`     |
| `--enable-sparkles`     | Sparkle effects         | `0`     |
| `--enable-transitions`  | CSS transitions         | `1`     |

## Typography Tokens

| Variable      | Purpose               | Default                                |
| ------------- | --------------------- | -------------------------------------- |
| `--font-sans` | Sans-serif font stack | `system-ui, -apple-system, sans-serif` |
| `--font-mono` | Monospace font stack  | `'SF Mono', Monaco, monospace`         |
| `--text-xs`   | Extra small text      | `0.75rem`                              |
| `--text-sm`   | Small text            | `0.875rem`                             |
| `--text-base` | Base text size        | `1rem`                                 |
| `--text-lg`   | Large text            | `1.125rem`                             |
| `--text-xl`   | Extra large text      | `1.25rem`                              |

## Spacing Tokens

| Variable    | Purpose | Value     |
| ----------- | ------- | --------- |
| `--space-1` | 4px     | `0.25rem` |
| `--space-2` | 8px     | `0.5rem`  |
| `--space-3` | 12px    | `0.75rem` |
| `--space-4` | 16px    | `1rem`    |
| `--space-6` | 24px    | `1.5rem`  |
| `--space-8` | 32px    | `2rem`    |

## Border Radius Tokens

| Variable        | Purpose            | Value      |
| --------------- | ------------------ | ---------- |
| `--radius-sm`   | Small radius       | `0.25rem`  |
| `--radius-md`   | Medium radius      | `0.375rem` |
| `--radius-lg`   | Large radius       | `0.5rem`   |
| `--radius-xl`   | Extra large radius | `0.75rem`  |
| `--radius-full` | Full circle        | `9999px`   |

## Migrating from Plain CSS

Replace hard-coded colors with design tokens for automatic theme switching:

**Before (Plain CSS):**

```css
.card {
    background: #ffffff;
    color: #000000;
    border: 1px solid #e5e5e5;
}

.button {
    background: #3b82f6;
    color: white;
}
```

**After (Design Tokens):**

```css
.card {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
}

.button {
    background: var(--accent-primary);
    color: white;
}
```

**Benefits:**

- Automatic dark mode support
- Theme switching works instantly
- Consistent colors across app
- Easier maintenance (change once, update everywhere)

## Using Design Tokens

### In Custom Schemes

Override tokens in your scheme CSS:

```css
/* src/styles/themes/ocean.css */
html.scheme-ocean {
    /* Colors */
    --accent-primary: #0066cc;
    --accent-glow: #00ccff;
    --accent-secondary: #0088ee;

    /* Brand gradient */
    --brand-gradient-start: #0066cc;
    --brand-gradient-end: #00ccff;
    --brand-gradient: linear-gradient(
        135deg,
        var(--brand-gradient-start),
        var(--brand-gradient-end)
    );

    /* Hover effects */
    --fx-hover-glow: 0 20px 40px rgba(0, 102, 204, 0.3);
}

/* Dark mode overrides */
html.theme-dark.scheme-ocean,
html.theme-system-dark.scheme-ocean {
    --bg-primary: #001a33;
    --bg-secondary: #002244;
    --text-primary: #e0f2ff;
}
```

### In Component Styles

Reference tokens in your components:

```svelte
<style>
    .card {
        background: var(--bg-card);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        padding: var(--space-4);
        transition: transform var(--transition-base) var(--easing-smooth);
    }

    .card:hover {
        transform: var(--fx-hover-transform);
        box-shadow: var(--fx-hover-shadow);
    }

    .button {
        background: var(--accent-primary);
        color: white;
        padding: var(--space-3) var(--space-6);
        border-radius: var(--radius-md);
        font-size: var(--text-base);
    }

    .button:hover {
        background: var(--accent-secondary);
    }

    .button:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
    }
</style>
```

### Semantic Color Usage

Use semantic tokens for maintainable code:

```css
/* ✅ Good: Semantic tokens */
.hero {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
}

/* ❌ Avoid: Hard-coded colors */
.hero {
    background: #ffffff;
    color: #000000;
    border: 1px solid #e5e5e5;
}
```

## Token Naming Convention

Token names follow a consistent pattern:

```
--{category}-{property}-{variant?}
```

**Examples:**

- `--text-primary` - Category: text, Property: primary
- `--bg-secondary` - Category: bg, Property: secondary
- `--color-primary-500` - Category: color, Property: primary, Variant: 500
- `--fx-hover-transform` - Category: fx, Property: hover-transform

## Accessibility

### Color Contrast

Ensure sufficient contrast ratios:

- **Text on background**: 4.5:1 minimum (WCAG AA)
- **Large text**: 3:1 minimum
- **Interactive elements**: Clear focus indicators

### Testing Contrast

```javascript
// Test contrast in browser console
const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
const text = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');

// Use WebAIM Contrast Checker or similar tool
```

### Reduced Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
    html {
        --fx-hover-transform: none;
        --fx-ambient-float: none;
        --fx-ambient-pulse: none;
        --transition-fast: 0ms;
        --transition-base: 0ms;
        --transition-slow: 0ms;
    }
}
```

## Best Practices

1. **Use semantic tokens** - Prefer `--text-primary` over `--color-gray-900`
2. **Override at scheme level** - Keep changes scoped to `.scheme-{name}`
3. **Maintain contrast** - Test both light and dark modes
4. **Consistent spacing** - Use spacing tokens, not arbitrary values
5. **Respect motion preferences** - Disable animations when requested
6. **Test across browsers** - CSS custom properties work in all modern browsers

## Token Organization

Organize tokens by category in your custom scheme:

```css
html.scheme-custom {
    /* ========================================
   * COLOR PALETTE
   * ======================================== */
    --accent-primary: #custom;
    --bg-primary: #custom;
    --text-primary: #custom;

    /* ========================================
   * INTERACTIVE STATES
   * ======================================== */
    --hover-overlay: rgba(custom, 0.1);
    --focus-ring: 0 0 0 2px var(--accent-primary);

    /* ========================================
   * EFFECTS
   * ======================================== */
    --fx-hover-transform: translateY(-4px);
    --fx-hover-duration: 400ms;

    /* ========================================
   * FEATURE FLAGS
   * ======================================== */
    --enable-card-float: 1;
    --enable-magical-glow: 0;
}
```

## See Also

**Ready to create custom themes?**

- [Custom Themes Guide](./custom-themes.md) - Apply these tokens in your own color schemes
- [Best Practices](./best-practices.md) - Color contrast and accessibility

---

[Changelog](../CHANGELOG.md) | [Documentation Home](./README.md)
