/**
 * Tests for Route-Based Theme Configuration Utilities
 */

import { describe, expect,it } from 'vitest'

import type { FullTheme } from '../core/types'
import {
	getRoutesForScheme,
	getRouteTheme,
	routeHasTheme,
	type RouteThemeConfig,
	routeThemeOverrides
} from './routeThemes'

// Test fixtures
const createTheme = (scheme: 'default' | 'spells' = 'default'): FullTheme => ({
	base: 'light',
	scheme
})

const createConfig = (
	scheme: 'default' | 'spells' = 'default',
	override = false,
	description?: string
): RouteThemeConfig => ({
	theme: createTheme(scheme),
	override,
	description
})

const mockRouteThemes: Record<string, RouteThemeConfig> = {
	'/home': createConfig('default', false, 'Home page theme'),
	'/about': createConfig('spells', true, 'About page with override'),
	'/docs': createConfig('default', false),
	'/blog/*': createConfig('spells', false, 'Blog posts wildcard'),
	'/admin/*': createConfig('default', true, 'Admin area override'),
	'/api/*/docs': createConfig('spells', false, 'API docs nested wildcard'),
	'/user/*/profile/*': createConfig('default', false, 'User profile nested')
}

describe('getRouteTheme', () => {
	describe('exact matches', () => {
		it('should return config for exact route match', () => {
			const result = getRouteTheme('/home', mockRouteThemes)
			expect(result).toEqual(mockRouteThemes['/home'])
			expect(result?.theme.scheme).toBe('default')
			expect(result?.override).toBe(false)
		})

		it('should return config with description when present', () => {
			const result = getRouteTheme('/about', mockRouteThemes)
			expect(result?.description).toBe('About page with override')
		})

		it('should prioritize exact match over wildcard', () => {
			const routesWithConflict: Record<string, RouteThemeConfig> = {
				'/test': createConfig('default', false),
				'/test/*': createConfig('spells', true)
			}
			const result = getRouteTheme('/test', routesWithConflict)
			expect(result?.theme.scheme).toBe('default')
			expect(result?.override).toBe(false)
		})
	})

	describe('wildcard matches', () => {
		it('should match single-level wildcard routes', () => {
			const result = getRouteTheme('/blog/my-post', mockRouteThemes)
			expect(result).toEqual(mockRouteThemes['/blog/*'])
			expect(result?.theme.scheme).toBe('spells')
		})

		it('should match multi-level wildcard routes', () => {
			const result = getRouteTheme('/blog/2024/my-post', mockRouteThemes)
			expect(result).toEqual(mockRouteThemes['/blog/*'])
		})

		it('should match nested wildcards with specific segments', () => {
			const result = getRouteTheme('/api/v1/docs', mockRouteThemes)
			expect(result).toEqual(mockRouteThemes['/api/*/docs'])
			expect(result?.theme.scheme).toBe('spells')
		})

		it('should match multiple nested wildcards', () => {
			const result = getRouteTheme('/user/john/profile/settings', mockRouteThemes)
			expect(result).toEqual(mockRouteThemes['/user/*/profile/*'])
			expect(result?.theme.scheme).toBe('default')
		})

		it("should not match if wildcard pattern doesn't align", () => {
			const result = getRouteTheme('/api/v1/users', mockRouteThemes)
			expect(result).toBeNull()
		})

		it('should handle wildcards at the end of path correctly', () => {
			const result = getRouteTheme('/admin/users/edit', mockRouteThemes)
			expect(result).toEqual(mockRouteThemes['/admin/*'])
			expect(result?.override).toBe(true)
		})
	})

	describe('non-matching routes', () => {
		it('should return null for non-matching route', () => {
			const result = getRouteTheme('/unknown', mockRouteThemes)
			expect(result).toBeNull()
		})

		it('should return null for partial matches', () => {
			const result = getRouteTheme('/hom', mockRouteThemes)
			expect(result).toBeNull()
		})

		it('should return null for route with extra segments', () => {
			const result = getRouteTheme('/about/team', mockRouteThemes)
			expect(result).toBeNull()
		})
	})

	describe('edge cases', () => {
		it('should handle empty pathname', () => {
			const result = getRouteTheme('', mockRouteThemes)
			expect(result).toBeNull()
		})

		it('should handle empty routeThemes object', () => {
			const result = getRouteTheme('/home', {})
			expect(result).toBeNull()
		})

		it('should handle root path', () => {
			const routesWithRoot: Record<string, RouteThemeConfig> = {
				'/': createConfig('default', false)
			}
			const result = getRouteTheme('/', routesWithRoot)
			expect(result).toEqual(routesWithRoot['/'])
		})

		it('should handle routes with special characters', () => {
			const specialRoutes: Record<string, RouteThemeConfig> = {
				'/path-with-dashes': createConfig('default', false),
				'/path_with_underscores': createConfig('spells', true)
			}
			expect(getRouteTheme('/path-with-dashes', specialRoutes)).toEqual(
				specialRoutes['/path-with-dashes']
			)
			expect(getRouteTheme('/path_with_underscores', specialRoutes)).toEqual(
				specialRoutes['/path_with_underscores']
			)
		})

		it('should handle wildcard matching empty segments', () => {
			const routes: Record<string, RouteThemeConfig> = {
				'/prefix/*/suffix': createConfig('default', false)
			}
			const result = getRouteTheme('/prefix//suffix', routes)
			expect(result).toEqual(routes['/prefix/*/suffix'])
		})

		it('should be case-sensitive', () => {
			const routes: Record<string, RouteThemeConfig> = {
				'/Home': createConfig('default', false)
			}
			expect(getRouteTheme('/home', routes)).toBeNull()
			expect(getRouteTheme('/Home', routes)).toEqual(routes['/Home'])
		})
	})
})

describe('routeHasTheme', () => {
	it('should return true for route with exact match', () => {
		expect(routeHasTheme('/home', mockRouteThemes)).toBe(true)
	})

	it('should return true for route with wildcard match', () => {
		expect(routeHasTheme('/blog/my-post', mockRouteThemes)).toBe(true)
	})

	it('should return false for route without match', () => {
		expect(routeHasTheme('/unknown', mockRouteThemes)).toBe(false)
	})

	it('should return false for empty pathname', () => {
		expect(routeHasTheme('', mockRouteThemes)).toBe(false)
	})

	it('should return false with empty routeThemes', () => {
		expect(routeHasTheme('/home', {})).toBe(false)
	})

	it('should handle nested wildcard routes', () => {
		expect(routeHasTheme('/api/v2/docs', mockRouteThemes)).toBe(true)
	})
})

describe('getRoutesForScheme', () => {
	it('should return all routes for default scheme', () => {
		const routes = getRoutesForScheme('default', mockRouteThemes)
		expect(routes).toContain('/home')
		expect(routes).toContain('/docs')
		expect(routes).toContain('/admin/*')
		expect(routes).toContain('/user/*/profile/*')
		expect(routes).toHaveLength(4)
	})

	it('should return all routes for spells scheme', () => {
		const routes = getRoutesForScheme('spells', mockRouteThemes)
		expect(routes).toContain('/about')
		expect(routes).toContain('/blog/*')
		expect(routes).toContain('/api/*/docs')
		expect(routes).toHaveLength(3)
	})

	it('should return empty array when no routes match scheme', () => {
		const limitedRoutes: Record<string, RouteThemeConfig> = {
			'/home': createConfig('default', false)
		}
		const routes = getRoutesForScheme('spells', limitedRoutes)
		expect(routes).toEqual([])
	})

	it('should return empty array for empty routeThemes', () => {
		const routes = getRoutesForScheme('default', {})
		expect(routes).toEqual([])
	})

	it('should include wildcard routes in results', () => {
		const routes = getRoutesForScheme('spells', mockRouteThemes)
		expect(routes).toContain('/blog/*')
		expect(routes).toContain('/api/*/docs')
	})

	it('should return routes with different theme modes but same scheme', () => {
		const multiModeRoutes: Record<string, RouteThemeConfig> = {
			'/light': {
				theme: { base: 'light', scheme: 'default' },
				override: false
			},
			'/dark': {
				theme: { base: 'dark', scheme: 'default' },
				override: false
			},
			'/system': {
				theme: { base: 'system', scheme: 'default' },
				override: false
			}
		}
		const routes = getRoutesForScheme('default', multiModeRoutes)
		expect(routes).toContain('/light')
		expect(routes).toContain('/dark')
		expect(routes).toContain('/system')
		expect(routes).toHaveLength(3)
	})
})

describe('routeThemeOverrides', () => {
	it('should return true when route theme has override enabled', () => {
		expect(routeThemeOverrides('/about', mockRouteThemes)).toBe(true)
		expect(routeThemeOverrides('/admin/settings', mockRouteThemes)).toBe(true)
	})

	it('should return false when route theme has override disabled', () => {
		expect(routeThemeOverrides('/home', mockRouteThemes)).toBe(false)
		expect(routeThemeOverrides('/blog/post', mockRouteThemes)).toBe(false)
	})

	it('should return false when route has no theme', () => {
		expect(routeThemeOverrides('/unknown', mockRouteThemes)).toBe(false)
	})

	it('should return false for empty pathname', () => {
		expect(routeThemeOverrides('', mockRouteThemes)).toBe(false)
	})

	it('should return false with empty routeThemes', () => {
		expect(routeThemeOverrides('/home', {})).toBe(false)
	})

	it('should handle wildcard routes with override', () => {
		expect(routeThemeOverrides('/admin/users', mockRouteThemes)).toBe(true)
		expect(routeThemeOverrides('/admin/settings/security', mockRouteThemes)).toBe(true)
	})

	it('should handle wildcard routes without override', () => {
		expect(routeThemeOverrides('/blog/my-post', mockRouteThemes)).toBe(false)
	})

	it('should handle nested wildcards correctly', () => {
		expect(routeThemeOverrides('/user/john/profile/edit', mockRouteThemes)).toBe(false)
		expect(routeThemeOverrides('/api/v1/docs', mockRouteThemes)).toBe(false)
	})
})

describe('integration tests', () => {
	it('should work with complex route configuration', () => {
		const complexRoutes: Record<string, RouteThemeConfig> = {
			'/': createConfig('default', false),
			'/products': createConfig('spells', false),
			'/products/*': createConfig('spells', true),
			'/products/featured': createConfig('default', true),
			'/api/*/v1/*': createConfig('default', false)
		}

		// Root should match exactly
		expect(getRouteTheme('/', complexRoutes)?.theme.scheme).toBe('default')

		// Products should match exactly
		expect(getRouteTheme('/products', complexRoutes)?.theme.scheme).toBe('spells')
		expect(getRouteTheme('/products', complexRoutes)?.override).toBe(false)

		// Product detail should match wildcard
		expect(getRouteTheme('/products/123', complexRoutes)?.theme.scheme).toBe('spells')
		expect(getRouteTheme('/products/123', complexRoutes)?.override).toBe(true)

		// Featured should match exactly (priority over wildcard)
		expect(getRouteTheme('/products/featured', complexRoutes)?.theme.scheme).toBe('default')
		expect(getRouteTheme('/products/featured', complexRoutes)?.override).toBe(true)

		// API should match nested wildcard
		expect(getRouteTheme('/api/users/v1/list', complexRoutes)?.theme.scheme).toBe('default')
	})

	it('should maintain consistency across all functions', () => {
		const testRoute = '/admin/users'

		const hasTheme = routeHasTheme(testRoute, mockRouteThemes)
		const theme = getRouteTheme(testRoute, mockRouteThemes)
		const overrides = routeThemeOverrides(testRoute, mockRouteThemes)

		expect(hasTheme).toBe(true)
		expect(theme).not.toBeNull()
		expect(theme?.override).toBe(overrides)
	})

	it('should handle dynamic route patterns consistently', () => {
		const routes: Record<string, RouteThemeConfig> = {
			'/user/*/posts/*': createConfig('spells', true)
		}

		const testPaths = [ '/user/123/posts/456', '/user/john/posts/my-post', '/user/a/posts/b' ]

		testPaths.forEach(path => {
			expect(routeHasTheme(path, routes)).toBe(true)
			expect(getRouteTheme(path, routes)?.theme.scheme).toBe('spells')
			expect(routeThemeOverrides(path, routes)).toBe(true)
		})
	})
})
