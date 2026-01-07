import type { ThemeConfig } from '@goobits/themes/core'
import { themePairs } from '@goobits/themes/goo'

const toDisplayName = (name: string): string =>
	name
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/-/g, ' ')
		.replace(/\b\w/g, char => char.toUpperCase())

/**
 * Simple color distance calculation (RGB euclidean distance).
 */
const colorDistance = (hex1: string, hex2: string): number => {
	const parse = (hex: string) => {
		const h = hex.replace('#', '')
		return [
			parseInt(h.slice(0, 2), 16),
			parseInt(h.slice(2, 4), 16),
			parseInt(h.slice(4, 6), 16)
		]
	}

	// Handle rgba() colors by extracting hex or using fallback
	const normalize = (color: string): string => {
		if (color.startsWith('rgba') || color.startsWith('rgb')) {
			return '#808080' // Fallback for rgba colors
		}
		return color
	}

	const [ r1, g1, b1 ] = parse(normalize(hex1))
	const [ r2, g2, b2 ] = parse(normalize(hex2))

	return Math.sqrt((r2 - r1) ** 2 + (g2 - g1) ** 2 + (b2 - b1) ** 2)
}

/**
 * Pick two distinct colors for the gradient preview.
 * Uses accent + the most visually distinct color from candidates.
 */
const pickGradientColors = (pair: typeof themePairs[string]): { primary: string; accent: string } => {
	const dark = pair.dark
	const accent = dark.accent

	// Candidates for the second gradient color
	const candidates = [
		dark.heading,
		dark.secondary,
		dark.bg
	].filter(c => c && !c.startsWith('rgba'))

	// Find the most distinct color from accent
	let bestColor = dark.secondary || accent
	let maxDistance = 0

	for (const candidate of candidates) {
		const distance = colorDistance(accent, candidate)
		if (distance > maxDistance) {
			maxDistance = distance
			bestColor = candidate
		}
	}

	return {
		primary: accent,
		accent: bestColor
	}
}

const gooSchemes: ThemeConfig['schemes'] = Object.fromEntries(
	Object.entries(themePairs).map(([ base, pair ]) => {
		const name = `goo-${ base }`
		const displayName = toDisplayName(base)
		const gradientColors = pickGradientColors(pair)

		return [
			name,
			{
				name,
				displayName,
				description: `Goo preset: ${ displayName }`,
				preview: {
					primary: gradientColors.primary,
					accent: gradientColors.accent,
					background: pair.dark.bg
				}
			}
		]
	})
)

export const themeConfig: ThemeConfig = {
	schemes: gooSchemes
}
