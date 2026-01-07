<script>
    let { children } = $props();
</script>

<div class="docs-container">
    <main class="docs-content">
        {@render children()}
    </main>
</div>

<style>
    .docs-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .docs-content {
        background: var(--bg-primary);
        color: var(--text-primary);
        border-radius: 12px;
        padding: 3rem;
        box-shadow: var(--shadow-sm);
    }

    :global(.docs-content h1) {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        border-bottom: 2px solid var(--accent-primary);
        padding-bottom: 0.5rem;
    }

    :global(.docs-content h2) {
        font-size: 2rem;
        margin-top: 3rem;
        margin-bottom: 1rem;
        color: var(--accent-primary);
    }

    :global(.docs-content h3) {
        font-size: 1.5rem;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
    }

    :global(.docs-content code:not(pre code)) {
        background: var(--bg-secondary);
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-size: 0.9em;
    }

    :global(.docs-content pre) {
        margin: 1.5rem 0;
        border-radius: 8px;
        overflow-x: auto;
    }

    :global(.docs-content blockquote) {
        margin: 1.5rem 0;
        padding: 1rem 1.5rem;
        border-left: 4px solid var(--accent-primary);
        background: var(--bg-secondary);
        border-radius: 0 8px 8px 0;
    }
</style>
