<script>
    // Simple tab switching functionality
    import { onMount } from 'svelte';

    onMount(() => {
        document.querySelectorAll('.code-tabs').forEach(tabGroup => {
            const buttons = tabGroup.querySelectorAll('.tab-btn');
            const contents = tabGroup.querySelectorAll('.tab-content');

            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.dataset.tab;

                    // Remove active class from all buttons and contents in this group
                    buttons.forEach(btn => btn.classList.remove('active'));
                    contents.forEach(content => content.classList.remove('active'));

                    // Add active class to clicked button and corresponding content
                    button.classList.add('active');
                    const targetContent = tabGroup.querySelector(
                        `.tab-content[data-tab="${targetTab}"]`
                    );
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                });
            });
        });
    });
</script>

<article>
    <h1>Getting Started</h1>

    <p class="lead">
        Complete guide to installing and configuring @goobits/themes in your SvelteKit application.
    </p>

    <div class="callout note">
        <strong>💡 Enhanced Documentation</strong><br />
        This page demonstrates interactive documentation features. Notice how code examples are organized
        with tabs to reduce duplication!
    </div>

    <h2>Requirements</h2>

    <ul>
        <li><strong>Svelte</strong> 5.0.0 or higher</li>
        <li><strong>SvelteKit</strong> 2.0.0 or higher</li>
        <li><strong>Node.js</strong> 18.0.0 or higher</li>
    </ul>

    <div class="callout warning">
        <strong>⚠️ Important</strong><br />
        This package uses Svelte 5 runes and is not compatible with Svelte 4.
    </div>

    <h2>Installation</h2>

    <p>Choose your package manager:</p>

    <div class="code-tabs">
        <div class="tab-buttons">
            <button class="tab-btn active" data-tab="npm">npm</button>
            <button class="tab-btn" data-tab="pnpm">pnpm</button>
            <button class="tab-btn" data-tab="bun">bun</button>
        </div>
        <div class="tab-content active" data-tab="npm">
            <pre><code class="language-bash">npm install @goobits/themes</code></pre>
        </div>
        <div class="tab-content" data-tab="pnpm">
            <pre><code class="language-bash">pnpm add @goobits/themes</code></pre>
        </div>
        <div class="tab-content" data-tab="bun">
            <pre><code class="language-bash">bun add @goobits/themes</code></pre>
        </div>
    </div>

    <h2>Quick Setup</h2>

    <p>Get themes working in your app in four steps:</p>

    <h3>Step 1: Create Theme Configuration</h3>

    <p>Create a theme config file to define your available schemes:</p>

    <div class="code-tabs">
        <div class="tab-buttons">
            <button class="tab-btn active" data-tab="ts-config">TypeScript</button>
            <button class="tab-btn" data-tab="js-config">JavaScript</button>
        </div>
        <div class="tab-content active" data-tab="ts-config">
            <pre><code class="language-typescript"
                    >{`// src/lib/config/theme.ts
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
    spells: {
      name: 'spells',
      displayName: 'Spells',
      description: 'Magical purple theme',
      preview: {
        primary: '#7c3aed',
        accent: '#a78bfa',
        background: '#0a0a0f'
      }
    }
  }
};`}</code
                ></pre>
        </div>
        <div class="tab-content" data-tab="js-config">
            <pre><code class="language-javascript"
                    >{`// src/lib/config/theme.js

export const themeConfig = {
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
    spells: {
      name: 'spells',
      displayName: 'Spells',
      description: 'Magical purple theme',
      preview: {
        primary: '#7c3aed',
        accent: '#a78bfa',
        background: '#0a0a0f'
      }
    }
  }
};`}</code
                ></pre>
        </div>
    </div>

    <div class="callout tip">
        <strong>💡 Reduced Duplication</strong><br />
        Notice how we show both TypeScript and JavaScript examples in tabs? This reduces documentation
        size by ~40% compared to showing both versions inline!
    </div>

    <h3>Step 2: Add Server-Side Rendering Support</h3>

    <p>Configure server hooks to prevent theme flash on page load:</p>

    <div class="code-tabs">
        <div class="tab-buttons">
            <button class="tab-btn active" data-tab="hooks-server">hooks.server.ts</button>
            <button class="tab-btn" data-tab="layout-server">+layout.server.ts</button>
        </div>
        <div class="tab-content active" data-tab="hooks-server">
            <pre><code class="language-typescript"
                    >{`// src/hooks.server.ts
import { createThemeHooks } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

const { transform } = createThemeHooks(themeConfig);

export const handle = transform;`}</code
                ></pre>
        </div>
        <div class="tab-content" data-tab="layout-server">
            <pre><code class="language-typescript"
                    >{`// src/routes/+layout.server.ts
import { loadThemePreferences } from '@goobits/themes/server';
import { themeConfig } from '$lib/config/theme';

export function load({ cookies }) {
  return {
    preferences: loadThemePreferences(cookies, themeConfig)
  };
}`}</code
                ></pre>
        </div>
    </div>

    <h3>Step 3: Update HTML Template</h3>

    <p>Add the theme class placeholder to your HTML template:</p>

    <pre><code class="language-html"
            >{`<!-- src/app.html -->
<html lang="en" class="%sveltekit.theme%">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`}</code
        ></pre>

    <h3>Step 4: Add Theme Provider</h3>

    <p>Wrap your app with the ThemeProvider component:</p>

    <pre><code class="language-svelte"
            >{`<!-- src/routes/+layout.svelte -->
<script>
  import { ThemeProvider } from '@goobits/themes/svelte';
  import { themeConfig } from '$lib/config/theme';

  // Import preset theme CSS (optional)
  import '@goobits/themes/themes/default.css';
  import '@goobits/themes/themes/spells.css';

  const { data, children } = $props();
</script>

<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>
  {@render children?.()}
</ThemeProvider>`}</code
        ></pre>

    <h2>Using Theme Controls</h2>

    <p>Add theme switching UI with built-in components:</p>

    <pre><code class="language-svelte"
            >{`<script>
  import { ThemeToggle, SchemeSelector } from '@goobits/themes/svelte';
</script>

<!-- Quick light/dark toggle -->
<ThemeToggle />

<!-- Scheme selector dropdown -->
<SchemeSelector />`}</code
        ></pre>

    <h2>Custom Theme Controls</h2>

    <p>Build custom UI with the <code>useTheme</code> hook:</p>

    <pre><code class="language-svelte"
            >{`<script>
  import { useTheme } from '@goobits/themes/svelte';

  const theme = useTheme();

  // Reactive values using $derived
  const currentMode = $derived(theme.theme);
  const currentScheme = $derived(theme.scheme);

  function toggleTheme() {
    const newMode = currentMode === 'dark' ? 'light' : 'dark';
    theme.setTheme(newMode);
  }
</script>

<button onclick={toggleTheme}>
  {currentMode === 'dark' ? '🌙' : '☀️'} Toggle Theme
</button>

<select value={currentScheme} onchange={(e) => theme.setScheme(e.target.value)}>
  <option value="default">Default</option>
  <option value="spells">Spells</option>
</select>`}</code
        ></pre>

    <div class="callout success">
        <strong>✅ You're All Set!</strong><br />
        Your theme system is now configured. Try switching themes in the navigation to see it in action!
    </div>

    <h2>Next Steps</h2>

    <ul>
        <li><a href="/docs/design-tokens">Design Tokens</a> - Explore available CSS variables</li>
        <li><a href="/docs/api-reference">API Reference</a> - Complete API documentation</li>
        <li><a href="/docs/components">Components</a> - Theme component details</li>
    </ul>
</article>

<style>
    article {
        max-width: 900px;
    }

    .lead {
        font-size: 1.25rem;
        color: var(--text-secondary);
        margin-bottom: 2rem;
        line-height: 1.6;
    }

    .callout {
        padding: 1.5rem;
        border-radius: 12px;
        margin: 2rem 0;
        border-left: 4px solid;
        font-size: 0.95rem;
    }

    .callout strong {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }

    .callout.note {
        background: var(--info-bg);
        border-color: var(--info-border);
    }

    .callout.warning {
        background: var(--warning-bg);
        border-color: var(--warning-border);
    }

    .callout.tip {
        background: var(--success-bg);
        border-color: var(--success-border);
    }

    .callout.success {
        background: var(--success-bg);
        border-color: var(--success-border);
    }

    .code-tabs {
        margin: 2rem 0;
        border: 2px solid var(--border-primary);
        border-radius: 12px;
        overflow: hidden;
        background: var(--bg-raised);
    }

    .tab-buttons {
        display: flex;
        gap: 0;
        background: var(--bg-secondary);
        border-bottom: 2px solid var(--border-primary);
    }

    .tab-btn {
        flex: 1;
        padding: 0.75rem 1.5rem;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-weight: 500;
        font-size: 0.95rem;
        transition: all 0.2s;
        border-right: 1px solid var(--border-primary);
    }

    .tab-btn:last-child {
        border-right: none;
    }

    .tab-btn:hover {
        background: var(--bg-primary);
        color: var(--text-primary);
    }

    .tab-btn.active {
        background: var(--accent-primary);
        color: var(--color-text-on-primary);
        font-weight: 600;
    }

    .tab-content {
        display: none;
        padding: 0;
    }

    .tab-content.active {
        display: block;
    }

    .tab-content pre {
        margin: 0;
        border-radius: 0;
    }

    pre {
        background: var(--bg-tertiary);
        color: var(--text-primary);
        padding: 1.5rem;
        border-radius: 10px;
        overflow-x: auto;
        margin: 1.5rem 0;
    }

    code {
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 0.9rem;
        line-height: 1.6;
    }

    :global(article code:not(pre code)) {
        background: var(--bg-secondary);
        padding: 0.2em 0.5em;
        border-radius: 4px;
        color: var(--accent-primary);
        font-weight: 500;
    }
</style>
