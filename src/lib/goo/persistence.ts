/**
 * Theme persistence via localStorage
 */

import { logger } from '../utils/logger.js'
import type { ThemeColors } from './presets.js'

export interface ThemePersistence {
	save: (theme: Partial<ThemeColors>) => void
	restore: () => Partial<ThemeColors> | null
	clear: () => void
}

/**
 * Create a persistence handler for theme storage.
 * @param key - localStorage key (default: 'goo-theme')
 */
export const createPersistence = (key: string | boolean = 'goo-theme'): ThemePersistence => {
	const storageKey = typeof key === 'string' ? key : 'goo-theme'

	const save = (theme: Partial<ThemeColors>): void => {
		try {
			localStorage.setItem(storageKey, JSON.stringify(theme))
		} catch(e) {
			// localStorage may be unavailable (private browsing, disabled, quota exceeded)
			const error = e as Error
			if (error.name !== 'QuotaExceededError' && error.name !== 'SecurityError') {
				logger.warn('Failed to save theme:', error.message)
			}
		}
	}

	const restore = (): Partial<ThemeColors> | null => {
		try {
			const saved = localStorage.getItem(storageKey)
			if (saved) {
				return JSON.parse(saved) as Partial<ThemeColors>
			}
		} catch(e) {
			const error = e as Error

			// localStorage may be unavailable or data corrupted
			if (error.name === 'SyntaxError') {
				logger.warn('Corrupted theme data in storage, clearing')
				clear()
			} else if (error.name !== 'SecurityError') {
				logger.warn('Failed to restore theme:', error.message)
			}
		}
		return null
	}

	const clear = (): void => {
		try {
			localStorage.removeItem(storageKey)
		} catch {
			// Ignore
		}
	}

	return { save, restore, clear }
}
