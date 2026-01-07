/**
 * SSR (Server-Side Rendering) helpers for GooTheme
 *
 * These functions generate HTML/CSS for server-side rendering of theme-aware pages.
 * They run in Node.js (Vite plugins, build scripts) and output HTML strings.
 *
 * @example
 * // In a Vite plugin or build script
 * import { generateBlockingThemeScript, generateThemeChooserHtml } from '@goobits/themes/server/goo'
 *
 * const html = `
 *   <head>
 *     ${generateBlockingThemeScript()}
 *   </head>
 *   <body>
 *     ${generateThemeChooserHtml({ base: 'dracula', mode: 'dark' })}
 *   </body>
 * `
 */

import { themePairs } from '../goo/presets.js'

// Re-export themePairs for SSR consumers
export { themePairs }

// ============================================================================
// Types
// ============================================================================

export interface ThemeChooserHtmlOptions {
	base?: string
	mode?: string
	hydrationModule?: string
}

export interface ThemeSelectHtmlOptions {
	base?: string
	mode?: string
	onChangeFunction?: string
}

export interface IconSvgOptions {
	size?: number
	noMargin?: boolean
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_BASE = 'dracula'
export const DEFAULT_MODE = 'dark'
export const THEME_BASE_COOKIE = 'goo-theme-base'
export const THEME_MODE_COOKIE = 'goo-theme-mode'

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Escape HTML special characters for safe interpolation
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str: string): string {
	if (typeof str !== 'string') return ''
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

/**
 * Convert theme name to title case label
 * @param {string} name - Theme name (e.g., 'dark-blue')
 * @returns {string} Label (e.g., 'Dark Blue')
 */
export function toTitleCase(name: string): string {
	return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ============================================================================
// Icon SVG Generation
// ============================================================================

// Lucide icon data (pre-extracted to avoid runtime dependency)
// These match the lucide library format: [[tag, attrs], ...]
const LUCIDE_ICONS = {
	Sun: [
		[ 'circle', { cx: '12', cy: '12', r: '4' } ],
		[ 'path', { d: 'M12 2v2' } ],
		[ 'path', { d: 'M12 20v2' } ],
		[ 'path', { d: 'm4.93 4.93 1.41 1.41' } ],
		[ 'path', { d: 'm17.66 17.66 1.41 1.41' } ],
		[ 'path', { d: 'M2 12h2' } ],
		[ 'path', { d: 'M20 12h2' } ],
		[ 'path', { d: 'm6.34 17.66-1.41 1.41' } ],
		[ 'path', { d: 'm19.07 4.93-1.41 1.41' } ]
	],
	Moon: [
		[ 'path', { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' } ]
	],
	ChevronDown: [
		[ 'path', { d: 'm6 9 6 6 6-6' } ]
	]
}

/**
 * Generate inline SVG string for an icon
 * @param {string} iconName - Icon name ('Sun', 'Moon', 'ChevronDown')
 * @param {object} [options] - Options
 * @param {number} [options.size=14] - Icon size in pixels
 * @param {boolean} [options.noMargin=false] - Remove margin-right style
 * @returns {string} SVG HTML string
 */
export function getIconSvg(iconName: string, options: IconSvgOptions = {}): string {
	const iconDef = LUCIDE_ICONS[iconName]
	if (!iconDef) return ''

	const size = options.size || 14
	const style = options.noMargin ? 'vertical-align:middle' : 'margin-right:6px;vertical-align:middle'

	const svgAttrs = `xmlns="http://www.w3.org/2000/svg" width="${ size }" height="${ size }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${ style }"`

	const childrenHtml = iconDef.map(child => {
		const [ tag, attrs ] = child
		const attrsStr = Object.entries(attrs || {})
			.map(([ k, v ]) => `${ k }="${ v }"`)
			.join(' ')
		return `<${ tag }${ attrsStr ? ' ' + attrsStr : '' }/>`
	}).join('')

	return `<svg ${ svgAttrs }>${ childrenHtml }</svg>`
}

// Pre-rendered icon SVGs for convenience
export const SUN_ICON_SVG = getIconSvg('Sun', { noMargin: true })
export const MOON_ICON_SVG = getIconSvg('Moon', { noMargin: true })
export const CHEVRON_DOWN_SVG = getIconSvg('ChevronDown', { noMargin: true, size: 16 })

// ============================================================================
// Blocking Theme Script (prevents flash)
// ============================================================================

/**
 * Generate a blocking script that sets CSS variables before any CSS loads.
 * This eliminates the "flash of wrong theme" by setting variables synchronously.
 *
 * Place this at the START of <head>, before any stylesheets.
 *
 * @returns {string} Script tag HTML
 */
export function generateBlockingThemeScript(): string {
	// Minified theme pairs data - only essential properties
	const minPairs: Record<string, Record<string, Record<string, string | boolean>>> = {}
	for (const [ baseName, modes ] of Object.entries(themePairs)) {
		minPairs[baseName] = {}
		for (const [ mode, theme ] of Object.entries(modes)) {
			minPairs[baseName][mode] = {
				bg: theme.bg,
				fg: theme.fg,
				accent: theme.accent,
				accentFg: theme.accentFg || '#ffffff',
				selected: theme.selected || theme.accent,
				selectedFg: theme.selectedFg || theme.accentFg || '#ffffff',
				border: theme.border,
				muted: theme.muted,
				dark: theme.scheme === 'dark',
				heading: theme.heading || theme.accent,
				secondary: theme.secondary || theme.accent,
				secondaryFg: theme.secondaryFg || '#ffffff',
				positive: theme.positive || '#22c55e',
				positiveFg: theme.positiveFg || '#000000',
				negative: theme.negative || '#ef4444',
				negativeFg: theme.negativeFg || '#ffffff',
				warning: theme.warning || '#f59e0b',
				warningFg: theme.warningFg || '#000000'
			}
		}
	}

	return `<script>(function(){
var mb=document.cookie.match(/sandbox-theme-base=([^;]+)/);
var mm=document.cookie.match(/sandbox-theme-mode=([^;]+)/);
var base=mb?mb[1]:'dracula';
var mode=mm?mm[1]:'dark';
var P=${ JSON.stringify(minPairs) };
var pair=P[base];
if(!pair)pair=P['dracula'];
var p=pair[mode];
if(!p)p=pair['dark']||pair['light'];
var r=document.documentElement;
r.dataset.themeBase=base;
r.dataset.themeMode=mode;
var s=r.style;
s.setProperty('--goo-theme-bg',p.bg);
s.setProperty('--goo-theme-fg',p.fg);
s.setProperty('--goo-theme-bg-elevated',p.bgElevated);
s.setProperty('--goo-theme-muted',p.muted);
s.setProperty('--goo-theme-border',p.border);
s.setProperty('--goo-theme-heading',p.heading);
s.setProperty('--goo-theme-accent',p.accent);
s.setProperty('--goo-theme-accent-fg',p.accentFg);
s.setProperty('--goo-theme-selected',p.selected);
s.setProperty('--goo-theme-selected-fg',p.selectedFg);
s.setProperty('--goo-theme-secondary',p.secondary);
s.setProperty('--goo-theme-secondary-fg',p.secondaryFg);
s.setProperty('--goo-theme-positive',p.positive);
s.setProperty('--goo-theme-positive-fg',p.positiveFg);
s.setProperty('--goo-theme-negative',p.negative);
s.setProperty('--goo-theme-negative-fg',p.negativeFg);
s.setProperty('--goo-theme-warning',p.warning);
s.setProperty('--goo-theme-warning-fg',p.warningFg);
s.setProperty('color-scheme',p.dark?'dark':'light');
})();<\/script>` // eslint-disable-line no-useless-escape
}

// ============================================================================
// Theme Chooser SSR
// ============================================================================

/**
 * Get critical CSS for SSR theme chooser.
 * This styles the goo-select trigger before JS hydrates it.
 *
 * Place this in <head> before </head>.
 *
 * @returns {string} Style tag HTML
 */
export function getThemeChooserCriticalCss(): string {
	return `<style id="ssr-goo-select-critical">
goo-select[data-ssr] {
	display: inline-block; position: relative; font-size: 1rem; line-height: 1; letter-spacing: 1px;
}
goo-select[data-ssr] .goo-select__trigger {
	display: flex; align-items: center; gap: 0.5rem; width: 100%;
	min-width: var(--goo-select-min-width, 10rem);
	padding: 0.5rem 0.75rem;
	background: var(--goo-theme-bg, rgba(0, 0, 0, 0.3));
	border: 1px solid var(--goo-theme-border, rgba(255, 255, 255, 0.1));
	border-radius: var(--goo-theme-radius-sm, 0.25rem);
	color: var(--goo-theme-fg, rgba(255, 255, 255, 0.9));
	font: inherit; text-align: left; cursor: pointer;
}
goo-select[data-ssr] .goo-select__trigger:hover {
	border-color: var(--goo-theme-secondary, var(--goo-theme-accent));
}
goo-select[data-ssr] .goo-select__trigger-icon { display: flex; align-items: center; flex-shrink: 0; }
goo-select[data-ssr] .goo-select__trigger-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
goo-select[data-ssr] .goo-select__trigger-arrow { display: flex; align-items: center; justify-content: center; width: 1rem; height: 1rem; color: var(--goo-theme-muted, rgba(255, 255, 255, 0.5)); }
goo-select[data-ssr] .goo-select__trigger-arrow svg { width: 1rem; height: 1rem; }
goo-button.theme-mode-toggle[data-ssr] {
	display: inline-flex; align-items: center; justify-content: center;
	width: var(--goo-theme-control-height, 32px); height: var(--goo-theme-control-height, 32px);
	aspect-ratio: 1; padding: 0;
	background: var(--goo-theme-bg-elevated, rgba(0, 0, 0, 0.3));
	border: 1px solid var(--goo-theme-border, rgba(255, 255, 255, 0.1));
	border-radius: var(--goo-theme-radius-md, 6px);
	color: var(--goo-theme-fg, rgba(255, 255, 255, 0.9));
	cursor: pointer; transition: all 0.15s ease;
}
goo-button.theme-mode-toggle[data-ssr]:hover {
	border-color: var(--goo-theme-accent);
	background: var(--goo-theme-bg-hover, color-mix(in srgb, var(--goo-theme-fg) 10%, transparent));
}
</style>`
}

/**
 * Create a color swatch HTML for theme dropdown
 * @param {string} color - Hex color
 * @returns {string} HTML string
 */
export function createColorSwatch(color: string): string {
	return `<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${ color };vertical-align:middle;border:1px solid rgba(255,255,255,0.2);flex-shrink:0"></span>`
}

/**
 * Generate pre-rendered theme chooser HTML for SSR.
 * Renders a toggle button (sun/moon) + GooSelect dropdown.
 *
 * The HTML is designed to be hydrated by the client-side theme-chooser.js module.
 *
 * @param {object} [options] - Options
 * @param {string} [options.base] - Base theme name (from cookie)
 * @param {string} [options.mode] - Theme mode ('dark' or 'light')
 * @param {string} [options.hydrationModule] - Path to hydration module (default: '/sandbox/_shared/theme-chooser.js')
 * @returns {string} HTML string
 */
export function generateThemeChooserHtml(options: ThemeChooserHtmlOptions = {}): string {
	const base = (options.base && themePairs[options.base]) ? options.base : DEFAULT_BASE
	const mode = options.mode === 'light' ? 'light' : DEFAULT_MODE
	const hydrationModule = options.hydrationModule || '/sandbox/_shared/theme-chooser.js'

	const pair = themePairs[base]
	const themeData = pair?.[mode] || pair?.dark
	const themeLabel = toTitleCase(base)
	const themeAccent = themeData?.accent || '#3b82f6'
	const isLightMode = mode === 'light'

	// Use correct icon based on mode
	const themeIcon = isLightMode ? SUN_ICON_SVG : MOON_ICON_SVG

	// Build accents JSON for hydration script
	const accentsJson = JSON.stringify(
		Object.fromEntries(Object.entries(themePairs).map(([ k, v ]) => [ k, v.dark?.accent || v.light?.accent ]))
	)

	// Color swatch for trigger
	const swatchHtml = createColorSwatch(themeAccent)

	return `
		<div class="theme-chooser-container" style="display:flex;align-items:center;gap:8px">
			<goo-button class="theme-mode-toggle" square data-ssr title="Toggle light/dark mode">${ themeIcon }</goo-button>
			<goo-select class="theme-chooser" data-ssr>
				<button class="goo-select__trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
					<span class="goo-select__trigger-icon">${ swatchHtml }</span>
					<span class="goo-select__trigger-label">${ escapeHtml(themeLabel) }</span>
					<span class="goo-select__trigger-arrow">${ CHEVRON_DOWN_SVG }</span>
				</button>
			</goo-select>
		</div>
		<script>(function(){
			var mb=document.cookie.match(/sandbox-theme-base=([^;]+)/);
			var mm=document.cookie.match(/sandbox-theme-mode=([^;]+)/);
			var base=mb?mb[1]:'dracula';
			var mode=mm?mm[1]:'dark';
			var label=base.split('-').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1)}).join(' ');
			var el=document.querySelector('.theme-chooser .goo-select__trigger-label');
			if(el)el.textContent=label;
			var accents=${ accentsJson };
			var swatchEl=document.querySelector('.theme-chooser .goo-select__trigger-icon span');
			if(swatchEl&&accents[base])swatchEl.style.background=accents[base];
			var toggleEl=document.querySelector('.theme-mode-toggle');
			var sunSvg='${ SUN_ICON_SVG.replace(/'/g, "\\'") }';
			var moonSvg='${ MOON_ICON_SVG.replace(/'/g, "\\'") }';
			if(toggleEl)toggleEl.innerHTML=mode==='light'?sunSvg:moonSvg;
		})();<\/script>${ /* eslint-disable-line no-useless-escape */'' }
		<script type="module">
			import { initTheme, createThemeChooser } from '${ hydrationModule }'
			initTheme()
			var container=document.querySelector('.theme-chooser-container')
			var ssrToggle=container?.querySelector('goo-button.theme-mode-toggle')
			var ssrSelect=container?.querySelector('goo-select.theme-chooser')
			var ssrCss=document.getElementById('ssr-goo-select-critical')
			if(container&&ssrSelect){
				var chooser=createThemeChooser()
				if(ssrToggle)ssrToggle.remove()
				ssrSelect.replaceWith(chooser)
				if(ssrCss)ssrCss.remove()
			}
		<\/script>` // eslint-disable-line no-useless-escape
}

/**
 * Generate a simple theme select dropdown HTML (no toggle button).
 * Useful for simpler UIs like the dev index page.
 *
 * @param {object} [options] - Options
 * @param {string} [options.base] - Current base theme
 * @param {string} [options.mode] - Current mode
 * @param {string} [options.onChangeFunction] - Name of JS function to call on change
 * @returns {string} HTML string
 */
export function generateThemeSelectHtml(options: ThemeSelectHtmlOptions = {}): string {
	const base = options.base || DEFAULT_BASE
	const onChangeFunction = options.onChangeFunction || 'setThemeBase'

	const themeOptions = Object.keys(themePairs).map(baseName => {
		const label = toTitleCase(baseName)
		const selected = baseName === base ? ' selected' : ''
		return `<option value="${ baseName }"${ selected }>${ label }</option>`
	}).join('\n\t\t\t\t\t\t')

	return `<select id="themeSelect" onchange="${ onChangeFunction }(this.value)">
							${ themeOptions }
						</select>`
}
