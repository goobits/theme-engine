<script lang="ts">
	import { useTheme } from '@goobits/themes/svelte'

	const theme = useTheme()
	const activeScheme = $derived(theme.scheme)
	const schemes = $derived([ ...theme.availableSchemes ].sort((a, b) =>
		a.displayName.localeCompare(b.displayName)
	))
	const isDark = $derived(theme.theme === 'dark')

	let isPickerOpen = $state(false)

	function setScheme(scheme: string) {
		theme.setScheme(scheme)
	}

	function toggleMode() {
		theme.setTheme(isDark ? 'light' : 'dark')
	}

	function togglePicker() {
		isPickerOpen = !isPickerOpen
	}

	const currentScheme = $derived(schemes.find(s => s.name === activeScheme))
</script>

<div class="showcase">
	<!-- Ambient glow -->
	<div class="showcase__glow"></div>

	<div class="showcase__content">
		<!-- Header -->
		<header class="showcase__header">
			<p class="showcase__label">Appearance</p>
			<h1>Theme Engine</h1>
			<p class="showcase__tagline">Pick a theme. Watch it breathe.</p>
		</header>

		<!-- Controls Row -->
		<div class="controls">
			<!-- Theme Picker Toggle -->
			<button class="control-btn control-btn--picker" onclick={togglePicker} type="button">
				<span
					class="control-btn__dot"
					style="--dot-from: {currentScheme?.preview.primary ?? 'var(--accent-primary)'}; --dot-to: {currentScheme?.preview.accent ?? 'var(--accent-primary)'};"
				></span>
				<span class="control-btn__text">{currentScheme?.displayName ?? 'Theme'}</span>
				<svg class="control-btn__chevron" class:open={isPickerOpen} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			<!-- Light/Dark Toggle -->
			<button class="control-btn control-btn--mode" onclick={toggleMode} type="button">
				<div class="toggle-track" class:dark={isDark}>
					<div class="toggle-thumb"></div>
				</div>
				<span class="control-btn__text">{isDark ? 'Dark' : 'Light'}</span>
			</button>
		</div>

		<!-- Expandable Theme Grid -->
		<div class="picker" class:open={isPickerOpen}>
			<div class="picker__inner">
				<div class="picker__grid">
					{#each schemes as scheme}
						<button
							class="picker__item"
							class:active={activeScheme === scheme.name}
							onclick={() => setScheme(scheme.name)}
							type="button"
						>
							<span
								class="picker__dot"
								class:active={activeScheme === scheme.name}
								style="--dot-from: {scheme.preview.primary}; --dot-to: {scheme.preview.accent};"
							></span>
							<span class="picker__name">{scheme.displayName}</span>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Browser Window Preview -->
		<div class="window">
			<!-- Browser Chrome - Title Bar -->
			<div class="window__bar">
				<div class="window__lights">
					<span class="light light--close"></span>
					<span class="light light--minimize"></span>
					<span class="light light--expand"></span>
				</div>
				<div class="window__url">
					<svg class="window__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
					<span>myapp.design</span>
				</div>
				<div class="window__spacer"></div>
			</div>

			<!-- Website Content -->
			<div class="window__body">
				<!-- Nav -->
				<nav class="preview-nav">
					<div class="preview-nav__brand">
						<div class="preview-nav__logo"></div>
						<span class="preview-nav__name">AppName</span>
					</div>
					<div class="preview-nav__links">
						<span>Features</span>
						<span>Pricing</span>
						<span>About</span>
						<button class="preview-nav__cta" type="button">Sign Up</button>
					</div>
				</nav>

				<!-- Hero -->
				<div class="preview-hero">
					<p class="preview-hero__label">Introducing v2.0</p>
					<h2 class="preview-hero__title">Build something amazing</h2>
					<p class="preview-hero__desc">The fastest way to ship products that users love.</p>
					<div class="preview-hero__actions">
						<button class="btn btn--primary" type="button">Get Started</button>
						<button class="btn btn--ghost" type="button">Learn More</button>
					</div>
				</div>

				<!-- Feature Cards -->
				<div class="preview-features">
					<div class="feature-card">
						<div class="feature-card__icon">⚡</div>
						<div class="feature-card__title">Lightning Fast</div>
						<div class="feature-card__desc">Optimized for speed</div>
					</div>
					<div class="feature-card">
						<div class="feature-card__icon">🎨</div>
						<div class="feature-card__title">Beautiful UI</div>
						<div class="feature-card__desc">Pixel-perfect design</div>
					</div>
					<div class="feature-card">
						<div class="feature-card__icon">🔒</div>
						<div class="feature-card__title">Secure</div>
						<div class="feature-card__desc">Enterprise-grade</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<footer class="showcase__footer">@goobits/themes</footer>
	</div>
</div>

<style>
	.showcase {
		min-height: 100vh;
		position: relative;
		overflow: hidden;
		background: var(--bg-primary);
		color: var(--text-primary);
		transition: background-color 700ms ease-out;
	}

	.showcase__glow {
		position: fixed;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 800px;
		height: 500px;
		border-radius: 50%;
		filter: blur(150px);
		background: var(--accent-primary);
		opacity: 0.08;
		pointer-events: none;
		transition: background-color 700ms ease-out, opacity 700ms ease-out;
	}

	:global([data-theme-mode="light"]) .showcase__glow {
		opacity: 0.05;
	}

	.showcase__content {
		position: relative;
		max-width: 42rem;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 3rem;
	}

	/* Header */
	.showcase__header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.showcase__label {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		margin: 0 0 0.5rem 0;
		color: var(--accent-primary);
		transition: color 500ms ease;
	}

	.showcase__header h1 {
		font-size: clamp(2.25rem, 5vw, 3rem);
		font-weight: 600;
		letter-spacing: -0.02em;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
		transition: color 500ms ease;
	}

	.showcase__tagline {
		font-size: 1.1rem;
		font-weight: 300;
		margin: 0;
		color: var(--text-secondary);
		transition: color 500ms ease;
	}

	/* Controls */
	.controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.control-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent);
		background: color-mix(in srgb, var(--accent-primary) 8%, transparent);
		cursor: pointer;
		transition: all 300ms ease;
	}

	.control-btn:hover {
		transform: scale(1.02);
	}

	.control-btn:active {
		transform: scale(0.98);
	}

	.control-btn--mode {
		background: var(--bg-secondary);
		border-color: var(--border-primary);
	}

	.control-btn__dot {
		width: 0.875rem;
		height: 0.875rem;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--dot-from), var(--dot-to));
		box-shadow: 0 0 8px var(--dot-from), 0 0 16px var(--dot-to);
		transition: all 300ms ease;
	}

	.control-btn__text {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		transition: color 300ms ease;
	}

	.control-btn__chevron {
		width: 0.875rem;
		height: 0.875rem;
		color: var(--text-secondary);
		transition: transform 300ms ease;
	}

	.control-btn__chevron.open {
		transform: rotate(180deg);
	}

	/* Toggle Track */
	.toggle-track {
		position: relative;
		width: 2.5rem;
		height: 1.25rem;
		border-radius: 999px;
		background: var(--border-primary);
		transition: background-color 300ms ease;
	}

	.toggle-track.dark {
		background: var(--accent-primary);
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: left 300ms ease;
	}

	.toggle-track.dark .toggle-thumb {
		left: calc(100% - 1.125rem);
	}

	/* Picker */
	.picker {
		max-height: 0;
		opacity: 0;
		overflow: hidden;
		transition: max-height 500ms ease-out, opacity 500ms ease-out, margin 500ms ease-out;
		margin-bottom: 0;
	}

	.picker.open {
		max-height: 340px;
		opacity: 1;
		margin-bottom: 2rem;
	}

	.picker__inner {
		padding: 0.75rem;
		border-radius: 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
	}

	.picker__grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.25rem;
		max-height: 300px;
		overflow-y: auto;
		padding-right: 0.25rem;
	}

	@media (min-width: 480px) {
		.picker__grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 640px) {
		.picker__grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.picker__item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: background-color 200ms ease;
	}

	.picker__item:hover {
		background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
	}

	.picker__item.active {
		background: color-mix(in srgb, var(--accent-primary) 15%, transparent);
	}

	.picker__dot {
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 50%;
		flex-shrink: 0;
		background: linear-gradient(135deg, var(--dot-from), var(--dot-to));
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
		transition: box-shadow 300ms ease, transform 300ms ease;
	}

	.picker__item:hover .picker__dot {
		transform: scale(1.1);
	}

	.picker__dot.active {
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15), 0 0 10px var(--dot-from), 0 0 20px var(--dot-to);
	}

	.picker__name {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: color 200ms ease;
	}

	.picker__item.active .picker__name {
		color: var(--text-primary);
	}

	/* Window */
	.window {
		border-radius: 0.75rem;
		overflow: hidden;
		box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.3);
		border: 0.5px solid var(--border-primary);
		transition: box-shadow 500ms ease, border-color 500ms ease;
	}

	:global([data-theme-mode="light"]) .window {
		box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.12);
	}

	.window__bar {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--bg-tertiary, var(--bg-secondary));
		border-bottom: 0.5px solid var(--border-primary);
		transition: background-color 500ms ease;
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
		box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.2);
		cursor: pointer;
		transition: filter 150ms ease;
	}

	.light:hover {
		filter: brightness(0.9);
	}

	.light--close {
		background: var(--error, #ff5f57);
	}

	.light--minimize {
		background: var(--warning, #febc2e);
	}

	.light--expand {
		background: var(--success, #28c840);
	}

	.window__url {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.375rem 1rem;
		margin: 0 1rem;
		border-radius: 0.375rem;
		background: var(--bg-primary);
		font-size: 0.75rem;
		color: var(--text-secondary);
		transition: background-color 500ms ease;
	}

	.window__lock {
		width: 0.75rem;
		height: 0.75rem;
		opacity: 0.5;
	}

	.window__spacer {
		width: 3.5rem;
	}

	.window__body {
		background: var(--bg-primary);
		transition: background-color 500ms ease;
	}

	/* Preview Nav */
	.preview-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid var(--border-primary);
		transition: border-color 500ms ease;
	}

	.preview-nav__brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.preview-nav__logo {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.5rem;
		background: var(--accent-primary);
		transition: background-color 500ms ease;
	}

	.preview-nav__name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		transition: color 500ms ease;
	}

	.preview-nav__links {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
		transition: color 500ms ease;
	}

	.preview-nav__cta {
		padding: 0.375rem 0.75rem;
		border-radius: 0.5rem;
		border: none;
		background: var(--accent-primary);
		color: var(--color-text-on-primary, white);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 500ms ease;
	}

	/* Preview Hero */
	.preview-hero {
		padding: 2rem 1.25rem;
		text-align: center;
	}

	.preview-hero__label {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		margin: 0 0 0.5rem 0;
		color: var(--accent-primary);
		transition: color 500ms ease;
	}

	.preview-hero__title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
		transition: color 500ms ease;
	}

	.preview-hero__desc {
		font-size: 0.875rem;
		margin: 0 0 1.25rem 0;
		color: var(--text-secondary);
		transition: color 500ms ease;
	}

	.preview-hero__actions {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 300ms ease;
	}

	.btn--primary {
		border: none;
		background: var(--accent-primary);
		color: var(--color-text-on-primary, white);
	}

	.btn--primary:hover {
		box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-primary) 40%, transparent);
	}

	.btn--ghost {
		border: 1px solid var(--border-primary);
		background: transparent;
		color: var(--text-primary);
	}

	.btn--ghost:hover {
		border-color: var(--accent-primary);
		color: var(--accent-primary);
	}

	/* Preview Features */
	.preview-features {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
		padding: 0 1.25rem 1.5rem;
	}

	.feature-card {
		padding: 1rem;
		border-radius: 0.75rem;
		text-align: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border-primary);
		transition: background-color 500ms ease, border-color 500ms ease;
	}

	.feature-card__icon {
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
	}

	.feature-card__title {
		font-size: 0.75rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		color: var(--text-primary);
		transition: color 500ms ease;
	}

	.feature-card__desc {
		font-size: 0.625rem;
		color: var(--text-secondary);
		transition: color 500ms ease;
	}

	/* Footer */
	.showcase__footer {
		text-align: center;
		margin-top: 2rem;
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.05em;
		color: var(--text-tertiary);
		opacity: 0.5;
		transition: color 500ms ease;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.preview-nav__links span:not(:last-child):not(.preview-nav__cta) {
			display: none;
		}

		.preview-features {
			grid-template-columns: 1fr;
		}

		.preview-hero__actions {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}

		.controls {
			flex-direction: column;
		}
	}
</style>
