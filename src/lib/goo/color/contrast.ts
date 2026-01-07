/**
 * WCAG contrast and luminance utilities
 */

import { blendColors, rgbToHex } from './manipulate.js'
import { parseColor } from './parse.js'

/** WCAG contrast compliance info */
export interface ContrastInfo {
	ratio: number
	AA: boolean
	AAA: boolean
	AALarge: boolean
	AAALarge: boolean
}

/** Options for isReadable check */
export interface ReadabilityOptions {
	level?: 'AA' | 'AAA'
	largeText?: boolean
}

/**
 * Calculate relative luminance of a color (0-1).
 * Uses WCAG 2.1 formula.
 */
export const getLuminance = (color: string): number => {
	const rgb = parseColor(color)
	if (!rgb) return 0

	const [ r, g, b ] = rgb.map(c => {
		c = c / 255
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
	})

	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors (1-21).
 */
export const contrast = (color1: string, color2: string): number => {
	const l1 = getLuminance(color1)
	const l2 = getLuminance(color2)

	const lighter = Math.max(l1, l2)
	const darker = Math.min(l1, l2)

	return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if two colors have sufficient contrast for readability (WCAG 2.1).
 *
 * @example
 * isReadable('#000', '#fff')                    // Normal text, AA
 * isReadable('#000', '#fff', 'AAA')             // Normal text, AAA
 * isReadable('#000', '#fff', { largeText: true }) // Large text, AA
 */
export const isReadable = (
	color1: string,
	color2: string,
	options: ReadabilityOptions | 'AA' | 'AAA' = 'AA'
): boolean => {
	const ratio = contrast(color1, color2)

	// Handle legacy string argument
	const opts: ReadabilityOptions = typeof options === 'string'
		? { level: options }
		: options

	const { level = 'AA', largeText = false } = opts

	// WCAG 2.1 contrast requirements:
	// Normal text: AA = 4.5:1, AAA = 7:1
	// Large text (18pt+ or 14pt+ bold): AA = 3:1, AAA = 4.5:1
	if (largeText) {
		return level === 'AAA' ? ratio >= 4.5 : ratio >= 3
	}
	return level === 'AAA' ? ratio >= 7 : ratio >= 4.5
}

/**
 * Get detailed WCAG compliance info for a color pair.
 */
export const contrastInfo = (color1: string, color2: string): ContrastInfo => {
	const ratio = contrast(color1, color2)
	return {
		ratio,
		AA: ratio >= 4.5,
		AAA: ratio >= 7,
		AALarge: ratio >= 3,
		AAALarge: ratio >= 4.5
	}
}

/**
 * Pick the color with best contrast against a background.
 */
export const bestContrast = (background: string, options: string[]): string => {
	let best = options[0]
	let bestRatio = 0

	for (const color of options) {
		const ratio = contrast(background, color)
		if (ratio > bestRatio) {
			bestRatio = ratio
			best = color
		}
	}

	return best
}

/**
 * Calculate contrast with alpha-blending support.
 * If foreground has alpha, it's blended with background first.
 */
export const contrastWithAlpha = (bgColor: string, fgColor: string): number => {
	// If fg has alpha, blend it with bg first
	let effectiveFg = fgColor
	if (fgColor.includes('rgba')) {
		const blended = blendColors(fgColor, bgColor)
		effectiveFg = rgbToHex(...blended)
	}

	return contrast(bgColor, effectiveFg)
}
