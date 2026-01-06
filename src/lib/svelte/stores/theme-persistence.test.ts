/**
 * Tests for Theme Persistence Module
 *
 * Comprehensive tests for localStorage and cookie persistence utilities.
 */

import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'

import {
	clearThemePreferences,
	loadThemePreferences,
	saveThemePreferences,
	type ThemePersistenceData
} from './theme-persistence'

// Mock browser utilities
vi.mock('../../utils/browser', () => ({
	isBrowser: vi.fn(() => false)
}))

// Mock cookie utilities
vi.mock('../../utils/cookies', () => ({
	readPreferenceCookies: vi.fn(() => ({})),
	writePreferenceCookies: vi.fn()
}))

// Helper to set browser mode
async function setBrowserMode(isBrowser: boolean) {
	const module = await import('../../utils/browser')
	vi.mocked(module.isBrowser).mockReturnValue(isBrowser)
}

// Helper to create mock localStorage
function mockLocalStorage() {
	const storage: Record<string, string> = {}

	return {
		getItem: vi.fn((key: string) => storage[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			storage[key] = value
		}),
		removeItem: vi.fn((key: string) => {
			delete storage[key]
		}),
		clear: vi.fn(() => {
			Object.keys(storage).forEach(key => delete storage[key])
		}),
		get length() {
			return Object.keys(storage).length
		},
		key: vi.fn((index: number) => Object.keys(storage)[index] || null)
	}
}

describe('saveThemePreferences', () => {
	let consoleErrorSpy: any

	beforeEach(() => {
		vi.clearAllMocks()
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		consoleErrorSpy?.mockRestore()
	})

	it('should do nothing when not in browser', async() => {
		await setBrowserMode(false)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const data: ThemePersistenceData = { theme: 'dark', themeScheme: 'spells' }
		saveThemePreferences(data)

		expect(mockStorage.setItem).not.toHaveBeenCalled()
	})

	it('should save to localStorage when in browser', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const data: ThemePersistenceData = { theme: 'dark', themeScheme: 'spells' }
		saveThemePreferences(data)

		expect(mockStorage.setItem).toHaveBeenCalledWith(
			'app_theme_v1',
			JSON.stringify({ theme: 'dark', themeScheme: 'spells' })
		)
	})

	it('should save to cookies when in browser', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const { writePreferenceCookies } = await import('../../utils/cookies')

		const data: ThemePersistenceData = { theme: 'light', themeScheme: 'default' }
		saveThemePreferences(data)

		expect(writePreferenceCookies).toHaveBeenCalledWith({
			theme: 'light',
			themeScheme: 'default'
		})
	})

	it('should handle localStorage errors gracefully', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		mockStorage.setItem.mockImplementation(() => {
			throw new Error('Storage quota exceeded')
		})
		globalThis.localStorage = mockStorage as any

		const data: ThemePersistenceData = { theme: 'dark', themeScheme: 'spells' }

		expect(() => saveThemePreferences(data)).not.toThrow()
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Failed to save theme settings to localStorage',
			expect.any(Error)
		)
	})

	it('should save different theme modes correctly', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const modes: Array<ThemePersistenceData> = [
			{ theme: 'light', themeScheme: 'default' },
			{ theme: 'dark', themeScheme: 'spells' },
			{ theme: 'system', themeScheme: 'default' }
		]

		modes.forEach(data => {
			mockStorage.setItem.mockClear()
			saveThemePreferences(data)
			expect(mockStorage.setItem).toHaveBeenCalledWith('app_theme_v1', JSON.stringify(data))
		})
	})

	it('should handle cookie write failures gracefully', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const { writePreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(writePreferenceCookies).mockImplementation(() => {
			throw new Error('Cookie write failed')
		})

		const data: ThemePersistenceData = { theme: 'dark', themeScheme: 'spells' }

		// Should still throw because the entire try-catch wraps both operations
		expect(() => saveThemePreferences(data)).not.toThrow()
		expect(consoleErrorSpy).toHaveBeenCalled()
	})
})

describe('loadThemePreferences', () => {
	let consoleWarnSpy: any

	beforeEach(() => {
		vi.clearAllMocks()
		consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => {
		consoleWarnSpy?.mockRestore()
	})

	it('should return null when not in browser', async() => {
		await setBrowserMode(false)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const result = loadThemePreferences()

		expect(result).toBeNull()
		expect(mockStorage.getItem).not.toHaveBeenCalled()
	})

	it('should load from localStorage when available', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		mockStorage.setItem(
			'app_theme_v1',
			JSON.stringify({ theme: 'dark', themeScheme: 'spells' })
		)
		globalThis.localStorage = mockStorage as any

		const result = loadThemePreferences()

		expect(result).toEqual({ theme: 'dark', themeScheme: 'spells' })
	})

	it('should return null when localStorage is empty', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const { readPreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(readPreferenceCookies).mockReturnValue({})

		const result = loadThemePreferences()

		expect(result).toBeNull()
	})

	it('should fallback to cookies when localStorage is empty', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const { readPreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(readPreferenceCookies).mockReturnValue({
			theme: 'light',
			themeScheme: 'default'
		})

		const result = loadThemePreferences()

		expect(result).toEqual({ theme: 'light', themeScheme: 'default' })
	})

	it('should prefer localStorage over cookies when both exist', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		mockStorage.setItem(
			'app_theme_v1',
			JSON.stringify({ theme: 'dark', themeScheme: 'spells' })
		)
		globalThis.localStorage = mockStorage as any

		const { readPreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(readPreferenceCookies).mockReturnValue({
			theme: 'light',
			themeScheme: 'default'
		})

		const result = loadThemePreferences()

		expect(result).toEqual({ theme: 'dark', themeScheme: 'spells' })
	})

	it('should handle JSON parse errors gracefully', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		mockStorage.setItem('app_theme_v1', 'invalid json {')
		globalThis.localStorage = mockStorage as any

		const { readPreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(readPreferenceCookies).mockReturnValue({})

		const result = loadThemePreferences()

		expect(result).toBeNull()
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			'Failed to load theme settings from localStorage',
			expect.any(Error)
		)
	})

	it('should handle cookie read errors gracefully', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const { readPreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(readPreferenceCookies).mockImplementation(() => {
			throw new Error('Cookie access denied')
		})

		const result = loadThemePreferences()

		expect(result).toBeNull()
	})

	it('should return partial data when localStorage data is incomplete', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		mockStorage.setItem('app_theme_v1', JSON.stringify({ theme: 'dark' }))
		globalThis.localStorage = mockStorage as any

		const { readPreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(readPreferenceCookies).mockReturnValue({})

		const result = loadThemePreferences()

		expect(result).toEqual({ theme: 'dark' })
	})

	it('should return null when cookies data is incomplete', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const { readPreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(readPreferenceCookies).mockReturnValue({
			theme: 'dark'

			// Missing themeScheme
		})

		const result = loadThemePreferences()

		expect(result).toBeNull()
	})

	it('should handle localStorage getItem throwing error', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		mockStorage.getItem.mockImplementation(() => {
			throw new Error('Storage access denied')
		})
		globalThis.localStorage = mockStorage as any

		const { readPreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(readPreferenceCookies).mockReturnValue({
			theme: 'light',
			themeScheme: 'spells'
		})

		const result = loadThemePreferences()

		expect(result).toEqual({ theme: 'light', themeScheme: 'spells' })
	})
})

describe('clearThemePreferences', () => {
	let consoleErrorSpy: any

	beforeEach(() => {
		vi.clearAllMocks()
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		consoleErrorSpy?.mockRestore()
	})

	it('should do nothing when not in browser', async() => {
		await setBrowserMode(false)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		clearThemePreferences()

		expect(mockStorage.removeItem).not.toHaveBeenCalled()
	})

	it('should remove from localStorage when in browser', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		mockStorage.setItem(
			'app_theme_v1',
			JSON.stringify({ theme: 'dark', themeScheme: 'spells' })
		)
		globalThis.localStorage = mockStorage as any

		clearThemePreferences()

		expect(mockStorage.removeItem).toHaveBeenCalledWith('app_theme_v1')
	})

	it('should handle localStorage errors gracefully', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		mockStorage.removeItem.mockImplementation(() => {
			throw new Error('Storage access denied')
		})
		globalThis.localStorage = mockStorage as any

		expect(() => clearThemePreferences()).not.toThrow()
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Failed to clear theme settings from localStorage',
			expect.any(Error)
		)
	})
})

describe('integration scenarios', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should handle complete save and load cycle', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const data: ThemePersistenceData = { theme: 'dark', themeScheme: 'spells' }
		saveThemePreferences(data)

		const loaded = loadThemePreferences()
		expect(loaded).toEqual(data)
	})

	it('should handle save, clear, and load cycle', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const { readPreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(readPreferenceCookies).mockReturnValue({})

		const data: ThemePersistenceData = { theme: 'dark', themeScheme: 'spells' }
		saveThemePreferences(data)

		clearThemePreferences()

		const loaded = loadThemePreferences()
		expect(loaded).toBeNull()
	})

	it('should migrate from cookies to localStorage', async() => {
		await setBrowserMode(true)
		const mockStorage = mockLocalStorage()
		globalThis.localStorage = mockStorage as any

		const { readPreferenceCookies } = await import('../../utils/cookies')
		vi.mocked(readPreferenceCookies).mockReturnValue({
			theme: 'dark',
			themeScheme: 'spells'
		})

		// Load from cookies (localStorage is empty)
		const loaded = loadThemePreferences()
		expect(loaded).toEqual({ theme: 'dark', themeScheme: 'spells' })

		// Save to localStorage
		if (loaded) {
			saveThemePreferences(loaded)
		}

		// Now should load from localStorage
		vi.mocked(readPreferenceCookies).mockReturnValue({})
		const reloaded = loadThemePreferences()
		expect(reloaded).toEqual({ theme: 'dark', themeScheme: 'spells' })
	})
})
