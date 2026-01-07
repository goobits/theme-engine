/**
 * Color parsing utilities
 */

/** RGB tuple [red, green, blue] with values 0-255 */
export type RGB = [number, number, number]

/** Common named colors mapped to RGB values */
const NAMED_COLORS: Record<string, RGB> = {
	white: [ 255, 255, 255 ],
	black: [ 0, 0, 0 ],
	red: [ 255, 0, 0 ],
	green: [ 0, 128, 0 ],
	blue: [ 0, 0, 255 ],
	transparent: [ 0, 0, 0 ] // Treated as black for contrast calculations
}

/**
 * Parse any CSS color to RGB array.
 * Supports hex (#fff, #ffffff), rgb(), rgba(), and named colors.
 */
export const parseColor = (color: string): RGB | null => {
	if (!color) return null

	// Handle hex colors
	if (color.startsWith('#')) {
		let hex = color.slice(1)
		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
		}
		const num = parseInt(hex, 16)
		if (isNaN(num)) return null
		return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ]
	}

	// Handle rgb() and rgba()
	const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
	if (rgbMatch) {
		return [ parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]) ]
	}

	// Handle named colors
	const lower = color.toLowerCase().trim()
	if (NAMED_COLORS[lower]) {
		return NAMED_COLORS[lower]
	}

	return null
}

/**
 * Parse hex color to RGB array.
 * @deprecated Use parseColor instead
 */
export const hexToRgb = (hex: string): RGB | null => parseColor(hex)
