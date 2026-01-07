import { createThemeHooks } from '../../src/lib/server/index.js'
import { themeConfig } from '$lib/config/theme.js'

const { transform } = createThemeHooks(themeConfig)

export const handle = transform
