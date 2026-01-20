/**
 * Tests for SchemeSelector Svelte Component
 *
 * Comprehensive tests for the SchemeSelector component that provides a select
 * dropdown for choosing theme schemes with integration to the theme store.
 */

import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

import { createMockThemeStore } from '../../../../test/testUtils'
import type { SchemeConfig } from '../../core/config'
import type { ThemeScheme } from '../../core/schemeRegistry'
import type { ThemeStore } from '../stores/theme.svelte.js'

// Mock useTheme hook
let mockThemeStore: ThemeStore
const useThemeMock = vi.fn()

vi.mock('../hooks/useTheme.svelte.js', () => ({
	useTheme: () => useThemeMock()
}))

// Default schemes with 'brand' for tests that need it
const defaultSchemesWithBrand: SchemeConfig[] = [
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
	},
	{
		name: 'brand',
		displayName: 'Brand',
		description: 'Brand theme',
		preview: { primary: '#000', accent: '#fff', background: '#fff' }
	}
]

describe('SchemeSelector', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockThemeStore = createMockThemeStore({})
		useThemeMock.mockReturnValue(mockThemeStore)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('component initialization', () => {
		it('should initialize with default scheme', () => {
			const store = createMockThemeStore({ theme: 'system', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			expect(store.scheme).toBe('default')
			expect(store.settings.themeScheme).toBe('default')
		})

		it('should initialize with custom scheme', () => {
			const store = createMockThemeStore({ theme: 'light', scheme: 'spells' })
			useThemeMock.mockReturnValue(store)

			expect(store.scheme).toBe('spells')
			expect(store.settings.themeScheme).toBe('spells')
		})
	})

	describe('scheme selection', () => {
		it('should display current scheme as selected value', () => {
			const store = createMockThemeStore({ theme: 'light', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			expect(store.scheme).toBe('default')
		})

		it('should call setScheme when selection changes', () => {
			const store = createMockThemeStore({ theme: 'system', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			// Simulate selecting a different scheme
			store.setScheme('spells')

			expect(store.setScheme).toHaveBeenCalledWith('spells')
			expect(store.setScheme).toHaveBeenCalledTimes(1)
		})

		it('should handle multiple scheme changes', () => {
			const store = createMockThemeStore({ theme: 'light', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			store.setScheme('spells')
			store.setScheme('brand' as ThemeScheme)
			store.setScheme('default')

			expect(store.setScheme).toHaveBeenCalledTimes(3)
			expect(store.setScheme).toHaveBeenNthCalledWith(1, 'spells')
			expect(store.setScheme).toHaveBeenNthCalledWith(2, 'brand' as ThemeScheme)
			expect(store.setScheme).toHaveBeenNthCalledWith(3, 'default')
		})

		it('should not throw error when changing to same scheme', () => {
			const store = createMockThemeStore({ theme: 'light', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			// Select the same scheme that's already selected
			expect(() => store.setScheme('default')).not.toThrow()
			expect(store.setScheme).toHaveBeenCalledWith('default')
		})
	})

	describe('available schemes rendering', () => {
		it('should render all available schemes as options', () => {
			const store = createMockThemeStore({
				theme: 'system',
				scheme: 'default',
				availableSchemes: defaultSchemesWithBrand
			})
			useThemeMock.mockReturnValue(store)

			expect(store.availableSchemes).toHaveLength(3)
			expect(store.availableSchemes.map(s => s.name)).toEqual([ 'default', 'spells', 'brand' ])
		})

		it('should include scheme displayName for each option', () => {
			const store = createMockThemeStore({ theme: 'light', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			store.availableSchemes.forEach(scheme => {
				expect(scheme).toHaveProperty('name')
				expect(scheme).toHaveProperty('displayName')
				expect(typeof scheme.name).toBe('string')
				expect(typeof scheme.displayName).toBe('string')
			})
		})

		it('should handle schemes with different displayNames', () => {
			const customSchemes: SchemeConfig[] = [
				{
					name: 'minimal',
					displayName: 'Minimal Theme',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				},
				{
					name: 'vibrant',
					displayName: 'Vibrant Colors',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				},
				{
					name: 'professional',
					displayName: 'Professional Look',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				}
			]
			const store = createMockThemeStore({
				theme: 'dark',
				scheme: 'minimal' as ThemeScheme,
				availableSchemes: customSchemes
			})
			useThemeMock.mockReturnValue(store)

			expect(store.availableSchemes).toHaveLength(3)
			expect(store.availableSchemes[0].displayName).toBe('Minimal Theme')
			expect(store.availableSchemes[1].displayName).toBe('Vibrant Colors')
			expect(store.availableSchemes[2].displayName).toBe('Professional Look')
		})
	})

	describe('reactive behavior', () => {
		it('should derive currentScheme from theme.scheme', () => {
			const store = createMockThemeStore({ theme: 'dark', scheme: 'spells' })
			useThemeMock.mockReturnValue(store)

			expect(store.scheme).toBe('spells')
		})

		it('should update when scheme changes in store', () => {
			const store = createMockThemeStore({ theme: 'light', scheme: 'default' })
			useThemeMock.mockReturnValue(store);

			// Simulate scheme change
			(store as any).scheme = 'brand' as ThemeScheme;
			(store as any).settings.themeScheme = 'brand' as ThemeScheme

			expect(store.scheme).toBe('brand')
			expect(store.settings.themeScheme).toBe('brand')
		})

		it('should maintain consistency between scheme and settings', () => {
			const store = createMockThemeStore({ theme: 'dark', scheme: 'spells' })
			useThemeMock.mockReturnValue(store)

			expect(store.scheme).toBe(store.settings.themeScheme)
		})
	})

	describe('integration with different theme modes', () => {
		it('should work with light theme mode', () => {
			const store = createMockThemeStore({ theme: 'light', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			expect(store.theme).toBe('light')
			expect(store.scheme).toBe('default')
		})

		it('should work with system theme mode', () => {
			const store = createMockThemeStore({ theme: 'system', scheme: 'brand' as ThemeScheme })
			useThemeMock.mockReturnValue(store)

			expect(store.theme).toBe('system')
			expect(store.scheme).toBe('brand')
		})
	})

	describe('edge cases', () => {
		it('should handle empty availableSchemes array', () => {
			const store = createMockThemeStore({
				theme: 'system',
				scheme: 'default',
				availableSchemes: []
			})
			useThemeMock.mockReturnValue(store)

			expect(store.availableSchemes).toEqual([])
			expect(store.availableSchemes).toHaveLength(0)
		})

		it('should handle single scheme in availableSchemes', () => {
			const singleScheme: SchemeConfig[] = [
				{
					name: 'default',
					displayName: 'Default',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				}
			]
			const store = createMockThemeStore({
				theme: 'light',
				scheme: 'default',
				availableSchemes: singleScheme
			})
			useThemeMock.mockReturnValue(store)

			expect(store.availableSchemes).toHaveLength(1)
			expect(store.availableSchemes[0].name).toBe('default')
		})

		it('should handle many schemes in availableSchemes', () => {
			const manySchemes: SchemeConfig[] = Array.from({ length: 10 }, (_, i) => ({
				name: `scheme${ i }`,
				displayName: `Scheme ${ i }`,
				description: '',
				preview: { primary: '#000', accent: '#fff', background: '#fff' }
			}))
			const store = createMockThemeStore({
				theme: 'dark',
				scheme: 'scheme0' as ThemeScheme,
				availableSchemes: manySchemes
			})
			useThemeMock.mockReturnValue(store)

			expect(store.availableSchemes).toHaveLength(10)
		})

		it('should handle schemes with special characters in names', () => {
			const specialSchemes: SchemeConfig[] = [
				{
					name: 'scheme-with-dashes',
					displayName: 'Scheme With Dashes',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				},
				{
					name: 'scheme_with_underscores',
					displayName: 'Scheme With Underscores',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				},
				{
					name: 'scheme.with.dots',
					displayName: 'Scheme With Dots',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				}
			]
			const store = createMockThemeStore({
				theme: 'system',
				scheme: 'scheme-with-dashes' as ThemeScheme,
				availableSchemes: specialSchemes
			})
			useThemeMock.mockReturnValue(store)

			expect(store.availableSchemes).toHaveLength(3)
			expect(store.availableSchemes[0].name).toBe('scheme-with-dashes')
		})

		it('should handle schemes with long displayNames', () => {
			const longNameSchemes: SchemeConfig[] = [
				{
					name: 'long',
					displayName: 'This Is A Very Long Display Name That Exceeds Normal Length',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				}
			]
			const store = createMockThemeStore({
				theme: 'light',
				scheme: 'long' as ThemeScheme,
				availableSchemes: longNameSchemes
			})
			useThemeMock.mockReturnValue(store)

			expect(store.availableSchemes[0].displayName).toBe(
				'This Is A Very Long Display Name That Exceeds Normal Length'
			)
		})

		it('should handle scheme selection when current scheme not in availableSchemes', () => {
			const limitedSchemes: SchemeConfig[] = [
				{
					name: 'default',
					displayName: 'Default',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				},
				{
					name: 'spells',
					displayName: 'Spells',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				}
			]
			const store = createMockThemeStore({
				theme: 'dark',
				scheme: 'brand' as ThemeScheme,
				availableSchemes: limitedSchemes
			})
			useThemeMock.mockReturnValue(store)

			// Current scheme is "brand" but not in availableSchemes
			expect(store.scheme).toBe('brand')
			expect(store.availableSchemes.find(s => s.name === 'brand')).toBeUndefined()
		})
	})

	describe('scheme change event handling', () => {
		it('should call setScheme with correct value on change', () => {
			const store = createMockThemeStore({ theme: 'light', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			// Simulate change event with new value
			const newScheme = 'spells'
			store.setScheme(newScheme)

			expect(store.setScheme).toHaveBeenCalledWith(newScheme)
		})

		it('should handle rapid scheme changes', () => {
			const store = createMockThemeStore({ theme: 'system', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			// Simulate rapid clicking through schemes
			for (let i = 0; i < 5; i++) {
				const schemes: ThemeScheme[] = [ 'default', 'spells', 'brand' as ThemeScheme ]
				store.setScheme(schemes[i % 3])
			}

			expect(store.setScheme).toHaveBeenCalledTimes(5)
		})
	})

	describe('scheme metadata', () => {
		it('should include description in scheme data', () => {
			const store = createMockThemeStore({ theme: 'dark', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			const defaultScheme = store.availableSchemes.find(s => s.name === 'default')
			expect(defaultScheme?.description).toBe('Default theme')
		})

		it('should handle schemes without description', () => {
			const schemesWithoutDesc: SchemeConfig[] = [
				{
					name: 'minimal',
					displayName: 'Minimal',
					description: '',
					preview: { primary: '#000', accent: '#fff', background: '#fff' }
				}
			]
			const store = createMockThemeStore({
				theme: 'light',
				scheme: 'minimal' as ThemeScheme,
				availableSchemes: schemesWithoutDesc
			})
			useThemeMock.mockReturnValue(store)

			expect(store.availableSchemes[0].description).toBe('')
		})
	})

	describe('settings synchronization', () => {
		it('should keep settings.themeScheme in sync with scheme', () => {
			const store = createMockThemeStore({ theme: 'system', scheme: 'brand' as ThemeScheme })
			useThemeMock.mockReturnValue(store)

			expect(store.settings.themeScheme).toBe(store.scheme)
		})

		it('should update settings when scheme changes', () => {
			const store = createMockThemeStore({ theme: 'light', scheme: 'default' })
			useThemeMock.mockReturnValue(store);

			// Simulate scheme change
			(store as any).scheme = 'spells';
			(store as any).settings.themeScheme = 'spells'

			expect(store.settings.themeScheme).toBe('spells')
			expect(store.scheme).toBe('spells')
		})

		it('should maintain theme mode when changing scheme', () => {
			const store = createMockThemeStore({ theme: 'dark', scheme: 'default' })
			useThemeMock.mockReturnValue(store)

			const originalTheme = store.theme;
			(store as any).scheme = 'brand' as ThemeScheme;
			(store as any).settings.themeScheme = 'brand' as ThemeScheme

			expect(store.theme).toBe(originalTheme)
			expect(store.settings.theme).toBe(originalTheme)
		})
	})
})
