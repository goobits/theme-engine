import type { Handle } from '@sveltejs/kit'

import type { ThemeConfig } from '../core/config.js'
import { resolveTheme } from '../core/constants.js'
import type { ThemeMode, ThemeScheme } from '../core/schemeRegistry.js'
import {
	createThemeBlockingScriptTag,
	themeBlockingScript,
	themeBlockingScriptMarker
} from './blockingScript.js'
import { loadThemePreferences } from './preferences.js'

/**
 * Theme preferences interface for extending App.Locals
 *
 * @example
 * ```typescript
 * // In your app.d.ts:
 * import type { ThemeLocals } from '@goobits/themes/server';
 *
 * declare global {
 *   namespace App {
 *     interface Locals extends ThemeLocals {}
 *   }
 * }
 * ```
 */
export interface ThemeLocals {
	themePreferences: {
		theme: ThemeMode
		themeScheme: ThemeScheme
	}
}

export type ThemeBlockingScriptOption =
	| boolean
	| {
		enabled?: boolean
		nonce?: string
		marker?: string
	}

export interface ThemeHooksOptions {
	blockingScript?: ThemeBlockingScriptOption
}

interface ResolvedBlockingScriptOptions {
	enabled: boolean
	nonce?: string
	marker: string
}

/**
 * Escapes special HTML characters to prevent XSS attacks.
 * Used to sanitize theme values before injection into HTML.
 */
function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

/**
 * Create server-side theme hooks for SvelteKit integration.
 *
 * This function generates a SvelteKit Handle that manages theme application on the server side.
 * It pre-injects theme classes and data attributes into HTML during server-side rendering,
 * preventing flash of unstyled content (FOUC) and ensuring themes are applied before the page
 * becomes interactive. This is critical for a seamless user experience, especially when the user
 * has a stored theme preference that differs from the OS default.
 *
 * The transform hook:
 * 1. Loads user's saved theme preferences from cookies/headers
 * 2. Populates event.locals.themePreferences for downstream access
 * 3. Injects appropriate CSS class names into the <html> tag
 * 4. Adds data-theme attribute for CSS variable resolution
 * 5. Attempts to detect system theme preference from request headers
 *
 * @param config - Theme configuration object containing available schemes and optional route themes.
 *                 Typically created with {@link createThemeConfig}
 * @returns An object containing a 'transform' property with the SvelteKit Handle function
 *
 * @example
 * ```typescript
 * // In hooks.server.ts
 * import { createThemeHooks } from '$lib/server/hooks';
 * import { themeConfig } from '$lib/config';
 *
 * const themeHooks = createThemeHooks(themeConfig);
 *
 * export const handle = themeHooks.transform;
 * // or combine with other hooks:
 * // export const handle = sequence(themeHooks.transform, otherHook);
 *
 * // In +layout.server.ts - preferences are now auto-populated!
 * export function load({ locals }) {
 *   return { preferences: locals.themePreferences };
 * }
 * ```
 *
 * @remarks
 * - Must be registered in your SvelteKit hooks.server.ts or hooks.client.ts
 * - Automatically populates event.locals.themePreferences for use in load functions
 * - Uses 'sec-ch-prefers-color-scheme' header for system theme detection when available
 * - Falls back to user-agent detection for older browsers without the preference header
 * - Injects classes like 'theme-light', 'theme-dark', 'scheme-default', 'theme-system-light', etc.
 * - Injects data-theme="light" or data-theme="dark" for CSS targeting
 * - Must be combined with other hooks using SvelteKit's sequence() if you have multiple hooks
 * - Optionally injects a blocking script to prevent flash when theme is "system"
 *
 * @see {@link applyThemeWithScheme} for client-side theme application
 * @see {@link createThemeConfig} for configuration setup
 * @see {@link ThemeLocals} for TypeScript type definitions
 */
export function createThemeHooks(
	config: ThemeConfig,
	{ blockingScript = true }: ThemeHooksOptions = {}
): { transform: Handle } {
	const blockingScriptOptions = resolveBlockingScriptOptions(blockingScript)

	const themeTransform: Handle = async({ event, resolve }) => {
		const preferences = loadThemePreferences(event.cookies, config)

		// Populate event.locals for downstream access
		// This allows +layout.server.ts to access preferences without calling loadThemePreferences again
		const locals = event.locals as ThemeLocals
		locals.themePreferences = preferences

		const response = await resolve(event, {
			transformPageChunk: ({ html }) => {
				// Sanitize theme values before injection to prevent XSS
				const safeTheme = escapeHtml(preferences.theme)
				const safeScheme = escapeHtml(preferences.themeScheme)

				let themeClasses = `theme-${ safeTheme } scheme-${ safeScheme }`

				// Detect dark mode preference for system theme
				let prefersDark = false
				if (preferences.theme === 'system') {
					const prefersColorScheme = event.request.headers.get(
						'sec-ch-prefers-color-scheme'
					)
					const userAgent = event.request.headers.get('user-agent')?.toLowerCase() || ''

					prefersDark =
						prefersColorScheme === 'dark' || userAgent.includes('dark') || false
					themeClasses += prefersDark ? ' theme-system-dark' : ' theme-system-light'
				}

				// Resolve theme using shared utility
				const resolved = resolveTheme(preferences.theme, prefersDark)

				// Replace theme class placeholder
				let result = html.replace('%sveltekit.theme%', themeClasses)

				// Inject data-theme attribute into <html> tag
				// This adds data-theme="light" or data-theme="dark" based on resolved theme
				const safeResolved = escapeHtml(resolved)
				result = result.replace(
					/<html([\s\S]*?)>/i,
					`<html$1 data-theme="${ safeResolved }">`
				)

				// Inject blocking script if enabled and not already present
				if (blockingScriptOptions.enabled && !hasBlockingScript(result, blockingScriptOptions)) {
					result = injectBlockingScript(result, blockingScriptOptions)
				}

				return result
			}
		})

		return response
	}

	return {
		transform: themeTransform
	}
}

function resolveBlockingScriptOptions(
	blockingScript: ThemeBlockingScriptOption
): ResolvedBlockingScriptOptions {
	if (typeof blockingScript === 'boolean') {
		return {
			enabled: blockingScript,
			marker: themeBlockingScriptMarker
		}
	}

	return {
		enabled: blockingScript?.enabled ?? true,
		nonce: blockingScript?.nonce,
		marker: blockingScript?.marker ?? themeBlockingScriptMarker
	}
}

function hasBlockingScript(
	html: string,
	{ marker }: ResolvedBlockingScriptOptions
): boolean {
	if (marker && html.includes(marker)) {
		return true
	}

	return html.includes(themeBlockingScript)
}

function injectBlockingScript(
	html: string,
	{ nonce, marker }: ResolvedBlockingScriptOptions
): string {
	const scriptTag = createThemeBlockingScriptTag({ nonce, marker })

	if (html.includes('%sveltekit.head%')) {
		return html.replace('%sveltekit.head%', `${ scriptTag }%sveltekit.head%`)
	}

	if (/<head[\s\S]*?>/i.test(html)) {
		return html.replace(/<head([\s\S]*?)>/i, `<head$1>${ scriptTag }`)
	}

	return `${ scriptTag }${ html }`
}
