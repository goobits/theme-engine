/**
 * Tests for Server-side SSR Hooks
 */

import type { Cookies,RequestEvent } from '@sveltejs/kit'
import { beforeEach,describe, expect, it, vi } from 'vitest'

import type { ThemeConfig } from '../core/config'
import type { ThemeScheme } from '../core/schemeRegistry'
import { themeBlockingScript, themeBlockingScriptMarker } from './blockingScript'
import { createThemeHooks } from './hooks'
import * as preferences from './preferences'

// Mock loadThemePreferences
vi.mock('./preferences', () => ({
	loadThemePreferences: vi.fn()
}))

// Helper to create mock RequestEvent
function createMockRequestEvent(
	headers: Record<string, string> = {},
	cookieValues: Record<string, string> = {}
): RequestEvent {
	const mockCookies: Cookies = {
		get: vi.fn((name: string) => cookieValues[name]),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn(),
		getAll: vi.fn()
	} as unknown as Cookies

	return {
		request: {
			headers: {
				get: vi.fn((name: string) => headers[name.toLowerCase()] || null)
			}
		},
		cookies: mockCookies,
		locals: {} as any
	} as unknown as RequestEvent
}

// Helper to create mock ThemeConfig
function createMockConfig(schemes: string[] = [ 'default' ]): ThemeConfig {
	const schemesObj: ThemeConfig['schemes'] = {}
	schemes.forEach(schemeName => {
		schemesObj[schemeName] = {
			name: schemeName,
			displayName: schemeName.charAt(0).toUpperCase() + schemeName.slice(1),
			description: `${ schemeName } theme`,
			preview: {
				primary: '#3b82f6',
				accent: '#8b5cf6',
				background: '#ffffff'
			}
		}
	})
	return { schemes: schemesObj }
}

describe('createThemeHooks', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('HTML transformation with placeholder', () => {
		it('should replace %sveltekit.theme% placeholder with theme classes', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"><body></body></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-light scheme-default')
			expect(result.body).not.toContain('%sveltekit.theme%')
		})

		it('should handle HTML without placeholder', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html><body>No placeholder here</body></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toBe(
				'<html data-theme="dark"><body>No placeholder here</body></html>'
			)
		})

		it('should handle multiple occurrences of placeholder', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html =
					'<html class="%sveltekit.theme%"><body class="%sveltekit.theme%"></body></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			// Only first occurrence should be replaced (string.replace replaces first match)
			const occurrences = (
				(result.body as unknown as string).match(/theme-light scheme-default/g) || []
			).length
			expect(occurrences).toBe(1)
		})

		it('should handle empty HTML', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = ''
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toBe('')
		})
	})

	describe('blocking script injection', () => {
		it('should inject blocking script in head by default', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config)
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html><head>%sveltekit.head%</head><body></body></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain(themeBlockingScriptMarker)
			expect(result.body).toContain(themeBlockingScript)
		})

		it('should not inject when disabled', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html><head>%sveltekit.head%</head><body></body></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).not.toContain(themeBlockingScriptMarker)
			expect(result.body).not.toContain(themeBlockingScript)
		})

		it('should not inject when marker is already present', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config)
			const mockResolve = vi.fn(async(_, options) => {
				const html = `<html><head>${ themeBlockingScriptMarker }%sveltekit.head%</head></html>`
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			const occurrences =
				(result.body as unknown as string).match(/@goobits\/themes-blocking/g) || []
			expect(occurrences.length).toBe(1)
		})

		it('should include nonce when provided', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, {
				blockingScript: { enabled: true, nonce: 'nonce-123' }
			})
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html><head>%sveltekit.head%</head></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('nonce="nonce-123"')
		})
	})

	describe('theme class injection', () => {
		it('should inject theme-light class for light theme', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-light')
		})

		it('should inject theme-dark class for dark theme', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-dark')
		})

		it('should inject theme-system class for system theme', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-system')
		})
	})

	describe('scheme class injection', () => {
		it('should inject scheme-default class', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('scheme-default')
		})

		it('should inject scheme-spells class', async() => {
			const config = createMockConfig([ 'default', 'spells' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'spells'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('scheme-spells')
		})

		it('should inject custom scheme classes', async() => {
			const config = createMockConfig([ 'default', 'custom-theme' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'custom-theme' as ThemeScheme
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('scheme-custom-theme')
		})

		it('should combine theme and scheme classes', async() => {
			const config = createMockConfig([ 'spells' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'spells'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-dark scheme-spells')
		})
	})

	describe('system theme detection with sec-ch-prefers-color-scheme header', () => {
		it("should add theme-system-dark when header is 'dark'", async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'sec-ch-prefers-color-scheme': 'dark'
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-system')
			expect(result.body).toContain('theme-system-dark')
			expect(result.body).not.toContain('theme-system-light')
		})

		it("should add theme-system-light when header is 'light'", async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'sec-ch-prefers-color-scheme': 'light'
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-system')
			expect(result.body).toContain('theme-system-light')
			expect(result.body).not.toContain('theme-system-dark')
		})

		it('should default to light when header is missing', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-system')
			expect(result.body).toContain('theme-system-light')
			expect(result.body).not.toContain('theme-system-dark')
		})
	})

	describe('user-agent based theme detection', () => {
		it("should detect dark mode from user-agent containing 'dark'", async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'user-agent': 'Mozilla/5.0 (dark mode enabled)'
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-system-dark')
		})

		it("should detect dark mode from user-agent with 'Dark' (case insensitive)", async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'user-agent': 'Mozilla/5.0 (Dark Theme)'
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-system-dark')
		})

		it("should default to light when user-agent does not contain 'dark'", async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-system-light')
			expect(result.body).not.toContain('theme-system-dark')
		})

		it('should handle missing user-agent header', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-system-light')
		})

		it('should use OR logic for dark mode detection', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'sec-ch-prefers-color-scheme': 'light',
				'user-agent': 'Mozilla/5.0 (dark)'
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			// Uses OR logic: header is 'light' but user-agent has 'dark', so result is dark
			expect(result.body).toContain('theme-system-dark')
			expect(result.body).not.toContain('theme-system-light')
		})
	})

	describe('integration with loadThemePreferences', () => {
		it('should call loadThemePreferences with event.cookies and config', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async() => ({
				status: 200,
				headers: new Headers(),
				body: '<html></html>'
			}))

			await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(preferences.loadThemePreferences).toHaveBeenCalledWith(event.cookies, config)
		})

		it('should use theme and scheme from loadThemePreferences', async() => {
			const config = createMockConfig([ 'spells' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'spells'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-dark')
			expect(result.body).toContain('scheme-spells')
		})

		it('should work with different preference combinations', async() => {
			const config = createMockConfig([ 'custom' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'custom' as ThemeScheme
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-light')
			expect(result.body).toContain('scheme-custom')
		})
	})

	describe('non-system theme modes', () => {
		it('should not add system-specific classes for light theme', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'sec-ch-prefers-color-scheme': 'dark'
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-light')
			expect(result.body).not.toContain('theme-system-dark')
			expect(result.body).not.toContain('theme-system-light')
		})

		it('should not add system-specific classes for dark theme', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'sec-ch-prefers-color-scheme': 'light'
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-dark')
			expect(result.body).not.toContain('theme-system-dark')
			expect(result.body).not.toContain('theme-system-light')
		})
	})

	describe('edge cases', () => {
		it('should handle HTML with special characters', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html =
					'<html class="%sveltekit.theme%"><body>Special: &amp; &lt; &gt;</body></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-light scheme-default')
			expect(result.body).toContain('Special: &amp; &lt; &gt;')
		})

		it('should handle very long HTML documents', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const longContent = '<div>content</div>'.repeat(1000)
			const mockResolve = vi.fn(async(_, options) => {
				const html = `<html class="%sveltekit.theme%"><body>${ longContent }</body></html>`
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-dark scheme-default')
			expect(result.body).toContain(longContent)
		})

		it('should handle placeholder in various positions', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '%sveltekit.theme%<html><body class="test"></body></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-light scheme-default')
			expect(result.body).not.toContain('%sveltekit.theme%')
		})

		it('should handle empty user-agent string', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'user-agent': ''
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('theme-system-light')
		})

		it('should handle scheme names with special characters', async() => {
			const config = createMockConfig([ 'my-custom_scheme.v2' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'my-custom_scheme.v2' as ThemeScheme
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('scheme-my-custom_scheme.v2')
		})

		it('should call resolve with correct parameters', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async() => ({
				status: 200,
				headers: new Headers(),
				body: '<html></html>'
			}))

			await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(mockResolve).toHaveBeenCalledWith(event, {
				transformPageChunk: expect.any(Function)
			})
		})

		it('should preserve response status and headers', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const customHeaders = new Headers()
			customHeaders.set('X-Custom-Header', 'test-value')

			const mockResolve = vi.fn(async() => ({
				status: 201,
				headers: customHeaders,
				body: '<html></html>'
			}))

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.status).toBe(201)
			expect(result.headers.get('X-Custom-Header')).toBe('test-value')
		})
	})

	describe('event.locals population', () => {
		it('should populate event.locals.themePreferences with loaded preferences', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async() => ({
				status: 200,
				headers: new Headers(),
				body: '<html></html>'
			}))

			await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect((event.locals as any).themePreferences).toEqual({
				theme: 'light',
				themeScheme: 'default'
			})
		})

		it('should populate event.locals with dark theme preferences', async() => {
			const config = createMockConfig([ 'spells' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'spells'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async() => ({
				status: 200,
				headers: new Headers(),
				body: '<html></html>'
			}))

			await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect((event.locals as any).themePreferences).toEqual({
				theme: 'dark',
				themeScheme: 'spells'
			})
		})

		it('should populate event.locals with system theme preferences', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async() => ({
				status: 200,
				headers: new Headers(),
				body: '<html></html>'
			}))

			await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect((event.locals as any).themePreferences).toEqual({
				theme: 'system',
				themeScheme: 'default'
			})
		})

		it('should populate event.locals before calling resolve', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async evt => {
				// Verify that event.locals is populated when resolve is called
				expect((evt.locals as any).themePreferences).toEqual({
					theme: 'light',
					themeScheme: 'default'
				})

				return {
					status: 200,
					headers: new Headers(),
					body: '<html></html>'
				}
			})

			await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(mockResolve).toHaveBeenCalled()
		})

		it('should populate event.locals with custom scheme', async() => {
			const config = createMockConfig([ 'custom-scheme' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'custom-scheme' as ThemeScheme
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async() => ({
				status: 200,
				headers: new Headers(),
				body: '<html></html>'
			}))

			await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect((event.locals as any).themePreferences).toEqual({
				theme: 'light',
				themeScheme: 'custom-scheme'
			})
		})
	})

	describe('SSR HTML transformation scenarios', () => {
		it('should transform complete HTML document', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'light',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = `<!DOCTYPE html>
<html lang="en" class="%sveltekit.theme%">
  <head>
    <meta charset="UTF-8">
    <title>Test Page</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('class="theme-light scheme-default"')
			expect(result.body).toContain('<title>Test Page</title>')
			expect(result.body).toContain('<h1>Hello World</h1>')
		})

		it('should work with SvelteKit app template', async() => {
			const config = createMockConfig([ 'spells' ])
			const event = createMockRequestEvent()

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'dark',
				themeScheme: 'spells'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = `<!DOCTYPE html>
<html lang="en" class="%sveltekit.theme%">
  <head>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toContain('class="theme-dark scheme-spells"')
			expect(result.body).toContain('%sveltekit.head%')
			expect(result.body).toContain('%sveltekit.body%')
		})

		it('should handle system theme in SSR with dark header', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'sec-ch-prefers-color-scheme': 'dark',
				'user-agent': 'Mozilla/5.0'
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toBe(
				'<html class="theme-system scheme-default theme-system-dark" data-theme="dark"></html>'
			)
		})

		it('should handle system theme in SSR with light header', async() => {
			const config = createMockConfig([ 'default' ])
			const event = createMockRequestEvent({
				'sec-ch-prefers-color-scheme': 'light',
				'user-agent': 'Mozilla/5.0'
			})

			vi.mocked(preferences.loadThemePreferences).mockReturnValue({
				theme: 'system',
				themeScheme: 'default'
			})

			const hooks = createThemeHooks(config, { blockingScript: false })
			const mockResolve = vi.fn(async(_, options) => {
				const html = '<html class="%sveltekit.theme%"></html>'
				const transformed = options?.transformPageChunk?.({ html }) || html
				return {
					status: 200,
					headers: new Headers(),
					body: transformed
				}
			})

			const result = await hooks.transform({
				event,
				resolve: mockResolve as any
			})

			expect(result.body).toBe(
				'<html class="theme-system scheme-default theme-system-light" data-theme="light"></html>'
			)
		})
	})
})
