/**
 * Tests for Server-side Cookie Utilities
 */

import type { Cookies } from '@sveltejs/kit'
import { describe, expect, it, vi } from 'vitest'

import type { ThemeConfig } from '../core/config'
import { loadThemePreferences } from './preferences'

// Helper to create mock Cookies object
function createMockCookies(cookieValues: Record<string, string> = {}): Cookies {
	return {
		get: vi.fn((name: string) => cookieValues[name]),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn(),
		getAll: vi.fn()
	} as unknown as Cookies
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

describe('loadThemePreferences', () => {
	describe('basic functionality', () => {
		it('should return preferences from cookies when available', () => {
			const cookies = createMockCookies({
				theme: 'dark',
				themeScheme: 'spells'
			})
			const config = createMockConfig([ 'default', 'spells' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('dark')
			expect(result.themeScheme).toBe('spells')
		})

		it('should call cookies.get with correct cookie names', () => {
			const cookies = createMockCookies({
				theme: 'light',
				themeScheme: 'default'
			})
			const config = createMockConfig([ 'default' ])

			loadThemePreferences(cookies, config)

			expect(cookies.get).toHaveBeenCalledWith('theme')
			expect(cookies.get).toHaveBeenCalledWith('themeScheme')
		})

		it('should return object with theme and themeScheme properties', () => {
			const cookies = createMockCookies({
				theme: 'system',
				themeScheme: 'default'
			})
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(cookies, config)

			expect(result).toHaveProperty('theme')
			expect(result).toHaveProperty('themeScheme')
			expect(Object.keys(result)).toHaveLength(2)
		})
	})

	describe('default values', () => {
		it("should return 'system' as default theme when cookie is missing", () => {
			const cookies = createMockCookies({})
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('system')
		})

		it('should return first scheme from config as default when cookie is missing', () => {
			const cookies = createMockCookies({})
			const config = createMockConfig([ 'custom', 'other' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.themeScheme).toBe('custom')
		})

		it("should return 'default' as fallback when config has no schemes", () => {
			const cookies = createMockCookies({})
			const config: ThemeConfig = { schemes: {} }

			const result = loadThemePreferences(cookies, config)

			expect(result.themeScheme).toBe('default')
		})

		it('should use default theme but cookie themeScheme when only theme is missing', () => {
			const cookies = createMockCookies({
				themeScheme: 'spells'
			})
			const config = createMockConfig([ 'default', 'spells' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('system')
			expect(result.themeScheme).toBe('spells')
		})

		it('should use cookie theme but default themeScheme when only themeScheme is missing', () => {
			const cookies = createMockCookies({
				theme: 'light'
			})
			const config = createMockConfig([ 'custom' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('light')
			expect(result.themeScheme).toBe('custom')
		})
	})

	describe('theme modes', () => {
		it("should handle 'light' theme mode", () => {
			const cookies = createMockCookies({ theme: 'light' })
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('light')
		})

		it("should handle 'dark' theme mode", () => {
			const cookies = createMockCookies({ theme: 'dark' })
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('dark')
		})

		it("should handle 'system' theme mode", () => {
			const cookies = createMockCookies({ theme: 'system' })
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('system')
		})
	})

	describe('theme schemes', () => {
		it("should handle 'default' theme scheme", () => {
			const cookies = createMockCookies({ themeScheme: 'default' })
			const config = createMockConfig([ 'default', 'spells' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.themeScheme).toBe('default')
		})

		it("should handle 'spells' theme scheme", () => {
			const cookies = createMockCookies({ themeScheme: 'spells' })
			const config = createMockConfig([ 'default', 'spells' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.themeScheme).toBe('spells')
		})

		it('should handle custom theme schemes', () => {
			const cookies = createMockCookies({ themeScheme: 'custom' })
			const config = createMockConfig([ 'default', 'custom' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.themeScheme).toBe('custom')
		})
	})

	describe('config integration', () => {
		it('should use first scheme when config has single scheme', () => {
			const cookies = createMockCookies({})
			const config = createMockConfig([ 'only-scheme' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.themeScheme).toBe('only-scheme')
		})

		it('should use first scheme when config has multiple schemes', () => {
			const cookies = createMockCookies({})
			const config = createMockConfig([ 'first', 'second', 'third' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.themeScheme).toBe('first')
		})

		it('should prefer cookie value over config default', () => {
			const cookies = createMockCookies({ themeScheme: 'third' })
			const config = createMockConfig([ 'first', 'second', 'third' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.themeScheme).toBe('third')
		})

		it('should handle config with schemes in different order', () => {
			const cookies = createMockCookies({})
			const config = createMockConfig([ 'spells', 'default', 'custom' ])

			const result = loadThemePreferences(cookies, config)

			// Should use first key in the object
			expect(result.themeScheme).toBe('spells')
		})

		it('should work with complex config object', () => {
			const cookies = createMockCookies({
				theme: 'dark',
				themeScheme: 'spells'
			})
			const config: ThemeConfig = {
				schemes: {
					default: {
						name: 'default',
						displayName: 'Default',
						description: 'Default theme',
						icon: 'star',
						title: 'Default Theme',
						preview: {
							primary: '#3b82f6',
							accent: '#8b5cf6',
							background: '#ffffff'
						},
						cssFile: '/styles/default.css'
					},
					spells: {
						name: 'spells',
						displayName: 'Spells',
						description: 'Magic theme',
						preview: {
							primary: '#7c3aed',
							accent: '#db2777',
							background: '#0f172a'
						}
					}
				},
				routeThemes: {
					'/dashboard': {
						theme: { base: 'dark', scheme: 'default' },
						override: true
					}
				}
			}

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('dark')
			expect(result.themeScheme).toBe('spells')
		})
	})

	describe('SvelteKit Cookies interface', () => {
		it('should work with minimal Cookies implementation', () => {
			const minimalCookies: Cookies = {
				get: vi.fn((name: string) => (name === 'theme' ? 'light' : null)),
				set: vi.fn(),
				delete: vi.fn(),
				serialize: vi.fn(),
				getAll: vi.fn()
			} as unknown as Cookies
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(minimalCookies, config)

			expect(result.theme).toBe('light')
		})

		it('should handle cookies.get returning null', () => {
			const cookies: Cookies = {
				get: vi.fn(() => null),
				set: vi.fn(),
				delete: vi.fn(),
				serialize: vi.fn(),
				getAll: vi.fn()
			} as unknown as Cookies
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('system')
			expect(result.themeScheme).toBe('default')
		})

		it('should handle cookies.get returning undefined', () => {
			const cookies: Cookies = {
				get: vi.fn(() => undefined),
				set: vi.fn(),
				delete: vi.fn(),
				serialize: vi.fn(),
				getAll: vi.fn()
			} as unknown as Cookies
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('system')
			expect(result.themeScheme).toBe('default')
		})

		it('should handle cookies.get returning empty string', () => {
			const cookies = createMockCookies({
				theme: '',
				themeScheme: ''
			})
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(cookies, config)

			// Empty string is falsy, so defaults are used
			expect(result.theme).toBe('system')
			expect(result.themeScheme).toBe('default')
		})
	})

	describe('SSR scenarios', () => {
		it('should work in server-side rendering context', () => {
			const cookies = createMockCookies({
				theme: 'dark',
				themeScheme: 'spells'
			})
			const config = createMockConfig([ 'default', 'spells' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('dark')
			expect(result.themeScheme).toBe('spells')
			expect(cookies.get).toHaveBeenCalled()
		})

		it('should handle SSR with no cookies set', () => {
			const cookies = createMockCookies({})
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('system')
			expect(result.themeScheme).toBe('default')
		})

		it('should handle SSR with partial cookies', () => {
			const cookies = createMockCookies({
				theme: 'light'
			})
			const config = createMockConfig([ 'custom' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.theme).toBe('light')
			expect(result.themeScheme).toBe('custom')
		})

		it('should provide consistent defaults for SSR hydration', () => {
			const cookies1 = createMockCookies({})
			const cookies2 = createMockCookies({})
			const config = createMockConfig([ 'default' ])

			const result1 = loadThemePreferences(cookies1, config)
			const result2 = loadThemePreferences(cookies2, config)

			expect(result1).toEqual(result2)
		})
	})

	describe('edge cases', () => {
		it('should handle special characters in cookie values', () => {
			// Invalid theme values are rejected and fall back to defaults
			const cookies = createMockCookies({
				theme: 'dark-mode', // Invalid - will fall back to 'system'
				themeScheme: 'scheme_custom' // Not in allowed list - will fall back to 'default'
			})
			const config = createMockConfig([ 'default' ])

			const result = loadThemePreferences(cookies, config)

			// Security fix: invalid values are rejected, falling back to safe defaults
			expect(result.theme).toBe('system')
			expect(result.themeScheme).toBe('default')
		})

		it('should handle config with special scheme names', () => {
			const cookies = createMockCookies({})
			const config = createMockConfig([ 'my-custom-scheme', 'another_scheme' ])

			const result = loadThemePreferences(cookies, config)

			expect(result.themeScheme).toBe('my-custom-scheme')
		})

		it('should handle multiple calls with same cookies object', () => {
			const cookies = createMockCookies({
				theme: 'dark',
				themeScheme: 'spells'
			})
			const config = createMockConfig([ 'default', 'spells' ])

			const result1 = loadThemePreferences(cookies, config)
			const result2 = loadThemePreferences(cookies, config)

			expect(result1).toEqual(result2)
		})

		it('should not modify the cookies object', () => {
			const cookies = createMockCookies({
				theme: 'light',
				themeScheme: 'default'
			})
			const config = createMockConfig([ 'default' ])

			loadThemePreferences(cookies, config)

			// Verify only get was called, not set or delete
			expect(cookies.get).toHaveBeenCalled()
			expect(cookies.set).not.toHaveBeenCalled()
			expect(cookies.delete).not.toHaveBeenCalled()
		})

		it('should not modify the config object', () => {
			const cookies = createMockCookies({
				theme: 'dark',
				themeScheme: 'spells'
			})
			const config = createMockConfig([ 'default', 'spells' ])
			const originalConfig = JSON.parse(JSON.stringify(config))

			loadThemePreferences(cookies, config)

			expect(config).toEqual(originalConfig)
		})

		it('should handle very long scheme names', () => {
			const longSchemeName = 'a'.repeat(100)
			const cookies = createMockCookies({})
			const config = createMockConfig([ longSchemeName ])

			const result = loadThemePreferences(cookies, config)

			expect(result.themeScheme).toBe(longSchemeName)
		})

		it('should handle config with many schemes', () => {
			const cookies = createMockCookies({})
			const schemeNames = Array.from({ length: 50 }, (_, i) => `scheme-${ i }`)
			const config = createMockConfig(schemeNames)

			const result = loadThemePreferences(cookies, config)

			// Should return first scheme
			expect(result.themeScheme).toBe('scheme-0')
		})
	})

	describe('performance', () => {
		it('should call cookies.get exactly twice', () => {
			const cookies = createMockCookies({
				theme: 'dark',
				themeScheme: 'spells'
			})
			const config = createMockConfig([ 'default', 'spells' ])

			loadThemePreferences(cookies, config)

			expect(cookies.get).toHaveBeenCalledTimes(2)
		})

		it('should not iterate over all config schemes unnecessarily', () => {
			const cookies = createMockCookies({
				theme: 'dark',
				themeScheme: 'custom'
			})
			const config = createMockConfig([ 'default', 'custom', 'other1', 'other2' ])

			const result = loadThemePreferences(cookies, config)

			// Should use cookie value, not iterate to find it
			expect(result.themeScheme).toBe('custom')
		})
	})
})
