import { describe, expect, it, vi } from 'vitest'

import type { ThemeConfig } from '../core/config.js'
import {
	createThemeBlockingScript,
	createThemeBlockingScriptTag,
	themeBlockingScript,
	themeBlockingScriptMarker,
	themeBlockingScriptReadable,
	themeBlockingScriptTag
} from './blockingScript.js'

function scheme(
	name: string,
	fixedMode?: 'light' | 'dark'
): ThemeConfig['schemes'][string] {
	return {
		name,
		displayName: name,
		description: '',
		preview: {
			primary: '#000000',
			accent: '#111111',
			background: '#ffffff'
		},
		...(fixedMode ? { fixedMode } : {})
	}
}

function executeScript(
	script: string,
	{
		cookies = '',
		initialClasses = [ 'app-shell' ],
		matchDark = false,
		storage = new Map<string, string>()
	}: {
		cookies?: string
		initialClasses?: string[]
		matchDark?: boolean
		storage?: Map<string, string>
	} = {}
) {
	const classes = new Set(initialClasses)
	const attributes = new Map<string, string>()
	const cookieWrites: string[] = []
	const documentMock = {
		documentElement: {
			classList: {
				[Symbol.iterator]: () => classes.values(),
				add: (...values: string[]) => values.forEach(value => classes.add(value)),
				remove: (...values: string[]) => values.forEach(value => classes.delete(value))
			},
			setAttribute: (name: string, value: string) => attributes.set(name, value)
		}
	}
	Object.defineProperty(documentMock, 'cookie', {
		get: () => cookies,
		set: (value: string) => {
			cookieWrites.push(value)
		}
	})
	const localStorageMock = {
		getItem: vi.fn((key: string) => storage.get(key) ?? null),
		setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
		removeItem: vi.fn((key: string) => storage.delete(key))
	}
	const run = Function(
		'document',
		'localStorage',
		'location',
		'matchMedia',
		script
	)
	run(
		documentMock,
		localStorageMock,
		{ protocol: 'https:' },
		() => ({ matches: matchDark })
	)
	return { attributes, classes, cookieWrites, localStorageMock, storage }
}

describe('blocking theme script', () => {
	it('keeps one compact generated script owner', () => {
		expect(themeBlockingScript).toContain('app_theme_v1')
		expect(themeBlockingScript).toContain('prefers-color-scheme')
		expect(themeBlockingScript).toContain('data-theme')
		expect(themeBlockingScript).not.toContain('.className=')
		expect(themeBlockingScriptReadable).toBe(themeBlockingScript)
	})

	it('applies defaults without replacing unrelated root classes', () => {
		const result = executeScript(themeBlockingScript, {
			initialClasses: [ 'app-shell', 'theme-dark', 'scheme-old' ]
		})

		expect(result.classes).toContain('app-shell')
		expect(result.classes).toContain('theme-system')
		expect(result.classes).toContain('theme-system-light')
		expect(result.classes).toContain('scheme-default')
		expect(result.classes).not.toContain('theme-dark')
		expect(result.classes).not.toContain('scheme-old')
		expect(result.attributes.get('data-theme')).toBe('light')
	})

	it('migrates and canonicalizes a legacy fixed-mode scheme', () => {
		const config: ThemeConfig = {
			schemes: {
				cassette: scheme('cassette', 'dark')
			},
			defaultMode: 'system',
			defaultScheme: 'cassette',
			schemeAliases: { classic: 'cassette' },
			persistence: {
				storageKey: 'bandamp-theme-preferences',
				themeCookie: 'bandamp-theme-mode',
				schemeCookie: 'bandamp-theme-scheme',
				legacySchemeStorageKey: 'bandamp-theme'
			}
		}
		const storage = new Map([ [ 'bandamp-theme', 'classic' ] ])
		const result = executeScript(createThemeBlockingScript(config), { storage })

		expect(result.classes).toContain('theme-dark')
		expect(result.classes).toContain('scheme-cassette')
		expect(result.storage.get('bandamp-theme-preferences')).toBe(
			JSON.stringify({ theme: 'dark', themeScheme: 'cassette' })
		)
		expect(result.storage.has('bandamp-theme')).toBe(false)
		expect(result.cookieWrites).toHaveLength(2)
	})

	it('uses cookies when local storage is unavailable', () => {
		const config: ThemeConfig = {
			schemes: {
				default: scheme('default'),
				cassette: scheme('cassette', 'dark')
			},
			persistence: {
				themeCookie: 'mode',
				schemeCookie: 'scheme'
			}
		}
		const script = createThemeBlockingScript(config)
		const classes = new Set<string>()
		const attributes = new Map<string, string>()
		const run = Function(
			'document',
			'localStorage',
			'location',
			'matchMedia',
			script
		)

		expect(() =>
			run(
				{
					cookie: 'mode=light; scheme=cassette',
					documentElement: {
						classList: {
							[Symbol.iterator]: () => classes.values(),
							add: (...values: string[]) => values.forEach(value => classes.add(value)),
							remove: (...values: string[]) => values.forEach(value => classes.delete(value))
						},
						setAttribute: (name: string, value: string) => attributes.set(name, value)
					}
				},
				{
					getItem: () => {
						throw new Error('blocked')
					}
				},
				{ protocol: 'https:' },
				() => ({ matches: false })
			)
		).not.toThrow()
		expect(classes).toContain('theme-dark')
		expect(classes).toContain('scheme-cassette')
		expect(attributes.get('data-theme')).toBe('dark')
	})

	it('creates marked tags with optional CSP nonces', () => {
		expect(themeBlockingScriptTag).toContain(themeBlockingScriptMarker)
		expect(themeBlockingScriptTag).toContain(themeBlockingScript)
		expect(createThemeBlockingScriptTag({ nonce: 'nonce-123' }))
			.toContain('nonce="nonce-123"')
		expect(createThemeBlockingScriptTag({ marker: '<!-- custom -->' }))
			.toContain('<!-- custom -->')
	})
})
