<script>
    import { page } from '$app/stores';

    let { children } = $props();

    const navItems = [
        { href: '/docs/getting-started', label: 'Getting Started' },
        { href: '/docs/api-reference', label: 'API Reference' },
        { href: '/docs/components', label: 'Components' },
        { href: '/docs/design-tokens', label: 'Design Tokens' },
    ];
</script>

<div class="docs-layout">
    <nav class="docs-nav">
        <div class="nav-header">
            <h2>📚 Enhanced Docs</h2>
            <a href="/" class="back-link">← Home</a>
        </div>
        <ul class="nav-links">
            {#each navItems as item}
                <li>
                    <a
                        href={item.href}
                        class="nav-link"
                        class:active={$page.url.pathname === item.href}
                    >
                        {item.label}
                    </a>
                </li>
            {/each}
        </ul>

        <div class="nav-footer">
            <p class="info">
                <strong>ℹ️ Demo Mode</strong><br />
                These are enhanced versions showing interactive features.
            </p>
        </div>
    </nav>

    <main class="docs-content">
        {@render children()}
    </main>
</div>

<style>
    .docs-layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        max-width: 1400px;
        margin: 0 auto;
        min-height: 100vh;
        gap: 0;
    }

    .docs-nav {
        background: var(--bg-raised, #fafafa);
        border-right: 2px solid var(--border-primary, #e5e7eb);
        padding: 2rem 1.5rem;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .nav-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid var(--border-primary);
    }

    .nav-header h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        color: var(--accent-primary);
    }

    .back-link {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.875rem;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: var(--accent-primary);
    }

    .nav-links {
        list-style: none;
        padding: 0;
        margin: 0;
        flex: 1;
    }

    .nav-links li {
        margin-bottom: 0.5rem;
    }

    .nav-link {
        display: block;
        padding: 0.75rem 1rem;
        color: var(--text-primary);
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.2s;
        font-size: 0.95rem;
    }

    .nav-link:hover {
        background: var(--bg-primary);
        color: var(--accent-primary);
        transform: translateX(4px);
    }

    .nav-link.active {
        background: var(--accent-primary);
        color: white;
        font-weight: 600;
    }

    .nav-footer {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 2px solid var(--border-primary);
    }

    .info {
        font-size: 0.8rem;
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
        padding: 0.75rem;
        background: var(--bg-primary);
        border-radius: 6px;
        border: 1px solid var(--border-primary);
    }

    .info strong {
        color: var(--accent-primary);
    }

    .docs-content {
        padding: 3rem;
        background: var(--bg-primary);
        overflow-y: auto;
    }

    /* Enhanced markdown styles */
    :global(.docs-content h1) {
        font-size: 2.5rem;
        margin: 0 0 1rem 0;
        border-bottom: 3px solid var(--accent-primary);
        padding-bottom: 0.75rem;
        color: var(--text-primary);
    }

    :global(.docs-content h2) {
        font-size: 2rem;
        margin: 3rem 0 1rem 0;
        color: var(--accent-primary);
    }

    :global(.docs-content h3) {
        font-size: 1.5rem;
        margin: 2rem 0 0.75rem 0;
        color: var(--text-primary);
    }

    :global(.docs-content code:not(pre code)) {
        background: var(--bg-secondary, #f5f5f7);
        padding: 0.2em 0.5em;
        border-radius: 4px;
        font-size: 0.9em;
        color: var(--accent-primary);
        font-weight: 500;
    }

    :global(.docs-content pre) {
        margin: 1.5rem 0;
        border-radius: 10px;
        overflow-x: auto;
        background: #282a36 !important;
        padding: 1.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    :global(.docs-content pre code) {
        background: transparent;
        color: #f8f8f2;
        font-size: 0.9rem;
        line-height: 1.6;
    }

    :global(.docs-content blockquote) {
        margin: 1.5rem 0;
        padding: 1rem 1.5rem;
        border-left: 4px solid;
        border-radius: 0 8px 8px 0;
        font-size: 0.95rem;
    }

    :global(.docs-content blockquote[data-callout='note']) {
        background: rgba(59, 130, 246, 0.1);
        border-color: #3b82f6;
        color: var(--text-primary);
    }

    :global(.docs-content blockquote[data-callout='tip']) {
        background: rgba(16, 185, 129, 0.1);
        border-color: #10b981;
        color: var(--text-primary);
    }

    :global(.docs-content blockquote[data-callout='warning']) {
        background: rgba(251, 146, 60, 0.1);
        border-color: #fb923c;
        color: var(--text-primary);
    }

    :global(.docs-content blockquote[data-callout='important']) {
        background: rgba(168, 85, 247, 0.1);
        border-color: #a855f7;
        color: var(--text-primary);
    }

    :global(.docs-content blockquote[data-callout='success']) {
        background: rgba(34, 197, 94, 0.1);
        border-color: #22c55e;
        color: var(--text-primary);
    }

    :global(.docs-content a) {
        color: var(--accent-primary);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s;
    }

    :global(.docs-content a:hover) {
        text-decoration: underline;
        color: var(--accent-glow);
    }

    :global(.docs-content ul),
    :global(.docs-content ol) {
        margin: 1rem 0;
        padding-left: 2rem;
        line-height: 1.8;
    }

    :global(.docs-content li) {
        margin: 0.5rem 0;
    }

    :global(.docs-content p) {
        line-height: 1.7;
        margin: 1rem 0;
        color: var(--text-primary);
    }

    :global(.docs-content hr) {
        border: none;
        border-top: 2px solid var(--border-primary);
        margin: 3rem 0;
    }

    @media (max-width: 1024px) {
        .docs-layout {
            grid-template-columns: 1fr;
        }

        .docs-nav {
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 2px solid var(--border-primary);
        }

        .docs-content {
            padding: 2rem 1.5rem;
        }
    }
</style>
