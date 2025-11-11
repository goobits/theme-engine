# Components

Complete reference for @goobits/themes Svelte components.

## ThemeProvider

Root component that manages theme state and provides theme context to child components.

### Basic Usage

```svelte
<script>
  import { ThemeProvider } from '@goobits/themes/svelte';
  import { themeConfig } from '$lib/config/theme';

  const { data, children } = $props();
</script>

<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>
  {@render children?.()}
</ThemeProvider>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `ThemeConfig` | Yes | Theme configuration with available schemes |
| `serverPreferences` | `ServerPreferences` | No | Initial preferences from server (for SSR) |
| `children` | `Snippet` | Yes | Child content to render |

### ServerPreferences Type

```typescript
interface ServerPreferences {
  theme: ThemeMode;       // 'light' | 'dark' | 'system'
  themeScheme: string;    // Current color scheme
}
```

### Example with SSR

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { ThemeProvider } from '@goobits/themes/svelte';
  import { themeConfig } from '$lib/config/theme';
  import '@goobits/themes/themes/default.css';

  const { data, children } = $props();
</script>

<ThemeProvider
  config={themeConfig}
  serverPreferences={data.preferences}
>
  <nav><!-- Navigation --></nav>
  <main>{@render children?.()}</main>
</ThemeProvider>
```

### Behavior

- Initializes theme store with server preferences (if provided)
- Watches system theme changes when mode is 'system'
- Applies theme classes to `<html>` element
- Persists theme changes to cookies and localStorage
- Provides theme context to all child components

---

## ThemeToggle

Button component that cycles through theme modes: light → dark → system.

### Basic Usage

```svelte
<script>
  import { ThemeToggle } from '@goobits/themes/svelte';
</script>

<ThemeToggle />
```

### Behavior

- Displays current theme mode with icon
- Click to cycle: light → dark → system
- Shows visual feedback on hover/active states
- Uses semantic HTML (`<button>`) for accessibility
- Keyboard accessible (Space/Enter to toggle)

### Styling

The component uses CSS variables for styling:

```css
/* Customize in your global CSS */
.theme-toggle {
  --toggle-bg: var(--bg-secondary);
  --toggle-color: var(--text-primary);
  --toggle-hover: var(--hover-overlay);
}
```

### Custom Theme Toggle

Build your own toggle with `useTheme()`:

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
  const mode = $derived(theme.theme);

  const icons = {
    light: '☀️',
    dark: '🌙',
    system: '💻'
  };
</script>

<button onclick={() => theme.cycleMode()}>
  {icons[mode]} {mode}
</button>
```

---

## SchemeSelector

Dropdown component for selecting color schemes.

### Basic Usage

```svelte
<script>
  import { SchemeSelector } from '@goobits/themes/svelte';
</script>

<SchemeSelector />
```

### Behavior

- Displays all available schemes from config
- Shows scheme name and optional icon
- Updates theme when selection changes
- Uses semantic HTML (`<select>`) for accessibility
- Keyboard accessible (Arrow keys to navigate)

### Styling

The component uses CSS variables:

```css
/* Customize in your global CSS */
.scheme-selector {
  --selector-bg: var(--bg-secondary);
  --selector-color: var(--text-primary);
  --selector-border: var(--border-primary);
}
```

### Custom Scheme Selector

Build a custom selector with `useTheme()`:

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
  const currentScheme = $derived(theme.scheme);
  const schemes = $derived(theme.availableSchemes);
</script>

<select
  value={currentScheme}
  onchange={(e) => theme.setScheme(e.target.value)}
>
  {#each schemes as scheme}
    <option value={scheme.name}>
      {scheme.icon || ''} {scheme.displayName}
    </option>
  {/each}
</select>
```

---

## useTheme Hook

Access theme store from any component within ThemeProvider.

### Basic Usage

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
</script>

<p>Current mode: {theme.theme}</p>
<p>Current scheme: {theme.scheme}</p>
```

### Reactive Values

Use Svelte 5's `$derived` for reactive computations:

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();

  // Reactive values
  const isDark = $derived(theme.theme === 'dark');
  const isSystem = $derived(theme.theme === 'system');
  const schemeName = $derived(
    theme.availableSchemes.find(s => s.name === theme.scheme)?.displayName
  );
</script>

{#if isDark}
  <p>Dark mode is active</p>
{/if}

<p>Current scheme: {schemeName}</p>
```

### Theme Store Methods

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();

  function toggleDark() {
    theme.setTheme(theme.theme === 'dark' ? 'light' : 'dark');
  }

  function cycleTheme() {
    theme.cycleMode(); // light → dark → system
  }

  function switchScheme(scheme: string) {
    theme.setScheme(scheme);
  }
</script>

<button onclick={toggleDark}>Toggle Dark Mode</button>
<button onclick={cycleTheme}>Cycle Theme</button>
<button onclick={() => switchScheme('spells')}>Use Spells Theme</button>
```

### Available Properties

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `ThemeMode` | Current theme mode ('light', 'dark', 'system') |
| `scheme` | `ThemeScheme` | Current color scheme name |
| `settings` | `ThemeSettings` | Full settings object |
| `availableSchemes` | `SchemeConfig[]` | All available schemes from config |

### Available Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `setTheme(mode)` | `ThemeMode` | Set theme mode |
| `setScheme(scheme)` | `ThemeScheme` | Set color scheme |
| `cycleMode()` | None | Cycle through modes |

---

## Custom Component Examples

### Compact Theme Switcher

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
  const mode = $derived(theme.theme);
  const scheme = $derived(theme.scheme);
</script>

<div class="theme-switcher">
  <button
    onclick={() => theme.setTheme('light')}
    class:active={mode === 'light'}
  >
    ☀️
  </button>
  <button
    onclick={() => theme.setTheme('dark')}
    class:active={mode === 'dark'}
  >
    🌙
  </button>
  <button
    onclick={() => theme.setTheme('system')}
    class:active={mode === 'system'}
  >
    💻
  </button>
</div>

<style>
  .theme-switcher {
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem;
    border: 1px solid var(--border-primary);
    background: var(--bg-secondary);
    border-radius: 0.375rem;
    cursor: pointer;
  }

  button.active {
    background: var(--accent-primary);
    color: white;
  }
</style>
```

### Visual Scheme Picker

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
  const currentScheme = $derived(theme.scheme);
  const schemes = $derived(theme.availableSchemes);
</script>

<div class="scheme-picker">
  {#each schemes as scheme}
    <button
      class="scheme-card"
      class:active={currentScheme === scheme.name}
      onclick={() => theme.setScheme(scheme.name)}
    >
      <div class="preview">
        <span style="background: {scheme.preview.primary}"></span>
        <span style="background: {scheme.preview.accent}"></span>
        <span style="background: {scheme.preview.background}"></span>
      </div>
      <div class="info">
        <span class="icon">{scheme.icon}</span>
        <span class="name">{scheme.displayName}</span>
      </div>
    </button>
  {/each}
</div>

<style>
  .scheme-picker {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .scheme-card {
    padding: 1rem;
    border: 2px solid var(--border-primary);
    border-radius: 0.5rem;
    background: var(--bg-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .scheme-card:hover {
    transform: translateY(-2px);
    border-color: var(--accent-primary);
  }

  .scheme-card.active {
    border-color: var(--accent-primary);
    background: var(--accent-primary);
    color: white;
  }

  .preview {
    display: flex;
    gap: 4px;
    margin-bottom: 0.5rem;
  }

  .preview span {
    flex: 1;
    height: 24px;
    border-radius: 4px;
  }

  .info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon {
    font-size: 1.25rem;
  }
</style>
```

### Theme Settings Panel

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
  const mode = $derived(theme.theme);
  const scheme = $derived(theme.scheme);
  const schemes = $derived(theme.availableSchemes);
</script>

<div class="settings-panel">
  <section>
    <h3>Theme Mode</h3>
    <div class="radio-group">
      <label>
        <input
          type="radio"
          value="light"
          checked={mode === 'light'}
          onchange={() => theme.setTheme('light')}
        />
        ☀️ Light
      </label>
      <label>
        <input
          type="radio"
          value="dark"
          checked={mode === 'dark'}
          onchange={() => theme.setTheme('dark')}
        />
        🌙 Dark
      </label>
      <label>
        <input
          type="radio"
          value="system"
          checked={mode === 'system'}
          onchange={() => theme.setTheme('system')}
        />
        💻 System
      </label>
    </div>
  </section>

  <section>
    <h3>Color Scheme</h3>
    <div class="scheme-list">
      {#each schemes as s}
        <button
          class="scheme-option"
          class:active={scheme === s.name}
          onclick={() => theme.setScheme(s.name)}
        >
          <span class="icon">{s.icon}</span>
          <div class="details">
            <strong>{s.displayName}</strong>
            <small>{s.description}</small>
          </div>
        </button>
      {/each}
    </div>
  </section>
</div>
```

## Accessibility

All built-in components follow accessibility best practices:

- **Semantic HTML** - Use proper elements (`<button>`, `<select>`)
- **Keyboard Navigation** - Full keyboard support
- **Focus Indicators** - Visible focus rings
- **ARIA Labels** - Screen reader friendly
- **Color Contrast** - Meets WCAG AA standards

### Adding Screen Reader Support

```svelte
<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();
  const mode = $derived(theme.theme);
</script>

<button
  onclick={() => theme.cycleMode()}
  aria-label="Toggle theme mode. Current mode: {mode}"
>
  {mode === 'dark' ? '🌙' : '☀️'}
  <span class="sr-only">Current theme: {mode}</span>
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

---

📋 [Changelog](../CHANGELOG.md) | 🏠 [Documentation Home](./README.md)
