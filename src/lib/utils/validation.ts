/**
 * Validation utilities for the theme engine.
 *
 * Provides common validation functions used throughout the theme system.
 *
 * @module validation
 */

/**
 * Check if a string is a valid hex color
 *
 * @param color - The color string to validate
 * @returns True if the color is a valid 6-digit hex color
 *
 * @example
 * ```typescript
 * isValidHexColor('#ff0000') // true
 * isValidHexColor('#fff')    // false (3-digit not supported)
 * isValidHexColor('red')     // false
 * ```
 */
export function isValidHexColor(color: string): boolean {
	return /^#[0-9a-f]{6}$/i.test(color)
}
