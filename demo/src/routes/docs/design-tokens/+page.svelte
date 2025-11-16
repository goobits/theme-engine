<script>
    import DesignTokenExplorer from '$lib/components/DesignTokenExplorer.svelte';
</script>

<article>
    <h1>Design Tokens</h1>

    <p class="lead">
        @goobits/themes uses CSS custom properties (design tokens) to provide a flexible, theme-able
        design system.
    </p>

    <div class="callout note">
        <strong>💡 Interactive Mode</strong><br />
        This page features an interactive design token explorer. Try switching themes to see values update
        in real-time!
    </div>

    <h2>Interactive Token Explorer</h2>

    <DesignTokenExplorer />

    <h2>Token Categories</h2>

    <h3>🎨 Color Tokens</h3>

    <p>Color tokens adapt based on theme mode (light/dark) and color scheme:</p>

    <div class="token-grid">
        <div class="token-section">
            <h4>Background Colors</h4>
            <ul>
                <li><code>--bg-primary</code> - Main background color</li>
                <li><code>--bg-secondary</code> - Secondary backgrounds (cards, panels)</li>
                <li><code>--bg-raised</code> - Elevated elements</li>
            </ul>
        </div>

        <div class="token-section">
            <h4>Text Colors</h4>
            <ul>
                <li><code>--text-primary</code> - Primary text</li>
                <li><code>--text-secondary</code> - Secondary/muted text</li>
            </ul>
        </div>

        <div class="token-section">
            <h4>Accent Colors</h4>
            <ul>
                <li><code>--accent-primary</code> - Primary accent (buttons, links)</li>
                <li><code>--accent-glow</code> - Glow/highlight effects</li>
            </ul>
        </div>

        <div class="token-section">
            <h4>Border Colors</h4>
            <ul>
                <li><code>--border-primary</code> - Default borders</li>
            </ul>
        </div>
    </div>

    <h3>📏 Spacing Tokens</h3>

    <p>Consistent spacing scale based on 4px grid:</p>

    <div class="spacing-examples">
        <div class="spacing-item" style="padding-left: var(--spacing-xs)">
            <code>--spacing-xs</code> <span>4px</span>
        </div>
        <div class="spacing-item" style="padding-left: var(--spacing-sm)">
            <code>--spacing-sm</code> <span>8px</span>
        </div>
        <div class="spacing-item" style="padding-left: var(--spacing-md)">
            <code>--spacing-md</code> <span>16px</span>
        </div>
        <div class="spacing-item" style="padding-left: var(--spacing-lg)">
            <code>--spacing-lg</code> <span>24px</span>
        </div>
        <div class="spacing-item" style="padding-left: var(--spacing-xl)">
            <code>--spacing-xl</code> <span>32px</span>
        </div>
        <div class="spacing-item" style="padding-left: var(--spacing-2xl)">
            <code>--spacing-2xl</code> <span>48px</span>
        </div>
    </div>

    <h3>📐 Radius Tokens</h3>

    <p>Border radius values for consistent rounded corners:</p>

    <div class="radius-examples">
        <div class="radius-box" style="border-radius: var(--radius-sm)">
            <code>--radius-sm</code>
            <span>4px</span>
        </div>
        <div class="radius-box" style="border-radius: var(--radius-md)">
            <code>--radius-md</code>
            <span>8px</span>
        </div>
        <div class="radius-box" style="border-radius: var(--radius-lg)">
            <code>--radius-lg</code>
            <span>12px</span>
        </div>
        <div class="radius-box" style="border-radius: var(--radius-xl)">
            <code>--radius-xl</code>
            <span>16px</span>
        </div>
    </div>

    <h2>Usage Examples</h2>

    <h3>In CSS</h3>

    <pre><code
            >{`.button {
  background: var(--accent-primary);
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 2px solid var(--border-primary);
}

.card {
  background: var(--bg-raised);
  color: var(--text-primary);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}`}</code
        ></pre>

    <h3>In Svelte (Inline Styles)</h3>

    <pre><code
            >{`<div style="
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
">
  Themed content
</div>`}</code
        ></pre>

    <h2>Creating Custom Schemes</h2>

    <div class="callout tip">
        <strong>🎨 Pro Tip</strong><br />
        Use the token explorer above to find the exact token names and values you need for your custom
        scheme!
    </div>

    <p>Override tokens in your custom scheme CSS:</p>

    <pre><code
            >{`/* Custom "ocean" scheme */
html.scheme-ocean {
  --accent-primary: #0066cc;
  --accent-glow: #00ccff;
}

html.theme-dark.scheme-ocean {
  --bg-primary: #001a33;
  --bg-secondary: #002244;
  --text-primary: #e6f2ff;
}`}</code
        ></pre>

    <h2>Best Practices</h2>

    <div class="best-practices">
        <div class="practice-card">
            <h4>✅ Do: Use Tokens</h4>
            <pre><code>background: var(--bg-primary);</code></pre>
            <p>Automatically adapts to theme changes</p>
        </div>

        <div class="practice-card error">
            <h4>❌ Don't: Hardcode Colors</h4>
            <pre><code>background: #ffffff;</code></pre>
            <p>Breaks in dark mode</p>
        </div>

        <div class="practice-card">
            <h4>✅ Do: Use Spacing Scale</h4>
            <pre><code>padding: var(--spacing-md);</code></pre>
            <p>Maintains consistent spacing</p>
        </div>

        <div class="practice-card error">
            <h4>❌ Don't: Random Values</h4>
            <pre><code>padding: 13px;</code></pre>
            <p>Breaks visual rhythm</p>
        </div>
    </div>

    <h2>Accessibility Considerations</h2>

    <div class="callout important">
        <strong>♿ Accessibility</strong><br />
        All color tokens in the default themes maintain WCAG AA contrast ratios (4.5:1) for text. When
        creating custom schemes, verify contrast ratios for accessibility.
    </div>

    <h2>Learn More</h2>

    <ul>
        <li>
            <a href="/docs/custom-themes">Create Custom Themes</a> - Build your own color schemes
        </li>
        <li><a href="/docs/components">Components</a> - See tokens in action</li>
        <li><a href="/docs/best-practices">Best Practices</a> - Design system guidelines</li>
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
    }

    .callout {
        padding: 1.5rem;
        border-radius: 12px;
        margin: 2rem 0;
        border-left: 4px solid;
    }

    .callout.note {
        background: rgba(59, 130, 246, 0.1);
        border-color: #3b82f6;
    }

    .callout.tip {
        background: rgba(16, 185, 129, 0.1);
        border-color: #10b981;
    }

    .callout.important {
        background: rgba(168, 85, 247, 0.1);
        border-color: #a855f7;
    }

    .callout strong {
        color: var(--accent-primary);
        display: block;
        margin-bottom: 0.5rem;
    }

    .token-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
    }

    .token-section {
        background: var(--bg-raised);
        padding: 1.5rem;
        border-radius: 12px;
        border: 2px solid var(--border-primary);
    }

    .token-section h4 {
        margin-top: 0;
        color: var(--accent-primary);
    }

    .token-section ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .token-section li {
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-primary);
    }

    .token-section li:last-child {
        border-bottom: none;
    }

    .spacing-examples {
        margin: 2rem 0;
    }

    .spacing-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        margin: 0.5rem 0;
        background: var(--bg-raised);
        border-radius: 8px;
        border-left: 4px solid var(--accent-primary);
    }

    .spacing-item span {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .radius-examples {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
    }

    .radius-box {
        background: var(--bg-raised);
        border: 2px solid var(--accent-primary);
        padding: 1.5rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
        justify-content: center;
        min-height: 100px;
    }

    .radius-box span {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .best-practices {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
    }

    .practice-card {
        background: rgba(34, 197, 94, 0.1);
        border: 2px solid #22c55e;
        border-radius: 12px;
        padding: 1.5rem;
    }

    .practice-card.error {
        background: rgba(239, 68, 68, 0.1);
        border-color: #ef4444;
    }

    .practice-card h4 {
        margin-top: 0;
        font-size: 1rem;
    }

    .practice-card pre {
        background: var(--bg-primary);
        padding: 0.75rem;
        border-radius: 6px;
        margin: 1rem 0;
    }

    .practice-card p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary);
    }

    pre {
        background: #282a36;
        color: #f8f8f2;
        padding: 1.5rem;
        border-radius: 10px;
        overflow-x: auto;
        margin: 1.5rem 0;
    }

    code {
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 0.9rem;
    }
</style>
