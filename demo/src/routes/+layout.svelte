<script lang="ts">
    import { ThemeProvider } from '@goobits/themes/svelte';
    import '@goobits/themes/themes';
    import '@goobits/themes/themes/default.css';
    import '@goobits/themes/themes/spells.css';
    import favicon from '$lib/assets/favicon.svg';
    import type { ThemeConfig } from '@goobits/themes';
    import ThemeControls from '$lib/components/ThemeControls.svelte';

    let { children } = $props();

    const themeConfig: ThemeConfig = {
        schemes: {
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
            spells: {
                name: 'spells',
                displayName: 'Spells',
                description: 'Magical purple theme',
                preview: {
                    primary: '#8b5cf6',
                    accent: '#a78bfa',
                    background: '#ffffff',
                },
            },
        },
    };
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<ThemeProvider config={themeConfig}>
    <div class="app">
        <header class="topbar">
            <div class="brand">
                <span class="brand__dot" aria-hidden="true"></span>
                <span class="brand__name">@goobits/themes</span>
            </div>
            <ThemeControls />
        </header>
        <main class="content">
            {@render children()}
        </main>
    </div>
</ThemeProvider>

<style>
    .app {
        min-height: 100vh;
        background: var(--bg-primary, #ffffff);
    }

    .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.25rem 2rem;
        border-bottom: 2px solid var(--border-primary, #e5e7eb);
        background: var(--bg-raised, #fafafa);
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 700;
        color: var(--text-primary, #111827);
    }

    .brand__dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: var(--accent-primary, #3b82f6);
        box-shadow: 0 0 0 4px var(--accent-soft, rgba(59, 130, 246, 0.2));
    }

    .content {
        padding-top: 1rem;
    }

    @media (max-width: 768px) {
        .topbar {
            flex-direction: column;
            align-items: stretch;
            padding: 1rem;
        }
    }
</style>
