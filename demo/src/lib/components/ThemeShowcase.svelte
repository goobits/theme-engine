<section class="showcase">
    <div class="showcase__header">
        <h2>Theme Playground</h2>
        <p>Switch presets and modes to see tokens update across UI elements.</p>
    </div>

    <div class="showcase__grid">
        <article class="card">
            <h3>Surface & Borders</h3>
            <p>Raised panels, subtle borders, and text contrast.</p>
            <div class="chip-row">
                <span class="chip">Primary</span>
                <span class="chip chip--accent">Accent</span>
                <span class="chip chip--muted">Muted</span>
            </div>
        </article>

        <article class="card card--gradient">
            <h3>Accent Energy</h3>
            <p>Buttons and links should pop without overpowering.</p>
            <div class="button-row">
                <button class="btn btn--primary" type="button">Primary</button>
                <button class="btn btn--ghost" type="button">Ghost</button>
            </div>
        </article>

        <article class="card card--inset">
            <h3>Typography</h3>
            <p class="kicker">System text, readable by default.</p>
            <p class="quote">“The right theme makes a product feel alive.”</p>
            <a class="link" href="/docs-demo">See docs demo →</a>
        </article>
    </div>
</section>

<style>
    .showcase {
        margin: 2.5rem 0;
        padding: 2rem;
        border-radius: 20px;
        background: var(--bg-raised, #fafafa);
        border: 2px solid var(--border-primary, #e5e7eb);
    }

    .showcase__header h2 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary, #111827);
    }

    .showcase__header p {
        margin: 0;
        color: var(--text-secondary, #6b7280);
    }

    .showcase__grid {
        margin-top: 1.5rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.5rem;
    }

    .card {
        background: var(--bg-primary, #ffffff);
        border-radius: 16px;
        padding: 1.5rem;
        border: 2px solid var(--border-primary, #e5e7eb);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.04);
    }

    .card--gradient {
        background: linear-gradient(
            135deg,
            var(--accent-primary, #3b82f6),
            var(--accent-glow, #8b5cf6)
        );
        color: white;
        border-color: transparent;
    }

    .card--gradient h3,
    .card--gradient p {
        color: white;
    }

    .card--inset {
        background: var(--bg-inset, #f3f4f6);
    }

    .chip-row {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        flex-wrap: wrap;
    }

    .chip {
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        background: var(--accent-soft, rgba(59, 130, 246, 0.15));
        color: var(--accent-primary, #3b82f6);
        font-weight: 600;
        font-size: 0.85rem;
    }

    .chip--accent {
        background: var(--accent-primary, #3b82f6);
        color: white;
    }

    .chip--muted {
        background: var(--bg-inset, #f3f4f6);
        color: var(--text-secondary, #6b7280);
    }

    .button-row {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        flex-wrap: wrap;
    }

    .btn {
        border: none;
        padding: 0.65rem 1.25rem;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
    }

    .btn--primary {
        background: white;
        color: var(--accent-primary, #3b82f6);
    }

    .btn--ghost {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.5);
    }

    .kicker {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        margin-bottom: 0.5rem;
        color: var(--text-tertiary, #9ca3af);
    }

    .quote {
        font-size: 1.1rem;
        margin: 0 0 1rem 0;
        color: var(--text-primary, #111827);
    }

    .link {
        color: var(--accent-primary, #3b82f6);
        font-weight: 600;
        text-decoration: none;
    }

    .link:hover {
        text-decoration: underline;
    }

    @media (max-width: 768px) {
        .showcase {
            padding: 1.5rem;
        }
    }
</style>
