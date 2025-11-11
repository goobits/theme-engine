# Custom Themes

Learn how to create custom color schemes for @goobits/themes to match your brand and design requirements.

## Quick Start

Creating a custom theme involves three steps:

1. Create a CSS file with your color overrides
2. Register the scheme in your theme config
3. Import the CSS in your layout

## Included Preset Themes

@goobits/themes includes two ready-to-use color schemes:

| Scheme | Style | Best For |
|--------|-------|----------|
| **default** | Professional design system | Business apps, documentation |
| **spells** | Purple with enhanced animations | Creative apps, gaming |

### Using Preset Themes

```typescript
// Import in your root layout
import '@goobits/themes/themes/default.css';
import '@goobits/themes/themes/spells.css';
```

## Naming Conventions

Before creating custom schemes, understand the naming rules:

**Scheme Names Must:**
- Use lowercase letters only (`ocean`, not `Ocean`)
- Use hyphens for multi-word names (`ocean-blue`, not `ocean_blue` or `oceanBlue`)
- Start with a letter (`blue-ocean`, not `2-ocean`)
- Only contain alphanumeric characters and hyphens (`theme-2024` ✓, `theme@2024` ✗)

**Avoid Reserved Names:**
- `light`, `dark`, `system`, `auto` (used internally)

**Why These Rules?**

Scheme names become CSS classes (`.scheme-ocean`) and must follow CSS identifier rules. Invalid names cause CSS parsing errors and won't apply.

**Examples:**
- ✅ Good: `ocean`, `forest-green`, `sunset-2024`
- ❌ Bad: `Ocean`, `forest_green`, `2-sunset`, `theme@work`

## Creating a Custom Scheme

### Step 1: Create CSS File

Create a new CSS file for your scheme:

```css
/* src/styles/themes/ocean.css */

html.scheme-ocean {
  /* ========================================
   * LIGHT MODE COLORS
   * ======================================== */

  /* Primary color palette */
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

  /* Color scale */
  --color-primary-400: #3399ff;
  --color-primary-500: #0066cc;
  --color-primary-600: #0055aa;
  --color-primary-700: #004488;

  /* Backgrounds */
  --bg-card: #f0f9ff;

  /* Interactive states */
  --border-primary: rgba(0, 102, 204, 0.2);
  --hover-overlay: rgba(0, 102, 204, 0.05);
  --active-overlay: rgba(0, 102, 204, 0.1);

  /* Effects */
  --fx-hover-transform: translateY(-2px);
  --fx-hover-shadow: 0 8px 24px rgba(0, 102, 204, 0.2);
  --fx-hover-duration: 300ms;
  --fx-hover-easing: ease-out;

  /* Feature flags */
  --enable-card-float: 0;
  --enable-magical-glow: 0;
}

/* ========================================
 * DARK MODE OVERRIDES
 * ======================================== */

html.theme-dark.scheme-ocean,
html.theme-system-dark.scheme-ocean {
  /* Dark backgrounds */
  --bg-primary: #001a33;
  --bg-secondary: #002244;
  --bg-tertiary: #003366;
  --color-background: var(--bg-primary);
  --color-surface: var(--bg-tertiary);

  /* Dark mode text */
  --text-primary: #e0f2ff;
  --text-secondary: #99ccff;
  --text-tertiary: #6699cc;

  /* Enhanced borders for dark mode */
  --border-primary: rgba(0, 204, 255, 0.3);
  --hover-overlay: rgba(0, 204, 255, 0.1);

  /* Glowing effects for dark mode */
  --fx-hover-glow: 0 20px 40px rgba(0, 204, 255, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.9),
               0 4px 6px -2px rgba(0, 204, 255, 0.3);
}
```

### Step 2: Register in Config

Add your scheme to the theme configuration:

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
    },
    ocean: {
      name: 'ocean',
      displayName: 'Ocean',
      description: 'Cool blue tones inspired by the sea',
      icon: '🌊',
      title: 'Ocean Library',
      preview: {
        primary: '#0066cc',
        accent: '#00ccff',
        background: '#f0f9ff'
      }
    }
  }
};
```

### Step 3: Import CSS

Import your theme CSS in the root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import '../styles/themes/ocean.css';
  import { ThemeProvider } from '@goobits/themes/svelte';
  import { themeConfig } from '$lib/config/theme';

  const { data, children } = $props();
</script>

<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>
  {@render children?.()}
</ThemeProvider>
```

## Theme Structure

### CSS Class Naming

Theme CSS uses two types of classes:

**Mode classes** (on `<html>` element):
- `.theme-light` - Light mode
- `.theme-dark` - Dark mode
- `.theme-system` - System preference mode
- `.theme-system-light` - System resolved to light
- `.theme-system-dark` - System resolved to dark

**Scheme classes** (on `<html>` element):
- `.scheme-{name}` - Your scheme name

### CSS Selector Pattern

```css
/* Light mode (base) */
html.scheme-{name} {
  /* Light mode colors */
}

/* Dark mode */
html.theme-dark.scheme-{name},
html.theme-system-dark.scheme-{name} {
  /* Dark mode colors */
}

/* System light mode (optional) */
html.theme-system-light.scheme-{name} {
  /* System light overrides */
}
```

## CSS Variables Reference

### Essential Variables to Override

At minimum, override these variables for a cohesive theme:

```css
html.scheme-{name} {
  /* Accent colors */
  --accent-primary: #your-primary;
  --accent-glow: #your-highlight;
  --accent-secondary: #your-secondary;

  /* Backgrounds (for light mode) */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f7;
  --bg-card: #ffffff;

  /* Text (for light mode) */
  --text-primary: #1d1d1f;
  --text-secondary: #6e6e73;

  /* Borders */
  --border-primary: rgba(your-color, 0.2);
}

/* Dark mode essentials */
html.theme-dark.scheme-{name} {
  --bg-primary: #0a0a0f;
  --bg-secondary: #13131f;
  --text-primary: #e0e0ff;
  --text-secondary: #9090b0;
}
```

### Complete Variable List

See [Design Tokens](./design-tokens.md) for the full list of available CSS variables.

## Advanced Customization

### Custom Animations

Add custom keyframe animations:

```css
/* Custom animation for your scheme */
@keyframes ocean-wave {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.02);
  }
}

html.scheme-ocean .floating {
  animation: ocean-wave 3s ease-in-out infinite;
}
```

### Scheme-Specific Component Styling

Target specific schemes for custom component styles:

```css
/* Special button style for ocean theme */
html.scheme-ocean .primary-button {
  background: var(--brand-gradient);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

html.scheme-ocean .primary-button:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 102, 204, 0.4);
}
```

### Conditional Effects

Enable special effects for your scheme:

```css
html.scheme-ocean {
  /* Enable floating animation */
  --enable-card-float: 1;

  /* Custom float animation */
  --fx-ambient-float: ocean-wave 3s ease-in-out infinite;

  /* Enhanced glow effects */
  --enable-magical-glow: 1;
  --fx-ambient-glow: 0 0 60px rgba(0, 204, 255, 0.2);
}
```

## Best Practices

### 1. Light and Dark Mode Support

Always define both modes for a complete experience:

```css
/* ✅ Good: Both modes defined */
html.scheme-custom {
  --bg-primary: #ffffff;
  --text-primary: #000000;
}

html.theme-dark.scheme-custom {
  --bg-primary: #0a0a0a;
  --text-primary: #ffffff;
}

/* ❌ Avoid: Only one mode */
html.scheme-custom {
  --bg-primary: #ffffff; /* What about dark mode? */
}
```

### 2. Maintain Accessibility

Ensure color contrast meets WCAG standards:

- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text**: 3:1 contrast ratio minimum
- **Interactive elements**: Clear focus indicators

Test contrast at [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

### 3. Use Color Scales

Generate consistent color scales using tools:

- [Palettte.app](https://palettte.app) - AI-powered palette generator
- [Coolors.co](https://coolors.co) - Color scheme generator
- [Leonardo](https://leonardocolor.io) - Adaptive color palettes

### 4. Test Both Themes

Test your scheme with all theme modes:

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
</script>

<!-- Test controls -->
<button onclick={() => theme.setTheme('light')}>Light</button>
<button onclick={() => theme.setTheme('dark')}>Dark</button>
<button onclick={() => theme.setScheme('ocean')}>Ocean</button>
```

### 5. Respect User Preferences

Disable animations for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  html.scheme-ocean {
    --fx-ambient-float: none;
    --fx-ambient-pulse: none;
    --fx-hover-transform: none;
    --transition-fast: 0ms;
    --transition-base: 0ms;
  }
}
```

## Example Themes

### Forest Theme

Natural green tones:

```css
html.scheme-forest {
  --accent-primary: #059669;
  --accent-glow: #10b981;
  --accent-secondary: #047857;

  --brand-gradient-start: #059669;
  --brand-gradient-end: #10b981;
  --brand-gradient: linear-gradient(135deg, var(--brand-gradient-start), var(--brand-gradient-end));

  --bg-card: #f0fdf4;
  --border-primary: rgba(5, 150, 105, 0.2);
}

html.theme-dark.scheme-forest {
  --bg-primary: #022c22;
  --bg-secondary: #064e3b;
  --text-primary: #d1fae5;
  --border-primary: rgba(16, 185, 129, 0.3);
}
```

### Sunset Theme

Warm orange and pink:

```css
html.scheme-sunset {
  --accent-primary: #f59e0b;
  --accent-glow: #fb923c;
  --accent-secondary: #ec4899;

  --brand-gradient-start: #f59e0b;
  --brand-gradient-end: #ec4899;
  --brand-gradient: linear-gradient(135deg, var(--brand-gradient-start), var(--brand-gradient-end));

  --bg-card: #fff7ed;
  --border-primary: rgba(245, 158, 11, 0.2);
}

html.theme-dark.scheme-sunset {
  --bg-primary: #1c0f0a;
  --bg-secondary: #2d1810;
  --text-primary: #fed7aa;
  --border-primary: rgba(251, 146, 60, 0.3);
}
```

### Minimal Theme

Clean black and white:

```css
html.scheme-minimal {
  --accent-primary: #000000;
  --accent-glow: #333333;
  --accent-secondary: #666666;

  --brand-gradient-start: #000000;
  --brand-gradient-end: #333333;

  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #000000;
  --text-secondary: #666666;
  --border-primary: rgba(0, 0, 0, 0.1);

  /* No fancy effects */
  --enable-card-float: 0;
  --enable-magical-glow: 0;
  --fx-hover-transform: none;
}

html.theme-dark.scheme-minimal {
  --bg-primary: #000000;
  --bg-secondary: #0a0a0a;
  --text-primary: #ffffff;
  --text-secondary: #999999;
  --border-primary: rgba(255, 255, 255, 0.1);
}
```

## Testing Your Theme

### Visual Inspection

1. Apply theme in your app
2. Navigate through all pages
3. Test light and dark modes
4. Verify hover states and interactions
5. Check focus indicators
6. Test on different screen sizes

### Browser DevTools

Inspect applied CSS variables:

```javascript
// In browser console
const html = document.documentElement;
const computed = getComputedStyle(html);

// Check specific variable
console.log(computed.getPropertyValue('--accent-primary'));

// Check all theme classes
console.log(Array.from(html.classList));
```

### Accessibility Testing

Test color contrast:

```javascript
// Get background and text colors
const bg = getComputedStyle(document.body).backgroundColor;
const color = getComputedStyle(document.body).color;

// Use browser extension or online tool to check contrast ratio
// Should be at least 4.5:1 for normal text
```

## Common Issues

### Theme Not Applying

**Check these:**
1. CSS file imported in layout
2. Scheme name matches config
3. CSS selector uses correct class (`.scheme-{name}`)
4. File path is correct

### Colors Look Wrong

**Common causes:**
1. Missing dark mode overrides
2. Forgot to override brand gradient
3. Inheritance from parent styles
4. CSS specificity issues

**Fix:** Use browser devtools to inspect computed values.

### Animations Not Working

**Check:**
1. Feature flags enabled (`--enable-*`)
2. No `prefers-reduced-motion` override
3. Animation properties defined
4. Keyframes declared

## Tips and Tricks

### Quick Color Testing

Test colors quickly in browser console:

```javascript
document.documentElement.style.setProperty('--accent-primary', '#ff0000');
```

### Gradient Generators

Use online tools to generate gradients:
- [CSS Gradient](https://cssgradient.io/)
- [Gradient Hunt](https://gradienthunt.com/)

### Color Palette Tools

Generate harmonious palettes:
- [Adobe Color](https://color.adobe.com/)
- [Coolors](https://coolors.co/)
- [Palettte](https://palettte.app/)

### Theme Preview Component

Create a preview component to test colors:

```svelte
<script>
  const colors = [
    { name: 'Primary', var: '--accent-primary' },
    { name: 'Glow', var: '--accent-glow' },
    { name: 'Secondary', var: '--accent-secondary' },
    { name: 'Background', var: '--bg-primary' },
    { name: 'Text', var: '--text-primary' }
  ];
</script>

<div class="color-preview">
  {#each colors as { name, var: cssVar }}
    <div class="color-swatch">
      <div class="swatch" style="background: var({cssVar})"></div>
      <span>{name}</span>
      <code>{cssVar}</code>
    </div>
  {/each}
</div>
```

## See Also

**Next steps for custom themes:**
- [Design Tokens](./design-tokens.md) - Complete CSS variable reference
- [Best Practices](./best-practices.md) - Ensure accessible color contrast

---

📋 [Changelog](../CHANGELOG.md) | 🏠 [Documentation Home](./README.md)
