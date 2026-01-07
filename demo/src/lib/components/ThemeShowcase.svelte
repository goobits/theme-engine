<script lang="ts">
	import { ThemeToggle, useTheme } from '../../../../src/lib/svelte/index.js'

	const theme = useTheme()
	const activeScheme = $derived(theme.scheme)
	const schemes = $derived([ ...theme.availableSchemes ].sort((a, b) =>
		a.displayName.localeCompare(b.displayName)
	))

	function setScheme(scheme: string) {
		theme.setScheme(scheme)
	}
</script>

<div class="showcase">
	<header class="showcase__header">
		<h1>Theme Engine</h1>
		<p>Pick a theme. Watch it breathe.</p>
		<div class="showcase__actions">
			<ThemeToggle />
		</div>
	</header>

	<div class="showcase__tabs">
		{#each schemes as scheme}
			<button
				class="tab"
				class:active={activeScheme === scheme.name}
				onclick={() => setScheme(scheme.name)}
				type="button"
			>
				{scheme.displayName}
			</button>
		{/each}
	</div>

	<section class="window">
		<div class="window__bar">
			<div class="window__lights">
				<span class="light light--close"></span>
				<span class="light light--minimize"></span>
				<span class="light light--expand"></span>
			</div>
			<div class="window__title">preview.app</div>
			<div class="window__spacer"></div>
		</div>

		<div class="window__body">
			<div class="card">
				<h2>Beautiful by default</h2>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
					tempor incididunt ut labore.
				</p>
			</div>

			<div class="button-row">
				<button class="button button--primary" type="button">Primary Action</button>
				<button class="button button--ghost" type="button">Secondary</button>
			</div>

			<p class="fine-print">
				Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
				aliquip ex ea commodo consequat.
			</p>
		</div>
	</section>

	<footer class="showcase__footer">@goobits/themes</footer>
</div>

<style>
	.showcase {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3.5rem 1.5rem 4rem;
		gap: 2.5rem;
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.showcase__header {
		text-align: center;
		max-width: 28rem;
	}

	.showcase__header h1 {
		font-size: 2.4rem;
		margin: 0 0 0.75rem 0;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	.showcase__header p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 1.125rem;
		line-height: 1.6;
	}

	.showcase__actions {
		margin-top: 1.25rem;
		display: flex;
		justify-content: center;
	}

	.showcase__tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}

	.tab {
		border-radius: 999px;
		padding: 0.55rem 1.25rem;
		font-size: 0.9rem;
		font-weight: 600;
		border: 1px solid var(--border-primary);
		background: var(--bg-secondary);
		color: var(--text-secondary);
		transition: all 200ms ease;
		cursor: pointer;
	}

	.tab:hover {
		color: var(--text-primary);
		border-color: var(--accent-primary);
	}

	.tab.active {
		background: var(--text-primary);
		color: var(--bg-primary);
		border-color: var(--text-primary);
		box-shadow: var(--shadow-md);
	}

	.window {
		width: min(100%, 40rem);
		border-radius: 18px;
		background: var(--bg-primary);
		border: 1px solid var(--border-primary);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border-primary);
		overflow: hidden;
		transition: background 300ms ease, border-color 300ms ease;
	}

	.window__bar {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-primary);
	}

	.window__lights {
		display: flex;
		gap: 0.5rem;
	}

	.light {
		width: 12px;
		height: 12px;
		border-radius: 999px;
		display: inline-block;
	}

	.light--close {
		background: var(--error);
	}

	.light--minimize {
		background: var(--warning);
	}

	.light--expand {
		background: var(--success);
	}

	.window__title {
		text-align: center;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.window__spacer {
		width: 2.5rem;
	}

	.window__body {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		background: var(--bg-primary);
	}

	.card {
		border-radius: 14px;
		padding: 1.5rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
	}

	.card h2 {
		margin: 0 0 0.75rem 0;
		font-size: 1.25rem;
		color: var(--text-primary);
	}

	.card p {
		margin: 0;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.button-row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.button {
		border-radius: 10px;
		padding: 0.65rem 1.3rem;
		font-size: 0.9rem;
		font-weight: 600;
		border: 1px solid var(--border-primary);
		background: transparent;
		color: var(--text-primary);
		cursor: pointer;
		transition: all 250ms ease;
	}

	.button--primary {
		background: var(--accent-primary);
		border-color: var(--accent-primary);
		color: var(--color-text-on-primary);
	}

	.button--primary:hover {
		box-shadow: var(--shadow-md);
	}

	.button--ghost:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	.fine-print {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.showcase__footer {
		font-size: 0.85rem;
		color: var(--text-tertiary);
	}

	@media (max-width: 640px) {
		.window__body {
			padding: 1.5rem;
		}

		.button-row {
			flex-direction: column;
		}

		.button {
			width: 100%;
		}
	}
</style>
