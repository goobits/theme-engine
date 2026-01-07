import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ locals }) => ({
	preferences: locals.themePreferences
})
