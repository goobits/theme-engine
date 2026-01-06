import { describe, expect,it } from 'vitest'

import {
	themeBlockingScript,
	themeBlockingScriptReadable,
	themeBlockingScriptTag
} from './blocking-script'

describe('blocking-script', () => {
	describe('themeBlockingScript', () => {
		it('should be a non-empty string', () => {
			expect(themeBlockingScript).toBeDefined()
			expect(typeof themeBlockingScript).toBe('string')
			expect(themeBlockingScript.length).toBeGreaterThan(0)
		})

		it('should be minified (no unnecessary whitespace)', () => {
			// Minified code should not have significant whitespace runs
			expect(themeBlockingScript).not.toMatch(/\n\s+/)
			expect(themeBlockingScript).not.toMatch(/  +/)
		})

		it('should be valid JavaScript that does not throw when evaluated', () => {
			// Create a mock environment
			const mockWindow = {
				matchMedia: (query: string) => ({
					matches: false,
					media: query,
					addEventListener: () => {},
					removeEventListener: () => {}
				})
			}

			// Wrap the script in a function to provide mocks
			const testScript = `
				(function() {
					var window = ${ JSON.stringify(mockWindow) };
					var document = {
						documentElement: { setAttribute: function() {}, className: '' },
						cookie: ''
					};
					var localStorage = { getItem: function() { return null; } };

					${ themeBlockingScript }
				})();
			`

			// Should not throw
			expect(() => eval(testScript)).not.toThrow()
		})

		it('should contain key functionality keywords', () => {
			expect(themeBlockingScript).toContain('theme-preferences')
			expect(themeBlockingScript).toContain('prefers-color-scheme')
			expect(themeBlockingScript).toContain('data-theme')
			expect(themeBlockingScript).toContain('localStorage')
		})
	})

	describe('themeBlockingScriptTag', () => {
		it('should contain a script tag', () => {
			expect(themeBlockingScriptTag).toContain('<script>')
			expect(themeBlockingScriptTag).toContain('</script>')
		})

		it('should wrap the blocking script', () => {
			expect(themeBlockingScriptTag).toContain(themeBlockingScript)
		})

		it('should be a complete script tag', () => {
			expect(themeBlockingScriptTag).toMatch(/^<script>.*<\/script>$/)
		})
	})

	describe('themeBlockingScriptReadable', () => {
		it('should be a non-empty string', () => {
			expect(themeBlockingScriptReadable).toBeDefined()
			expect(typeof themeBlockingScriptReadable).toBe('string')
			expect(themeBlockingScriptReadable.length).toBeGreaterThan(0)
		})

		it('should have readable formatting (contains newlines and indentation)', () => {
			expect(themeBlockingScriptReadable).toMatch(/\n/)
			expect(themeBlockingScriptReadable).toMatch(/\s{2,}/)
		})

		it('should contain comments for debugging', () => {
			expect(themeBlockingScriptReadable).toContain('//')
		})

		it('should contain same key functionality as minified version', () => {
			expect(themeBlockingScriptReadable).toContain('theme-preferences')
			expect(themeBlockingScriptReadable).toContain('prefers-color-scheme')
			expect(themeBlockingScriptReadable).toContain('data-theme')
			expect(themeBlockingScriptReadable).toContain('localStorage')
		})
	})
})
