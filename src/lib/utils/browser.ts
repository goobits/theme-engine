/**
 * Browser environment detection and safe DOM access utilities.
 *
 * Provides type-safe helpers for checking browser availability and accessing
 * browser-specific globals (window, document) with proper SSR handling.
 * These utilities consolidate the common pattern of checking `browser` and
 * `typeof window/document !== 'undefined'` that appears throughout the codebase.
 *
 * @example
 * ```typescript
 * import { isBrowser, safeWindow, runInBrowser } from './utils/browser';
 *
 * // Check if in browser environment
 * if (isBrowser()) {
 *   console.log('Running in browser');
 * }
 *
 * // Safely access window
 * const win = safeWindow();
 * if (win) {
 *   console.log('Window size:', win.innerWidth);
 * }
 *
 * // Execute callback only in browser
 * const result = runInBrowser(() => localStorage.getItem('key'));
 * ```
 */

import { browser } from '$app/environment'

/**
 * Check if code is running in a browser environment.
 *
 * Verifies both the SvelteKit `browser` flag and the availability
 * of the global `window` object. This is the most reliable check
 * for browser environment across all scenarios.
 *
 * @returns True if running in browser, false otherwise
 *
 * @example
 * ```typescript
 * import { isBrowser } from './utils/browser';
 *
 * if (isBrowser()) {
 *   // Safe to use window, document, localStorage, etc.
 *   document.title = 'My App';
 * }
 * ```
 *
 * @remarks
 * - Returns `false` during SSR (server-side rendering)
 * - Returns `false` during SSG (static site generation)
 * - Returns `true` in actual browser environments
 */
export function isBrowser(): boolean {
	return browser && typeof window !== 'undefined'
}

/**
 * Safely access the global window object.
 *
 * Returns the window object if in browser environment, or undefined
 * if running on the server. Use this instead of directly accessing
 * `window` to avoid SSR errors.
 *
 * @returns The window object if in browser, undefined otherwise
 *
 * @example
 * ```typescript
 * import { safeWindow } from './utils/browser';
 *
 * const win = safeWindow();
 * if (win) {
 *   console.log('Screen width:', win.screen.width);
 *   console.log('Location:', win.location.href);
 * }
 * ```
 *
 * @remarks
 * - Always check the return value before using window APIs
 * - Returns `undefined` during SSR to prevent runtime errors
 */
export function safeWindow(): Window | undefined {
	if (!browser || typeof window === 'undefined') return undefined
	return window
}

/**
 * Safely access the global document object.
 *
 * Returns the document object if in browser environment, or undefined
 * if running on the server. Use this instead of directly accessing
 * `document` to avoid SSR errors.
 *
 * @returns The document object if in browser, undefined otherwise
 *
 * @example
 * ```typescript
 * import { safeDocument } from './utils/browser';
 *
 * const doc = safeDocument();
 * if (doc) {
 *   doc.title = 'New Page Title';
 *   const el = doc.querySelector('.theme-toggle');
 * }
 * ```
 *
 * @remarks
 * - Always check the return value before using document APIs
 * - Returns `undefined` during SSR to prevent runtime errors
 */
export function safeDocument(): Document | undefined {
	if (!browser || typeof document === 'undefined') return undefined
	return document
}

/**
 * Safely access the document root element (html tag).
 *
 * Returns document.documentElement if in browser environment,
 * or undefined if running on the server. Useful for accessing
 * or modifying the root HTML element safely.
 *
 * @returns The HTMLElement (html tag) if in browser, undefined otherwise
 *
 * @example
 * ```typescript
 * import { getHtmlElement } from './utils/browser';
 *
 * const html = getHtmlElement();
 * if (html) {
 *   html.setAttribute('data-theme', 'dark');
 *   html.classList.add('theme-transition');
 * }
 * ```
 *
 * @remarks
 * - Always check the return value before modifying attributes
 * - Returns `undefined` during SSR to prevent runtime errors
 * - Commonly used for setting theme attributes on the root element
 */
export function getHtmlElement(): HTMLElement | undefined {
	if (!browser || typeof document === 'undefined') return undefined
	return document.documentElement
}

/**
 * Execute a callback function only in browser environment.
 *
 * Runs the provided callback and returns its result if in browser,
 * or returns undefined if on the server. This is useful for wrapping
 * browser-only operations in a concise, type-safe way.
 *
 * @param callback - Function to execute in browser environment
 * @returns The callback's return value if in browser, undefined otherwise
 *
 * @example
 * ```typescript
 * import { runInBrowser } from './utils/browser';
 *
 * // Get localStorage value safely
 * const theme = runInBrowser(() => localStorage.getItem('theme'));
 * console.log(theme); // string | null | undefined
 *
 * // Execute side effect in browser only
 * runInBrowser(() => {
 *   document.body.classList.add('loaded');
 *   console.log('Page loaded!');
 * });
 *
 * // With complex return type
 * const dimensions = runInBrowser(() => ({
 *   width: window.innerWidth,
 *   height: window.innerHeight
 * }));
 * ```
 *
 * @remarks
 * - Callback is not executed during SSR
 * - Generic type T is inferred from callback return type
 * - Handle the potential undefined return value appropriately
 */
export function runInBrowser<T>(callback: () => T): T | undefined {
	if (!browser) return undefined
	return callback()
}

/**
 * Guard function that returns early with a fallback if not in browser.
 *
 * Returns the fallback value when NOT in browser environment,
 * or null when IN browser. This is designed for guard clauses
 * that need to return early from functions during SSR.
 *
 * @param fallback - Value to return if not in browser environment
 * @returns The fallback value if not in browser, null if in browser
 *
 * @example
 * ```typescript
 * import { requireBrowser } from './utils/browser';
 *
 * function getThemeFromDOM(): string | null {
 *   // Early return with fallback during SSR
 *   const guard = requireBrowser(null);
 *   if (guard !== null) return guard;
 *
 *   // Browser-only code continues here
 *   return document.documentElement.getAttribute('data-theme');
 * }
 *
 * function getUserPreferences(): UserPrefs {
 *   // Return default object during SSR
 *   const guard = requireBrowser({ theme: 'system', lang: 'en' });
 *   if (guard !== null) return guard;
 *
 *   // Browser-only code to read from localStorage
 *   return JSON.parse(localStorage.getItem('prefs') || '{}');
 * }
 * ```
 *
 * @remarks
 * - Use this in guard clauses at the start of functions
 * - Pattern: `if (requireBrowser(fallback) !== null) return fallback;`
 * - Returns `null` in browser to signal "continue execution"
 * - Returns the fallback value during SSR to signal "return early"
 */
export function requireBrowser<T>(fallback: T): T | null {
	if (!browser) return fallback
	return null
}
