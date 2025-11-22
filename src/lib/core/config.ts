/**
 * Theme Configuration Module
 *
 * Provides configuration validation and creation utilities for the theme engine.
 * Use {@link createThemeConfig} to define your application's theme schemes.
 *
 * @module config
 */

import { DEV } from 'esm-env';
import type { SchemeConfig } from './types';
import type { RouteThemeConfig } from '../utils/route-themes';
import { logger } from '../utils/logger';

/**
 * Root configuration object for the theme engine.
 *
 * Defines available color schemes and optional route-based theme overrides.
 * Pass this configuration to {@link createThemeConfig} for validation.
 *
 * @example
 * ```typescript
 * const config: ThemeConfig = {
 *   schemes: {
 *     default: {
 *       name: 'default',
 *       displayName: 'Default',
 *       description: 'Clean design',
 *       preview: { primary: '#007aff', accent: '#5856d6', background: '#fff' }
 *     }
 *   },
 *   routeThemes: {
 *     '/admin/*': {
 *       theme: { base: 'dark', scheme: 'default' },
 *       override: true
 *     }
 *   }
 * };
 * ```
 */
export interface ThemeConfig {
    /** Available color schemes keyed by scheme identifier */
    schemes: Record<string, SchemeConfig>;
    /** Optional route-specific theme configurations */
    routeThemes?: Record<string, RouteThemeConfig>;
}

/**
 * Validates a hex color string
 */
function isValidHexColor(color: string): boolean {
    return /^#[0-9a-f]{6}$/i.test(color);
}

/**
 * Validates theme configuration in development mode
 */
function validateConfig(config: ThemeConfig): void {
    // Skip validation in production for performance
    if (!DEV) {
        return;
    }

    // Check schemes exist
    if (!config.schemes || typeof config.schemes !== 'object') {
        logger.warn(
            '[themes] Invalid config: "schemes" must be an object. ' +
                'Example: { schemes: { default: { name: "default", ... } } }'
        );
        return;
    }

    const schemeKeys = Object.keys(config.schemes);
    if (schemeKeys.length === 0) {
        logger.warn(
            '[themes] Warning: No schemes defined in config. ' +
                'Your theme system will not work without at least one scheme. ' +
                'Add a scheme like: { schemes: { default: { name: "default", displayName: "Default", ... } } }'
        );
    }

    // Validate each scheme
    for (const [key, scheme] of Object.entries(config.schemes)) {
        if (!scheme || typeof scheme !== 'object') {
            logger.warn(`[themes] Invalid scheme "${key}": scheme must be an object`);
            continue;
        }

        // Check name matches key
        if (scheme.name !== key) {
            logger.warn(
                `[themes] Warning: Scheme key "${key}" doesn't match scheme.name "${scheme.name}". ` +
                    `These should be identical to avoid confusion. ` +
                    `Change either the key or the name property to match.`
            );
        }

        // Check required fields
        if (!scheme.displayName) {
            logger.warn(
                `[themes] Warning: Scheme "${key}" missing "displayName". ` +
                    `This is shown in the UI, so it should be user-friendly like "Dark Mode" or "Ocean Theme".`
            );
        }

        if (!scheme.description) {
            logger.warn(
                `[themes] Warning: Scheme "${key}" missing "description". ` +
                    `Add a brief description for better UX.`
            );
        }

        // Validate preview colors
        if (!scheme.preview || typeof scheme.preview !== 'object') {
            logger.warn(
                `[themes] Warning: Scheme "${key}" missing "preview" object. ` +
                    `Add: preview: { primary: "#3b82f6", accent: "#8b5cf6", background: "#ffffff" }`
            );
            continue;
        }

        const { primary, accent, background } = scheme.preview;

        if (primary && !isValidHexColor(primary)) {
            logger.warn(
                `[themes] Warning: Invalid primary color for scheme "${key}": "${primary}". ` +
                    `Expected 6-digit hex format like "#3b82f6"`
            );
        }

        if (accent && !isValidHexColor(accent)) {
            logger.warn(
                `[themes] Warning: Invalid accent color for scheme "${key}": "${accent}". ` +
                    `Expected 6-digit hex format like "#8b5cf6"`
            );
        }

        if (background && !isValidHexColor(background)) {
            logger.warn(
                `[themes] Warning: Invalid background color for scheme "${key}": "${background}". ` +
                    `Expected 6-digit hex format like "#ffffff"`
            );
        }
    }

    // Validate route themes
    if (config.routeThemes) {
        for (const [route, routeConfig] of Object.entries(config.routeThemes)) {
            if (!routeConfig || typeof routeConfig !== 'object') {
                logger.warn(`[themes] Invalid route theme for "${route}": must be an object`);
                continue;
            }

            if (!routeConfig.theme) {
                logger.warn(
                    `[themes] Warning: Route theme for "${route}" missing "theme" property. ` +
                        `Add: theme: { base: "dark", scheme: "default" }`
                );
            }
        }
    }
}

/**
 * Creates and validates a theme configuration.
 *
 * In development mode, this function performs comprehensive validation and logs
 * warnings for common configuration errors. In production, validation is skipped
 * for performance.
 *
 * @param config - The theme configuration object
 * @returns The validated configuration
 *
 * @example
 * ```typescript
 * const config = createThemeConfig({
 *   schemes: {
 *     default: {
 *       name: 'default',
 *       displayName: 'Default',
 *       description: 'Clean, minimal design',
 *       preview: {
 *         primary: '#3b82f6',
 *         accent: '#8b5cf6',
 *         background: '#ffffff'
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @remarks
 * **Color Format Requirements:**
 * - Preview colors must be 6-digit hex format (`#RRGGBB`)
 * - 3-digit hex format (`#RGB`) is NOT supported
 * - Color values are case-insensitive
 * - Examples: `#3b82f6` ✅ | `#fff` ❌ | `#FFFFFF` ✅
 *
 * **Validation Behavior:**
 * - Validation runs only in development mode (detected via esm-env)
 * - In production builds, validation is skipped for performance
 * - Invalid configurations log warnings but do not throw errors
 */
export function createThemeConfig(config: ThemeConfig): ThemeConfig {
    validateConfig(config);
    return config;
}
