<script>
    import { useTheme } from '@goobits/themes/svelte';

    let { category = 'all' } = $props();

    const theme = useTheme();
    const currentMode = $derived(theme.theme);

    const tokens = {
        colors: [
            { name: '--bg-primary', description: 'Primary background', category: 'Background' },
            { name: '--bg-secondary', description: 'Secondary background', category: 'Background' },
            { name: '--bg-raised', description: 'Elevated surfaces', category: 'Background' },
            { name: '--text-primary', description: 'Primary text', category: 'Text' },
            { name: '--text-secondary', description: 'Secondary text', category: 'Text' },
            { name: '--accent-primary', description: 'Primary accent', category: 'Accent' },
            { name: '--accent-glow', description: 'Accent glow', category: 'Accent' },
            { name: '--border-primary', description: 'Primary borders', category: 'Border' },
        ],
        spacing: [
            { name: '--spacing-xs', value: '0.25rem', description: '4px' },
            { name: '--spacing-sm', value: '0.5rem', description: '8px' },
            { name: '--spacing-md', value: '1rem', description: '16px' },
            { name: '--spacing-lg', value: '1.5rem', description: '24px' },
            { name: '--spacing-xl', value: '2rem', description: '32px' },
            { name: '--spacing-2xl', value: '3rem', description: '48px' },
        ],
        radius: [
            { name: '--radius-sm', value: '4px', description: 'Small radius' },
            { name: '--radius-md', value: '8px', description: 'Medium radius' },
            { name: '--radius-lg', value: '12px', description: 'Large radius' },
            { name: '--radius-xl', value: '16px', description: 'Extra large radius' },
        ],
    };

    let selectedCategory = $state(category);
    let searchQuery = $state('');
    let copiedToken = $state('');

    const filteredTokens = $derived(() => {
        let items =
            selectedCategory === 'all'
                ? [...tokens.colors, ...tokens.spacing, ...tokens.radius]
                : tokens[selectedCategory] || [];

        if (searchQuery) {
            items = items.filter(
                token =>
                    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    token.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return items;
    });

    function getComputedValue(tokenName) {
        if (typeof window === 'undefined') return '';
        const value = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
        return value || 'not set';
    }

    function copyToken(tokenName) {
        navigator.clipboard.writeText(`var(${tokenName})`);
        copiedToken = tokenName;
        setTimeout(() => (copiedToken = ''), 2000);
    }

    function isColorToken(tokenName) {
        return (
            tokenName.includes('bg-') ||
            tokenName.includes('text-') ||
            tokenName.includes('accent-') ||
            tokenName.includes('border-')
        );
    }
</script>

<div class="token-explorer">
    <div class="explorer-header">
        <h3>🎨 Design Token Explorer</h3>
        <p class="explorer-description">
            Explore and copy design tokens. Current mode: <strong>{currentMode}</strong>
        </p>
    </div>

    <div class="explorer-controls">
        <input
            type="text"
            placeholder="Search tokens..."
            bind:value={searchQuery}
            class="search-input"
        />

        <div class="category-tabs">
            <button
                class="category-tab"
                class:active={selectedCategory === 'all'}
                onclick={() => (selectedCategory = 'all')}
            >
                All
            </button>
            <button
                class="category-tab"
                class:active={selectedCategory === 'colors'}
                onclick={() => (selectedCategory = 'colors')}
            >
                Colors
            </button>
            <button
                class:active={selectedCategory === 'spacing'}
                onclick={() => (selectedCategory = 'spacing')}
                class="category-tab"
            >
                Spacing
            </button>
            <button
                class="category-tab"
                class:active={selectedCategory === 'radius'}
                onclick={() => (selectedCategory = 'radius')}
            >
                Radius
            </button>
        </div>
    </div>

    <div class="tokens-grid">
        {#each filteredTokens() as token}
            <div class="token-card">
                <div class="token-info">
                    <div class="token-header">
                        <code class="token-name">{token.name}</code>
                        {#if token.category}
                            <span class="token-category">{token.category}</span>
                        {/if}
                    </div>
                    <p class="token-description">{token.description}</p>
                    <code class="token-value">{getComputedValue(token.name)}</code>
                </div>

                {#if isColorToken(token.name)}
                    <div class="token-preview color-preview">
                        <div class="color-swatch" style="background: var({token.name})"></div>
                    </div>
                {:else if token.name.includes('spacing')}
                    <div class="token-preview spacing-preview">
                        <div class="spacing-bar" style="width: var({token.name})"></div>
                    </div>
                {:else if token.name.includes('radius')}
                    <div class="token-preview radius-preview">
                        <div class="radius-box" style="border-radius: var({token.name})"></div>
                    </div>
                {/if}

                <button
                    class="copy-button"
                    onclick={() => copyToken(token.name)}
                    class:copied={copiedToken === token.name}
                >
                    {copiedToken === token.name ? '✓ Copied!' : '📋 Copy'}
                </button>
            </div>
        {/each}

        {#if filteredTokens().length === 0}
            <div class="no-results">
                <p>No tokens found matching "{searchQuery}"</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .token-explorer {
        border: 2px solid var(--border-primary);
        border-radius: 16px;
        padding: 2rem;
        background: var(--bg-raised);
        margin: 2rem 0;
    }

    .explorer-header {
        margin-bottom: 1.5rem;
    }

    .explorer-header h3 {
        margin: 0 0 0.5rem 0;
        color: var(--accent-primary);
        font-size: 1.5rem;
    }

    .explorer-description {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.95rem;
    }

    .explorer-description strong {
        color: var(--accent-primary);
    }

    .explorer-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .search-input {
        padding: 0.75rem 1rem;
        border: 2px solid var(--border-primary);
        border-radius: 8px;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 1rem;
        transition: all 0.2s;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: var(--focus-ring);
    }

    .category-tabs {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .category-tab {
        padding: 0.5rem 1rem;
        border: 2px solid var(--border-primary);
        border-radius: 8px;
        background: var(--bg-primary);
        color: var(--text-primary);
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s;
    }

    .category-tab:hover {
        border-color: var(--accent-primary);
        transform: translateY(-1px);
    }

    .category-tab.active {
        background: var(--accent-primary);
        color: var(--color-text-on-primary);
        border-color: var(--accent-primary);
    }

    .tokens-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }

    .token-card {
        background: var(--bg-primary);
        border: 2px solid var(--border-primary);
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: all 0.2s;
    }

    .token-card:hover {
        border-color: var(--accent-primary);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }

    .token-info {
        flex: 1;
    }

    .token-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        gap: 0.5rem;
    }

    .token-name {
        font-size: 0.9rem;
        color: var(--accent-primary);
        font-weight: 600;
        word-break: break-all;
    }

    .token-category {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        background: var(--bg-secondary);
        color: var(--text-secondary);
        border-radius: 4px;
        white-space: nowrap;
    }

    .token-description {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
        color: var(--text-secondary);
    }

    .token-value {
        display: block;
        padding: 0.5rem;
        background: var(--bg-secondary);
        border-radius: 4px;
        font-size: 0.85rem;
        color: var(--text-primary);
    }

    .token-preview {
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .color-swatch {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        border: 2px solid var(--border-primary);
        box-shadow: var(--shadow-sm);
    }

    .spacing-bar {
        height: 8px;
        background: var(--accent-primary);
        border-radius: 4px;
        min-width: 4px;
    }

    .radius-box {
        width: 60px;
        height: 60px;
        background: var(--accent-primary);
        border: 2px solid var(--accent-glow);
    }

    .copy-button {
        padding: 0.5rem 1rem;
        border: 2px solid var(--border-primary);
        border-radius: 6px;
        background: var(--bg-primary);
        color: var(--text-primary);
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s;
    }

    .copy-button:hover {
        border-color: var(--accent-primary);
        background: var(--accent-primary);
        color: var(--color-text-on-primary);
    }

    .copy-button.copied {
        background: var(--success);
        color: var(--color-text-on-primary);
        border-color: var(--success-border);
    }

    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }

    @media (max-width: 768px) {
        .token-explorer {
            padding: 1rem;
        }

        .tokens-grid {
            grid-template-columns: 1fr;
        }

        .category-tabs {
            flex-direction: column;
        }

        .category-tab {
            width: 100%;
        }
    }
</style>
