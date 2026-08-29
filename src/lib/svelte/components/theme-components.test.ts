import { fireEvent, render, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ThemeComponentsHarness from '../../../../test/fixtures/ThemeComponentsHarness.svelte'
import { createMockConfig } from '../../../../test/testUtils'

const { applyRouteThemeMock, initializeThemeMock } = vi.hoisted(() => ({
	applyRouteThemeMock: vi.fn(),
	initializeThemeMock: vi.fn()
}))

vi.mock('../../core/themeManager.js', () => ({
	applyRouteTheme: applyRouteThemeMock,
	initializeTheme: initializeThemeMock
}))

vi.mock('esm-env', () => ({ BROWSER: true }))

type TestMediaQuery = {
	matches: boolean
	media: string
	onchange: null
	addEventListener: ReturnType<typeof vi.fn>
	removeEventListener: ReturnType<typeof vi.fn>
	addListener: ReturnType<typeof vi.fn>
	removeListener: ReturnType<typeof vi.fn>
	dispatchEvent: ReturnType<typeof vi.fn>
}

let cleanupTheme: ReturnType<typeof vi.fn>
let mediaQuery: TestMediaQuery

beforeEach(() => {
	cleanupTheme = vi.fn()
	initializeThemeMock.mockReturnValue(cleanupTheme)
	mediaQuery = createMediaQuery(false)
	Object.defineProperty(window, 'matchMedia', {
		configurable: true,
		value: vi.fn(() => mediaQuery)
	})
	localStorage.clear()
	clearCookies()
	document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
	vi.clearAllMocks()
	localStorage.clear()
	clearCookies()
	document.documentElement.removeAttribute('data-theme')
})

describe('public theme components', () => {
	it('provides reactive context and keeps the toggle, selector, route, and DOM in sync', async() => {
		const routeThemes = {
			'/': { theme: { base: 'dark' as const, scheme: 'default' }, override: false }
		}
		const config = createMockConfig({ routeThemes })
		const { getByRole, getByTestId, unmount } = render(ThemeComponentsHarness, {
			props: {
				config,
				serverPreferences: { theme: 'light', themeScheme: 'spells' }
			}
		})

		const toggle = getByRole('button', { name: 'Switch to dark theme' })
		const selector = getByRole('combobox') as HTMLSelectElement

		expect(getByTestId('theme-state')).toHaveTextContent('light:spells')
		expect(toggle).toHaveAttribute('title', 'Light theme (Spells)')
		expect(selector.value).toBe('spells')
		expect([ ...selector.options ].map(option => option.textContent)).toEqual([
			'Default',
			'Spells'
		])
		expect(document.documentElement.dataset['theme']).toBe('light')
		expect(initializeThemeMock).toHaveBeenCalledWith('light', 'spells')

		await fireEvent.click(toggle)
		await waitFor(() => {
			expect(getByTestId('theme-state')).toHaveTextContent('dark:spells')
			expect(toggle).toHaveAttribute('aria-label', 'Switch to system theme')
		})
		expect(getByTestId('aria-live-region')).toHaveTextContent(
			'Switched to dark theme with Spells colors'
		)
		expect(document.documentElement.dataset['theme']).toBe('dark')

		selector.value = 'default'
		await fireEvent.change(selector)
		await waitFor(() => {
			expect(getByTestId('theme-state')).toHaveTextContent('dark:default')
			expect(toggle).toHaveAttribute('title', 'Dark theme (Default)')
		})
		expect(applyRouteThemeMock).toHaveBeenLastCalledWith(
			'/',
			'dark',
			'default',
			routeThemes
		)

		unmount()
		expect(cleanupTheme).toHaveBeenCalledTimes(1)
	})

	it('resolves system mode and cleans up its media-query listener', async() => {
		mediaQuery.matches = true
		const { unmount } = render(ThemeComponentsHarness, {
			props: {
				config: createMockConfig(),
				serverPreferences: { theme: 'system', themeScheme: 'default' }
			}
		})
		await tick()

		expect(document.documentElement.dataset['theme']).toBe('dark')
		expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

		const changeHandler = mediaQuery.addEventListener.mock.calls[0]?.[1] as () => void
		mediaQuery.matches = false
		changeHandler()
		expect(document.documentElement.dataset['theme']).toBe('light')

		unmount()
		expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', changeHandler)
	})
})

function createMediaQuery(matches: boolean): TestMediaQuery {
	return {
		matches,
		media: '(prefers-color-scheme: dark)',
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn()
	}
}

function clearCookies(): void {
	for (const cookie of document.cookie.split(';')) {
		const name = cookie.split('=')[0]?.trim()
		if (name) document.cookie = `${ name }=; Max-Age=0; path=/`
	}
}
