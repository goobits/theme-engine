# Recipes

Quick reference patterns for common tasks with @goobits/themes.

## Quick Navigation

- [Theme Switching](#theme-switching)
- [Route-Based Themes](#route-based-themes)
- [User Preferences](#user-preferences)
- [Custom Components](#custom-components)
- [Styling Patterns](#styling-patterns)
- [Performance](#performance)
- [Migration Patterns](#migration-patterns)

---

## Theme Switching

### Toggle Between Light and Dark

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();
    const mode = $derived(theme.theme);

    function toggle() {
        theme.setTheme(mode === 'dark' ? 'light' : 'dark');
    }
</script>

<button onclick={toggle}>
    {mode === 'dark' ? '☀️' : '🌙'} Toggle Theme
</button>
```

### Theme Selector with Preview Colors

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();
    const schemes = $derived(theme.availableSchemes);
    const current = $derived(theme.scheme);
</script>

<div class="scheme-grid">
    {#each schemes as scheme}
        <button
            class="scheme-card"
            class:active={current === scheme.name}
            onclick={() => theme.setScheme(scheme.name)}
        >
            <div class="preview" style="background: {scheme.preview.primary}"></div>
            <span>{scheme.displayName}</span>
        </button>
    {/each}
</div>

<style>
    .scheme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
    }

    .scheme-card {
        padding: 0.75rem;
        border: 2px solid var(--border-primary);
        border-radius: 0.5rem;
        background: var(--bg-secondary);
        cursor: pointer;
    }

    .scheme-card.active {
        border-color: var(--accent-primary);
    }

    .preview {
        width: 100%;
        height: 60px;
        border-radius: 0.25rem;
        margin-bottom: 0.5rem;
    }
</style>
```

### Animated Theme Transitions

```css
/* Add to global CSS */
html {
    transition:
        background-color 300ms,
        color 300ms;
}

html.theme-switching,
html.theme-switching * {
    transition: none !important;
}
```

```typescript
// In theme switching logic
function smoothThemeChange(newTheme: ThemeMode) {
    document.documentElement.classList.add('theme-switching');
    theme.setTheme(newTheme);

    setTimeout(() => {
        document.documentElement.classList.remove('theme-switching');
    }, 50);
}
```

---

## Route-Based Themes

### Force Dark Theme for Admin Routes

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
            description: 'Admin uses dark theme',
        },
        '/admin/*': {
            theme: { base: 'dark', scheme: 'default' },
            override: true,
        },
    },
};
```

### Suggest Theme for Marketing Pages

```typescript
// Suggest without overriding user preference
routeThemes: {
  '/landing': {
    theme: { base: 'light', scheme: 'default' },
    override: false, // Suggestion only
    description: 'Marketing pages suggest light theme'
  }
}
```

### Dynamic Route Theme Based on Content

```typescript
// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
    const post = await getPost(params.slug);

    // Set theme based on post metadata
    if (post.prefersDarkMode) {
        cookies.set('theme', 'dark', { path: '/' });
    }

    return { post };
};
```

---

## User Preferences

### Persist to Database

```typescript
// src/routes/api/preferences/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    const { theme, themeScheme } = await request.json();

    await db.userPreferences.update({
        where: { userId: locals.user.id },
        data: { theme, themeScheme },
    });

    return json({ success: true });
};
```

```svelte
<!-- In component -->
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();

    async function savePreferences() {
        await fetch('/api/preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                theme: theme.theme,
                themeScheme: theme.scheme,
            }),
        });
    }

    // Save whenever theme changes
    $effect(() => {
        savePreferences();
    });
</script>
```

### Load from User Profile

```typescript
// src/routes/+layout.server.ts
import { loadThemePreferences } from '@goobits/themes/server';

export async function load({ cookies, locals }) {
    // Try database first, fallback to cookies
    const userPrefs = locals.user
        ? await db.userPreferences.findUnique({
              where: { userId: locals.user.id },
          })
        : null;

    const preferences = userPrefs || loadThemePreferences(cookies, themeConfig);

    return { preferences };
}
```

---

## Custom Components

### Theme-Aware Card

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();
    const isDark = $derived(theme.theme === 'dark');
</script>

<div class="card" class:dark={isDark}>
    <slot />
</div>

<style>
    .card {
        background: var(--bg-card);
        border: 1px solid var(--border-primary);
        border-radius: 0.5rem;
        padding: 1.5rem;
    }

    .card.dark {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }
</style>
```

### Conditional Content by Theme

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    const theme = useTheme();
    const mode = $derived(theme.theme);
</script>

{#if mode === 'dark'}
    <img src="/logo-light.svg" alt="Logo" />
{:else}
    <img src="/logo-dark.svg" alt="Logo" />
{/if}
```

### Theme Picker Modal

```svelte
<script>
    import { useTheme } from '@goobits/themes/svelte';

    let open = $state(false);
    const theme = useTheme();
    const schemes = $derived(theme.availableSchemes);
</script>

<button onclick={() => (open = true)}>Customize Theme</button>

{#if open}
    <div class="modal-backdrop" onclick={() => (open = false)}>
        <div class="modal" onclick={e => e.stopPropagation()}>
            <h2>Choose Your Theme</h2>

            <div class="mode-selector">
                <button
                    class:active={theme.theme === 'light'}
                    onclick={() => theme.setTheme('light')}
                >
                    ☀️ Light
                </button>
                <button
                    class:active={theme.theme === 'dark'}
                    onclick={() => theme.setTheme('dark')}
                >
                    🌙 Dark
                </button>
                <button
                    class:active={theme.theme === 'system'}
                    onclick={() => theme.setTheme('system')}
                >
                    💻 System
                </button>
            </div>

            <div class="scheme-selector">
                {#each schemes as scheme}
                    <button
                        class="scheme-option"
                        class:active={theme.scheme === scheme.name}
                        onclick={() => theme.setScheme(scheme.name)}
                    >
                        <div class="color-preview">
                            <span style="background: {scheme.preview.primary}"></span>
                            <span style="background: {scheme.preview.accent}"></span>
                        </div>
                        {scheme.icon}
                        {scheme.displayName}
                    </button>
                {/each}
            </div>

            <button onclick={() => (open = false)}>Done</button>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal {
        background: var(--bg-primary);
        padding: 2rem;
        border-radius: 1rem;
        max-width: 500px;
        width: 90%;
    }

    .mode-selector {
        display: flex;
        gap: 0.5rem;
        margin: 1rem 0;
    }

    .mode-selector button {
        flex: 1;
        padding: 0.75rem;
        border: 2px solid var(--border-primary);
        background: var(--bg-secondary);
        border-radius: 0.5rem;
    }

    .mode-selector button.active {
        border-color: var(--accent-primary);
        background: var(--accent-primary);
        color: white;
    }

    .scheme-selector {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 1rem 0;
    }

    .scheme-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border: 2px solid var(--border-primary);
        background: var(--bg-secondary);
        border-radius: 0.5rem;
        text-align: left;
    }

    .scheme-option.active {
        border-color: var(--accent-primary);
    }

    .color-preview {
        display: flex;
        gap: 4px;
    }

    .color-preview span {
        width: 24px;
        height: 24px;
        border-radius: 4px;
    }
</style>
```

---

## Styling Patterns

### Responsive Theme Variables

```css
/* Adjust design tokens for mobile */
@media (max-width: 768px) {
    html {
        --text-base: 14px;
        --spacing-unit: 0.75rem;
        --border-radius: 0.375rem;
    }
}
```

### Theme-Specific Animations

```css
html.scheme-spells {
    --glow-animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
    0%,
    100% {
        filter: brightness(1);
    }
    50% {
        filter: brightness(1.2);
    }
}

.card {
    animation: var(--glow-animation, none);
}
```

### Print-Friendly Theme Override

```css
@media print {
    html {
        --bg-primary: white !important;
        --text-primary: black !important;
        --border-primary: #ccc !important;
    }
}
```

---

## Performance

### Lazy Load Theme CSS

```svelte
<script>
    import { onMount } from 'svelte';

    onMount(async () => {
        const { theme } = useTheme();

        if (theme === 'spells') {
            await import('@goobits/themes/themes/spells.css');
        }
    });
</script>
```

### Preload Theme Assets

```html
<!-- src/app.html -->
<head>
    <link rel="preload" href="/themes/default.css" as="style" />
    <link rel="preload" href="/themes/spells.css" as="style" />
</head>
```

### Minimize Theme Switching Cost

```typescript
// Cache theme calculations
const themeCache = new Map();

function getThemeStyles(mode: ThemeMode, scheme: ThemeScheme) {
    const key = `${mode}-${scheme}`;

    if (!themeCache.has(key)) {
        themeCache.set(key, computeThemeStyles(mode, scheme));
    }

    return themeCache.get(key);
}
```

---

## Migration Patterns

### From Other Theme Libraries

When migrating from other theme libraries, follow these patterns:

**Replace context-based theming:**

```svelte
<!-- Before: Custom context -->
<script>
    import { getContext } from 'svelte';
    const theme = getContext('theme');
</script>

<!-- After: @goobits/themes -->
<script>
    import { useTheme } from '@goobits/themes/svelte';
    const theme = useTheme();
</script>
```

**Replace manual class toggling:**

```svelte
<!-- Before: Manual DOM manipulation -->
<script>
    function toggleDark() {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', 'dark');
    }
</script>

<!-- After: Theme store -->
<script>
    import { useTheme } from '@goobits/themes/svelte';
    const theme = useTheme();
</script>

<button onclick={() => theme.cycleMode()}>Toggle</button>
```

**Replace CSS media queries only:**

```css
/* Before: Media query only (no user preference) */
@media (prefers-color-scheme: dark) {
    :root {
        --bg: #000;
    }
}

/* After: Use CSS classes for user control */
html.theme-dark,
html.theme-system-dark {
    --bg: #000;
}
```

### From svelte-themer

```svelte
<!-- Before: svelte-themer -->
<script>
    import { theme } from 'svelte-themer';
</script>

<!-- After: @goobits/themes -->
<script>
    import { useTheme } from '@goobits/themes/svelte';
    const theme = useTheme();
</script>
```

### From theme-change

```typescript
// Before: theme-change
import { themeChange } from 'theme-change';
themeChange();

// After: @goobits/themes (handled by ThemeProvider)
// Just wrap your app with ThemeProvider - no manual initialization needed
```

---

## See Also

**Related guides:**

- [Custom Themes](./custom-themes.md) - Create your own color schemes
- [Components](./components.md) - Built-in theme components
- [Best Practices](./best-practices.md) - Performance and accessibility

---

[Changelog](../CHANGELOG.md) | [Documentation Home](./README.md)
