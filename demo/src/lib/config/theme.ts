import type { ThemeConfig } from '../../../../src/lib/core/config.js'
import { themePairs } from '../../../../src/lib/goo/presets.js'

const toDisplayName = (name: string): string =>
	name
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/-/g, ' ')
		.replace(/\b\w/g, char => char.toUpperCase())

const gooSchemes: ThemeConfig['schemes'] = Object.fromEntries(
	Object.entries(themePairs).map(([ base, pair ]) => {
		const name = `goo-${ base }`
		const displayName = toDisplayName(base)

		return [
			name,
			{
				name,
				displayName,
				description: `Goo preset: ${ displayName }`,
				preview: {
					primary: pair.dark.accent,
					accent: pair.dark.secondary || pair.dark.accent,
					background: pair.dark.bg
				}
			}
		]
	})
)

export const themeConfig: ThemeConfig = {
	schemes: gooSchemes
}
