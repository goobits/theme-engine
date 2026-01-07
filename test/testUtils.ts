/**
 * Shared Test Utilities
 *
 * Consolidates duplicated test mock functions and utilities used across
 * multiple test files. This reduces code duplication and ensures consistency
 * in test setup and mocking patterns.
 *
 * @module testUtils
 */

import { vi } from 'vitest'

import type { ThemeConfig } from '../src/lib/core/config'
import type { SchemeConfig, ThemeMode, ThemeScheme } from '../src/lib/core/types'
import type { ThemeStore } from '../src/lib/svelte/stores/theme.svelte'
import type { RouteThemeConfig } from '../src/lib/utils/routeThemes'

/**
 * Options for creating a mock theme store
 */
export interface MockThemeStoreOptions {

	/** Theme mode (light, dark, or system). Defaults to 'system' */
	theme?: ThemeMode

	/** Color scheme identifier. Defaults to 'default' */
	scheme?: ThemeScheme

	/** Custom list of available schemes. Defaults to default and spells schemes */
	availableSchemes?: SchemeConfig[]
}

/**
 * Create a mock ThemeStore for testing components.
 *
 * Consolidates duplicate implementations across test files:
 * - ThemeProvider.test.ts
 * - ThemeToggle.test.ts
 * - SchemeSelector.test.ts
 *
 * @param options - Configuration options for the mock store
 * @returns A mocked ThemeStore with vi.fn() for all methods
 *
 * @example
 * ```typescript
 * const store = createMockThemeStore({
 *   theme: 'dark',
 *   scheme: 'spells'
 * });
 *
 * expect(store.theme).toBe('dark');
 * expect(store.scheme).toBe('spells');
 * ```
 */
export function createMockThemeStore(options: MockThemeStoreOptions = {}): ThemeStore {
	const {
		theme = 'system',
		scheme = 'default',
		availableSchemes = [
			{
				name: 'default',
				displayName: 'Default',
				description: 'Default theme',
				preview: { primary: '#000', accent: '#fff', background: '#fff' }
			},
			{
				name: 'spells',
				displayName: 'Spells',
				description: 'Spells theme',
				preview: { primary: '#000', accent: '#fff', background: '#fff' }
			}
		]
	} = options

	return {
		subscribe: vi.fn(),
		settings: { theme, themeScheme: scheme },
		theme,
		scheme,
		availableSchemes,
		setTheme: vi.fn(),
		setScheme: vi.fn(),
		cycleMode: vi.fn()
	}
}

/**
 * Options for creating mock config
 */
export interface MockConfigOptions {

	/** Route-specific theme configurations */
	routeThemes?: Record<string, RouteThemeConfig>

	/** Custom schemes configuration. Defaults to default and spells schemes */
	schemes?: Record<string, SchemeConfig>
}

/**
 * Create a mock ThemeConfig for testing.
 *
 * Provides a valid ThemeConfig object with sensible defaults for testing
 * configuration handling and validation.
 *
 * @param options - Configuration options
 * @returns A mock ThemeConfig object
 *
 * @example
 * ```typescript
 * const config = createMockConfig({
 *   routeThemes: {
 *     '/admin': { theme: 'dark', themeScheme: 'default' }
 *   }
 * });
 * ```
 */
export function createMockConfig(options: MockConfigOptions = {}): ThemeConfig {
	const {
		routeThemes,
		schemes = {
			default: {
				name: 'default',
				displayName: 'Default',
				description: 'Default theme',
				preview: {
					primary: '#000',
					accent: '#fff',
					background: '#fff'
				}
			},
			spells: {
				name: 'spells',
				displayName: 'Spells',
				description: 'Spells theme',
				preview: {
					primary: '#purple',
					accent: '#gold',
					background: '#dark'
				}
			}
		}
	} = options

	return {
		schemes,
		...(routeThemes && { routeThemes })
	}
}

/**
 * Mock the browser environment variable.
 *
 * Useful for testing SSR vs client-side behavior. Uses dynamic import
 * mocking to override the $app/environment module.
 *
 * @param isBrowser - Whether to mock as browser (true) or server (false)
 * @returns Promise that resolves when mock is set up
 *
 * @example
 * ```typescript
 * await mockBrowserEnvironment(true); // Simulate browser
 * // Test browser-specific code
 *
 * await mockBrowserEnvironment(false); // Simulate SSR
 * // Test server-side code
 * ```
 */
export async function mockBrowserEnvironment(isBrowser: boolean): Promise<void> {
	vi.doMock('$app/environment', () => ({
		browser: isBrowser
	}))
}

/**
 * Mock window.matchMedia for testing system theme detection.
 *
 * Creates a mock implementation of window.matchMedia that can be used to
 * simulate user's system theme preference.
 *
 * @param prefersDark - Whether the system prefers dark mode
 *
 * @example
 * ```typescript
 * mockMatchMedia(true); // Simulate dark mode preference
 * // Test code that uses prefers-color-scheme
 *
 * mockMatchMedia(false); // Simulate light mode preference
 * // Test code that defaults to light
 * ```
 */
export function mockMatchMedia(prefersDark: boolean): void {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: query === '(prefers-color-scheme: dark)' ? prefersDark : !prefersDark,
			media: query,
			onchange: null,
			addListener: vi.fn(), // Deprecated
			removeListener: vi.fn(), // Deprecated
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		}))
	})
}

/**
 * Mock document.cookie for testing cookie utilities.
 *
 * Replaces document.cookie with a mock implementation that can be read from
 * and written to for testing cookie-based functionality.
 *
 * @param cookieString - Initial cookie string (e.g., "theme=dark; themeScheme=spells")
 *
 * @example
 * ```typescript
 * mockDocumentCookie('theme=dark; themeScheme=default');
 * // Test cookie reading/writing
 * ```
 */
export function mockDocumentCookie(cookieString: string): void {
	let mockCookie = cookieString

	Object.defineProperty(document, 'cookie', {
		writable: true,
		value: mockCookie,
		get: () => mockCookie,
		set: (value: string) => {
			mockCookie = value
		}
	})
}

/**
 * Reset all DOM mocks.
 *
 * Cleans up mocks for window.matchMedia and document.cookie to ensure
 * tests don't interfere with each other.
 *
 * @example
 * ```typescript
 * beforeEach(() => {
 *   mockMatchMedia(true);
 *   mockDocumentCookie('');
 * });
 *
 * afterEach(() => {
 *   resetDOMMocks();
 * });
 * ```
 */
export function resetDOMMocks(): void {
	// Reset matchMedia
	if (typeof window !== 'undefined' && window.matchMedia) {
		const mutableWindow = window as Window & { matchMedia?: typeof window.matchMedia }
		delete mutableWindow.matchMedia
	}

	// Reset document.cookie
	if (typeof document !== 'undefined') {
		Object.defineProperty(document, 'cookie', {
			writable: true,
			value: ''
		})
	}
}
