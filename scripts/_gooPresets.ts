import { themePairs } from '../src/lib/goo/presets.js'

type ThemePair = (typeof themePairs)[string]
type ThemeMode = 'light' | 'dark'

const DEFAULT_PRESET_NAMES = [ 'neutral', 'blue', 'dracula', 'purple' ]

const toSchemeName = (base: string): string => `goo-${ base }`

const buildThemeBlock = (scheme: string, mode: ThemeMode, theme: ThemePair[ThemeMode]): string => {
	const selectors = [
		`:root.theme-${ mode }.scheme-${ scheme }`,
		`:root.theme-system-${ mode }.scheme-${ scheme }`
	]

	const lines = [
		`${ selectors.join(',\n') } {`,
		`\t--goo-theme-bg: ${ theme.bg };`,
		`\t--goo-theme-fg: ${ theme.fg };`,
		`\t--goo-theme-bg-elevated: ${ theme.bgElevated };`,
		`\t--goo-theme-muted: ${ theme.muted };`,
		`\t--goo-theme-border: ${ theme.border };`,
		`\t--goo-theme-heading: ${ theme.heading };`,
		`\t--goo-theme-accent: ${ theme.accent };`,
		`\t--goo-theme-accent-fg: ${ theme.accentFg };`,
		`\t--goo-theme-selected: ${ theme.selected };`,
		`\t--goo-theme-selected-fg: ${ theme.selectedFg };`,
		`\t--goo-theme-secondary: ${ theme.secondary };`,
		`\t--goo-theme-secondary-fg: ${ theme.secondaryFg };`,
		`\t--goo-theme-positive: ${ theme.positive };`,
		`\t--goo-theme-positive-fg: ${ theme.positiveFg };`,
		`\t--goo-theme-negative: ${ theme.negative };`,
		`\t--goo-theme-negative-fg: ${ theme.negativeFg };`,
		`\t--goo-theme-warning: ${ theme.warning };`,
		`\t--goo-theme-warning-fg: ${ theme.warningFg };`,
		'\t--bg-primary: var(--goo-theme-bg);',
		'\t--bg-secondary: var(--goo-theme-bg-elevated);',
		'\t--bg-tertiary: var(--goo-theme-bg-elevated);',
		'\t--text-primary: var(--goo-theme-fg);',
		'\t--text-secondary: var(--goo-theme-muted);',
		'\t--border-primary: var(--goo-theme-border);',
		'\t--scheme-accent-primary: var(--goo-theme-accent);',
		'\t--scheme-accent-secondary: var(--goo-theme-secondary);',
		'\t--scheme-accent-glow: var(--goo-theme-accent);',
		'\t--accent-primary: var(--scheme-accent-primary);',
		'\t--accent-glow: var(--scheme-accent-glow);',
		'\t--accent-soft: color-mix(in srgb, var(--scheme-accent-primary) 18%, transparent);',
		'\t--success: var(--goo-theme-positive);',
		'\t--success-border: var(--goo-theme-positive);',
		'\t--success-bg: color-mix(in srgb, var(--goo-theme-positive) 15%, transparent);',
		'\t--error: var(--goo-theme-negative);',
		'\t--error-border: var(--goo-theme-negative);',
		'\t--error-bg: color-mix(in srgb, var(--goo-theme-negative) 15%, transparent);',
		'\t--warning: var(--goo-theme-warning);',
		'\t--warning-border: var(--goo-theme-warning);',
		'\t--warning-bg: color-mix(in srgb, var(--goo-theme-warning) 15%, transparent);',
		`\tcolor-scheme: ${ theme.scheme };`,
		'}',
		''
	]

	return lines.join('\n')
}

const buildPresetCss = (base: string, modes: ThemePair): string => {
	const scheme = toSchemeName(base)
	const light = buildThemeBlock(scheme, 'light', modes.light)
	const dark = buildThemeBlock(scheme, 'dark', modes.dark)
	return `${ light }\n${ dark }`
}

const buildIndexCss = (presets: string[]): string =>
	[
		'@import \'./base.css\';',
		...presets.map(name => `@import './presets/${ name }.css';`)
	].join('\n') + '\n'

const buildBundleCss = (presets: string[]): string =>
	[
		'@import \'./base.css\';',
		...presets.map(name => `@import './presets/${ name }.css';`)
	].join('\n') + '\n'

export const buildGooPresetFiles = (): Record<string, string> => {
	const files: Record<string, string> = {}
	const presetNames = Object.keys(themePairs).sort()

	files['themes/goo/pairs.json'] = JSON.stringify(themePairs, null, '\t') + '\n'
	files['themes/goo/index.css'] = buildIndexCss(
		DEFAULT_PRESET_NAMES.filter(name => presetNames.includes(name))
	)
	files['themes/goo/bundle.css'] = buildBundleCss(presetNames)

	for (const [ base, modes ] of Object.entries(themePairs)) {
		files[`themes/goo/presets/${ base }.css`] = buildPresetCss(base, modes)
	}

	return files
}
