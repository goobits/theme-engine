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
import { isValidHexColor } from '../utils/validation';

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
 * Validates preview colors for a scheme
 */
function validatePreviewColors(name: string, preview: unknown): void {
    if (!preview || typeof preview !== 'object') {
        logger.warn(
            `[themes] Warning: Scheme "${name}" missing "preview" object. ` +
                `Add: preview: { primary: "#3b82f6", accent: "#8b5cf6", background: "#ffffff" }`
        );
        return;
    }

    const colors = preview as Record<string, unknown>;
    const { primary, accent, background } = colors;

    if (primary && typeof primary === 'string' && !isValidHexColor(primary)) {
        logger.warn(
            `[themes] Warning: Invalid primary color for scheme "${name}": "${primary}". ` +
                `Expected 6-digit hex format like "#3b82f6"`
        );
    }

    if (accent && typeof accent === 'string' && !isValidHexColor(accent)) {
        logger.warn(
            `[themes] Warning: Invalid accent color for scheme "${name}": "${accent}". ` +
                `Expected 6-digit hex format like "#8b5cf6"`
        );
    }

    if (background && typeof background === 'string' && !isValidHexColor(background)) {
        logger.warn(
            `[themes] Warning: Invalid background color for scheme "${name}": "${background}". ` +
                `Expected 6-digit hex format like "#ffffff"`
        );
    }
}

/**
 * Validates a single scheme configuration
 */
function validateScheme(key: string, scheme: unknown): void {
    if (!scheme || typeof scheme !== 'object') {
        logger.warn(`[themes] Invalid scheme "${key}": scheme must be an object`);
        return;
    }

    const schemeObj = scheme as Record<string, unknown>;

    // Check name matches key
    if (schemeObj.name !== key) {
        logger.warn(
            `[themes] Warning: Scheme key "${key}" doesn't match scheme.name "${schemeObj.name}". ` +
                `These should be identical to avoid confusion. ` +
                `Change either the key or the name property to match.`
        );
    }

    // Check required fields
    if (!schemeObj.displayName) {
        logger.warn(
            `[themes] Warning: Scheme "${key}" missing "displayName". ` +
                `This is shown in the UI, so it should be user-friendly like "Dark Mode" or "Ocean Theme".`
        );
    }

    if (!schemeObj.description) {
        logger.warn(
            `[themes] Warning: Scheme "${key}" missing "description". ` +
                `Add a brief description for better UX.`
        );
    }

    // Validate preview colors
    validatePreviewColors(key, schemeObj.preview);
}

/**
 * Validates all schemes in the configuration
 */
function validateSchemes(schemes: unknown): void {
    if (!schemes || typeof schemes !== 'object') {
        logger.warn(
            '[themes] Invalid config: "schemes" must be an object. ' +
                'Example: { schemes: { default: { name: "default", ... } } }'
        );
        return;
    }

    const schemeKeys = Object.keys(schemes);
    if (schemeKeys.length === 0) {
        logger.warn(
            '[themes] Warning: No schemes defined in config. ' +
                'Your theme system will not work without at least one scheme. ' +
                'Add a scheme like: { schemes: { default: { name: "default", displayName: "Default", ... } } }'
        );
        return;
    }

    // Validate each scheme
    for (const [key, scheme] of Object.entries(schemes)) {
        validateScheme(key, scheme);
    }
}

/**
 * Validates route theme configurations
 */
function validateRouteThemes(routeThemes: unknown): void {
    if (!routeThemes || typeof routeThemes !== 'object') {
        return;
    }

    for (const [route, routeConfig] of Object.entries(routeThemes)) {
        if (!routeConfig || typeof routeConfig !== 'object') {
            logger.warn(`[themes] Invalid route theme for "${route}": must be an object`);
            continue;
        }

        const config = routeConfig as Record<string, unknown>;
        if (!config.theme) {
            logger.warn(
                `[themes] Warning: Route theme for "${route}" missing "theme" property. ` +
                    `Add: theme: { base: "dark", scheme: "default" }`
            );
        }
    }
}

/**
 * Validates theme configuration in development mode
 */
function validateConfig(config: ThemeConfig): void {
    // Skip validation in production for performance
    if (!DEV) {
        return;
    }

    validateSchemes(config.schemes);

    if (config.routeThemes) {
        validateRouteThemes(config.routeThemes);
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
