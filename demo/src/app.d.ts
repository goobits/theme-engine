import type { ThemeLocals } from '@goobits/themes/server'

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals extends ThemeLocals {}
	}
}

export {}
