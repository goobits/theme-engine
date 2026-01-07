/**
 * Color manipulation utilities
 */

import { parseColor, type RGB } from './parse.js'

/**
 * Convert RGB values to hex string.
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
	return '#' + [ r, g, b ].map(x => {
		const hex = Math.round(x).toString(16)
		return hex.length === 1 ? '0' + hex : hex
	}).join('')
}

/**
 * Lighten a color by a percentage.
 * @param color - CSS color string or theme key
 * @param amount - Amount to lighten (0-100)
 */
export const lighten = (color: string, amount: number): string => {
	const rgb = parseColor(color)
	if (!rgb) return color

	const factor = amount / 100
	const lightened: RGB = [
		Math.round(rgb[0] + (255 - rgb[0]) * factor),
		Math.round(rgb[1] + (255 - rgb[1]) * factor),
		Math.round(rgb[2] + (255 - rgb[2]) * factor)
	]
	return rgbToHex(...lightened)
}

/**
 * Darken a color by a percentage.
 * @param color - CSS color string or theme key
 * @param amount - Amount to darken (0-100)
 */
export const darken = (color: string, amount: number): string => {
	const rgb = parseColor(color)
	if (!rgb) return color

	const factor = 1 - (amount / 100)
	const darkened: RGB = [
		Math.round(rgb[0] * factor),
		Math.round(rgb[1] * factor),
		Math.round(rgb[2] * factor)
	]
	return rgbToHex(...darkened)
}

/**
 * Add alpha transparency to a color.
 * @param color - CSS color string
 * @param alphaValue - Alpha value (0-1)
 */
export const alpha = (color: string, alphaValue: number): string => {
	const rgb = parseColor(color)
	if (!rgb) return color

	return `rgba(${ rgb.join(', ') }, ${ alphaValue })`
}

/**
 * Blend a foreground color with alpha over a background color.
 * @returns Blended RGB values
 */
export const blendColors = (fgColor: string, bgColor: string): RGB => {
	const fgRgb = parseColor(fgColor)
	const bgRgb = parseColor(bgColor)

	if (!fgRgb || !bgRgb) return fgRgb || bgRgb || [ 0, 0, 0 ]

	// Extract alpha from rgba
	const alphaMatch = fgColor.match(/rgba?\s*\([^)]+,\s*([\d.]+)\s*\)/)
	const a = alphaMatch ? parseFloat(alphaMatch[1]) : 1

	// Blend: result = fg * alpha + bg * (1 - alpha)
	return [
		Math.round(fgRgb[0] * a + bgRgb[0] * (1 - a)),
		Math.round(fgRgb[1] * a + bgRgb[1] * (1 - a)),
		Math.round(fgRgb[2] * a + bgRgb[2] * (1 - a))
	]
}
