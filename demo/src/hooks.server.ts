import { createThemeHooks } from '@goobits/themes/server'
import { themeConfig } from '$lib/config/theme.js'

const { transform } = createThemeHooks(themeConfig)

export const handle = transform
