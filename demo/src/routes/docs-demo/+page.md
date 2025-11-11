# Enhanced Documentation Demo

This page demonstrates powerful documentation features using @goobits/docs-engine and @goobits/themes.

## Interactive Theme System

The interactive theme showcase on the home page demonstrates:

- **Real-time theme switching** - Light, dark, and system modes
- **Multiple color schemes** - Default and Spells themes
- **Live preview** - See changes instantly
- **Visual design tokens** - Color swatches show actual CSS variables

## Code Examples

Here's how to use the theme system:

### Basic Setup

```typescript
import { ThemeProvider } from '@goobits/themes/svelte';

const themeConfig = {
  schemes: {
    default: {
      name: 'default',
      displayName: 'Default',
      description: 'Clean, professional design'
    }
  }
};
```

### Using the Theme Hook

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';
  const theme = useTheme();
  const currentMode = $derived(theme.theme);
</script>

<button onclick={() => theme.toggle()}>
  {currentMode === 'light' ? '🌙' : '☀️'} Toggle Theme
</button>
```

## Key Benefits

### Reduced Code Duplication

Instead of showing separate JavaScript and TypeScript examples throughout documentation, we can consolidate them with interactive components.

### Better Visual Hierarchy

Important information stands out with proper styling and visual components rather than plain text.

### Interactive Learning

Users can experiment with live examples rather than copying static code snippets.

### Professional Appearance

Consistent styling and polished components create a premium documentation experience.

## Next Steps

- Explore more examples on the [home page](/)
- Check out the [GitHub repository](https://github.com/goobits/theme-engine)
- Try building your own theme-based application
