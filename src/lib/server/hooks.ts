import type { Handle } from '@sveltejs/kit';
import { loadThemePreferences } from './preferences';
import { resolveTheme } from '../core/constants';
import type { ThemeConfig } from '../core/config';

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
        .replace(/'/g, '&#039;');
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
 * The hook:
 * 1. Loads user's saved theme preferences from cookies/headers
 * 2. Injects appropriate CSS class names into the <html> tag
 * 3. Adds data-theme attribute for CSS variable resolution
 * 4. Attempts to detect system theme preference from request headers
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
 * ```
 *
 * @remarks
 * - Must be registered in your SvelteKit hooks.server.ts or hooks.client.ts
 * - Uses 'sec-ch-prefers-color-scheme' header for system theme detection when available
 * - Falls back to user-agent detection for older browsers without the preference header
 * - Injects classes like 'theme-light', 'theme-dark', 'scheme-default', 'theme-system-light', etc.
 * - Injects data-theme="light" or data-theme="dark" for CSS targeting
 * - Must be combined with other hooks using SvelteKit's sequence() if you have multiple hooks
 *
 * @see {@link applyThemeWithScheme} for client-side theme application
 * @see {@link createThemeConfig} for configuration setup
 */
export function createThemeHooks(config: ThemeConfig): { transform: Handle } {
    const themeTransform: Handle = async ({ event, resolve }) => {
        const preferences = loadThemePreferences(event.cookies, config);

        const response = await resolve(event, {
            transformPageChunk: ({ html }) => {
                // Sanitize theme values before injection to prevent XSS
                const safeTheme = escapeHtml(preferences.theme);
                const safeScheme = escapeHtml(preferences.themeScheme);

                let themeClasses = `theme-${safeTheme} scheme-${safeScheme}`;

                // Detect dark mode preference for system theme
                let prefersDark = false;
                if (preferences.theme === 'system') {
                    const prefersColorScheme = event.request.headers.get(
                        'sec-ch-prefers-color-scheme'
                    );
                    const userAgent = event.request.headers.get('user-agent')?.toLowerCase() || '';

                    prefersDark =
                        prefersColorScheme === 'dark' || userAgent.includes('dark') || false;
                    themeClasses += prefersDark ? ' theme-system-dark' : ' theme-system-light';
                }

                // Resolve theme using shared utility
                const resolved = resolveTheme(preferences.theme, prefersDark);

                // Replace theme class placeholder
                let result = html.replace('%sveltekit.theme%', themeClasses);

                // Inject data-theme attribute into <html> tag
                // This adds data-theme="light" or data-theme="dark" based on resolved theme
                const safeResolved = escapeHtml(resolved);
                result = result.replace(
                    /<html([\s\S]*?)>/i,
                    `<html$1 data-theme="${safeResolved}">`
                );

                return result;
            },
        });

        return response;
    };

    return {
        transform: themeTransform,
    };
}
