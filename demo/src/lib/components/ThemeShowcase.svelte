<script>
	import { useTheme } from '@goobits/themes/svelte';

	let { interactive = true } = $props();

	const theme = useTheme();
	const currentMode = $derived(theme.theme);
	const currentScheme = $derived(theme.scheme);

	const schemes = ['default', 'spells'];
</script>

<div class="theme-showcase">
	<h2>🎨 Interactive Theme Gallery</h2>
	<p class="description">
		Experience @goobits/themes in action. Click the controls below to see themes change in
		real-time.
	</p>

	<div class="controls">
		<div class="control-group">
			<label>Theme Mode:</label>
			<div class="button-group">
				<button
					class="mode-button"
					class:active={currentMode === 'light'}
					onclick={() => theme.setTheme('light')}
					disabled={!interactive}
				>
					☀️ Light
				</button>
				<button
					class="mode-button"
					class:active={currentMode === 'dark'}
					onclick={() => theme.setTheme('dark')}
					disabled={!interactive}
				>
					🌙 Dark
				</button>
				<button
					class="mode-button"
					class:active={currentMode === 'system'}
					onclick={() => theme.setTheme('system')}
					disabled={!interactive}
				>
					💻 System
				</button>
			</div>
		</div>

		<div class="control-group">
			<label>Color Scheme:</label>
			<div class="button-group">
				{#each schemes as scheme}
					<button
						class="scheme-button"
						class:active={currentScheme === scheme}
						onclick={() => theme.setScheme(scheme)}
						disabled={!interactive}
					>
						{scheme === 'default' ? '🎨' : '✨'} {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="preview-panel">
		<h3>Live Preview</h3>
		<div class="preview-content">
			<div class="preview-row">
				<button class="preview-button primary">Primary Button</button>
				<button class="preview-button secondary">Secondary Button</button>
			</div>

			<div class="preview-card">
				<h4>Card Component</h4>
				<p>This card adapts to your selected theme and color scheme.</p>
				<div class="preview-badge">Badge</div>
			</div>

			<div class="preview-input-group">
				<input type="text" placeholder="Input field" class="preview-input" />
				<input type="text" placeholder="Focus me!" class="preview-input" />
			</div>

			<div class="color-swatches">
				<div class="swatch">
					<div class="swatch-color" style="background: var(--accent-primary)"></div>
					<span>Primary</span>
				</div>
				<div class="swatch">
					<div class="swatch-color" style="background: var(--accent-glow)"></div>
					<span>Glow</span>
				</div>
				<div class="swatch">
					<div class="swatch-color" style="background: var(--bg-primary)"></div>
					<span>Background</span>
				</div>
				<div class="swatch">
					<div class="swatch-color" style="background: var(--text-primary)"></div>
					<span>Text</span>
				</div>
			</div>
		</div>
	</div>

	<div class="current-state">
		<strong>Current:</strong>
		{currentMode} mode + {currentScheme} scheme
	</div>
</div>

<style>
	.theme-showcase {
		border: 2px solid var(--border-primary, #e5e7eb);
		border-radius: 16px;
		padding: 2rem;
		margin: 2rem 0;
		background: var(--bg-raised, #fafafa);
		transition: all 0.3s ease;
	}

	h2 {
		margin: 0 0 0.5rem 0;
		color: var(--accent-primary);
	}

	.description {
		color: var(--text-secondary);
		margin-bottom: 2rem;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.control-group label {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 0.9rem;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.mode-button,
	.scheme-button {
		padding: 0.75rem 1.5rem;
		border: 2px solid var(--border-primary, #e5e7eb);
		border-radius: 8px;
		background: var(--bg-primary);
		color: var(--text-primary);
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	.mode-button:hover:not(:disabled),
	.scheme-button:hover:not(:disabled) {
		border-color: var(--accent-primary);
		background: var(--accent-primary);
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.mode-button.active,
	.scheme-button.active {
		border-color: var(--accent-primary);
		background: var(--accent-primary);
		color: white;
		font-weight: 600;
	}

	.mode-button:disabled,
	.scheme-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.preview-panel {
		background: var(--bg-primary);
		border: 2px solid var(--border-primary);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}

	.preview-panel h3 {
		margin: 0 0 1rem 0;
		color: var(--accent-primary);
	}

	.preview-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.preview-row {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.preview-button {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
	}

	.preview-button.primary {
		background: var(--accent-primary);
		color: white;
	}

	.preview-button.secondary {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: 2px solid var(--border-primary);
	}

	.preview-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.preview-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		border-radius: 8px;
		padding: 1.5rem;
	}

	.preview-card h4 {
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
	}

	.preview-card p {
		margin: 0 0 1rem 0;
		color: var(--text-secondary);
	}

	.preview-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		background: var(--accent-glow);
		color: white;
		border-radius: 12px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.preview-input-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.preview-input {
		padding: 0.75rem;
		border: 2px solid var(--border-primary);
		border-radius: 8px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	.preview-input:focus {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.color-swatches {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: 1rem;
	}

	.swatch {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.swatch-color {
		width: 60px;
		height: 60px;
		border-radius: 12px;
		border: 2px solid var(--border-primary);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.swatch span {
		font-size: 0.875rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.current-state {
		text-align: center;
		padding: 1rem;
		background: var(--bg-primary);
		border-radius: 8px;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.current-state strong {
		color: var(--accent-primary);
	}

	@media (max-width: 640px) {
		.theme-showcase {
			padding: 1rem;
		}

		.button-group {
			flex-direction: column;
		}

		.mode-button,
		.scheme-button {
			width: 100%;
		}

		.color-swatches {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
