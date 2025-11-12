<script>
    import ThemeShowcase from '$lib/components/ThemeShowcase.svelte';
</script>

<div class="container">
    <header>
        <h1>@goobits/themes + @goobits/docs-engine</h1>
        <p class="tagline">Interactive Documentation Demo</p>
    </header>

    <section class="intro">
        <h2>🎨 Experience Theme Magic</h2>
        <p>
            This demo showcases how <strong>@goobits/docs-engine</strong> transforms documentation from
            static text into an interactive, engaging experience.
        </p>
        <p>
            Try the interactive theme showcase below, then explore the
            <a href="/docs-demo">Enhanced Documentation</a> to see:
        </p>
        <ul>
            <li>📑 <strong>Code Tabs</strong> - Reduce duplication by 40%</li>
            <li>💡 <strong>Callouts</strong> - Draw attention to important information</li>
            <li>📦 <strong>Collapsible Sections</strong> - Hide complexity when needed</li>
            <li>✨ <strong>Enhanced Code Blocks</strong> - Syntax highlighting & copy buttons</li>
        </ul>
    </section>

    <ThemeShowcase />

    <section class="benefits">
        <h2>Why This Matters</h2>
        <div class="benefits-grid">
            <div class="benefit-card">
                <div class="benefit-icon">📉</div>
                <h3>Less Duplication</h3>
                <p>
                    Code tabs eliminate repetitive examples across JavaScript, TypeScript, and
                    multiple frameworks.
                </p>
            </div>
            <div class="benefit-card">
                <div class="benefit-icon">🎯</div>
                <h3>Better Engagement</h3>
                <p>
                    Interactive components make documentation more engaging and easier to
                    understand.
                </p>
            </div>
            <div class="benefit-card">
                <div class="benefit-icon">⚡</div>
                <h3>Faster Learning</h3>
                <p>Visual examples and live demos help users grasp concepts quickly.</p>
            </div>
            <div class="benefit-card">
                <div class="benefit-icon">🎨</div>
                <h3>Professional Look</h3>
                <p>
                    Consistent styling and polished components create a premium documentation
                    experience.
                </p>
            </div>
        </div>
    </section>

    <section class="cta">
        <h2>Explore the Documentation</h2>
        <p>See all the enhanced features in action:</p>
        <div class="button-group">
            <a href="/docs-demo" class="button primary">View Enhanced Docs</a>
            <a href="https://github.com/goobits/theme-engine" class="button secondary"
                >GitHub Repo</a
            >
        </div>
    </section>
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        background: var(--bg-primary, #ffffff);
        min-height: 100vh;
    }

    header {
        text-align: center;
        margin-bottom: 3rem;
        padding: 3rem 0;
        border-bottom: 2px solid var(--border-primary, #e5e7eb);
    }

    h1 {
        font-size: 3rem;
        margin: 0 0 1rem 0;
        background: linear-gradient(
            135deg,
            var(--accent-primary, #3b82f6),
            var(--accent-glow, #8b5cf6)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .tagline {
        font-size: 1.25rem;
        color: var(--text-secondary, #6b7280);
        margin: 0;
    }

    .intro {
        background: var(--bg-raised, #fafafa);
        border: 2px solid var(--border-primary, #e5e7eb);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
    }

    .intro h2 {
        margin-top: 0;
        color: var(--accent-primary);
    }

    .intro p {
        line-height: 1.6;
        color: var(--text-primary);
    }

    .intro ul {
        list-style: none;
        padding: 0;
        margin: 1.5rem 0 0 0;
    }

    .intro li {
        padding: 0.75rem;
        margin: 0.5rem 0;
        background: var(--bg-primary);
        border-radius: 8px;
        border: 1px solid var(--border-primary);
    }

    .intro strong {
        color: var(--accent-primary);
    }

    .intro a {
        color: var(--accent-primary);
        text-decoration: none;
        font-weight: 600;
    }

    .intro a:hover {
        text-decoration: underline;
    }

    .benefits {
        margin: 3rem 0;
    }

    .benefits h2 {
        text-align: center;
        color: var(--accent-primary);
        margin-bottom: 2rem;
        font-size: 2rem;
    }

    .benefits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .benefit-card {
        background: var(--bg-raised, #fafafa);
        border: 2px solid var(--border-primary, #e5e7eb);
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        transition: all 0.3s ease;
    }

    .benefit-card:hover {
        border-color: var(--accent-primary);
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
    }

    .benefit-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .benefit-card h3 {
        margin: 0 0 0.5rem 0;
        color: var(--accent-primary);
    }

    .benefit-card p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.5;
    }

    .cta {
        text-align: center;
        margin: 4rem 0;
        padding: 3rem 2rem;
        background: linear-gradient(
            135deg,
            var(--accent-primary, #3b82f6) 0%,
            var(--accent-glow, #8b5cf6) 100%
        );
        border-radius: 16px;
        color: white;
    }

    .cta h2 {
        margin-top: 0;
        color: white;
    }

    .cta p {
        font-size: 1.125rem;
        margin-bottom: 2rem;
        opacity: 0.95;
    }

    .button-group {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .button {
        padding: 1rem 2rem;
        border-radius: 8px;
        font-size: 1.125rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s ease;
        display: inline-block;
    }

    .button.primary {
        background: white;
        color: var(--accent-primary, #3b82f6);
    }

    .button.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
    }

    .button.secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 2px solid white;
    }

    .button.secondary:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        h1 {
            font-size: 2rem;
        }

        .benefits-grid {
            grid-template-columns: 1fr;
        }

        .button-group {
            flex-direction: column;
            align-items: stretch;
        }
    }
</style>
