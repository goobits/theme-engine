import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		rolldownOptions: { tsconfig: false }
	},
	ssr: {
		optimizeDeps: {
			rolldownOptions: { tsconfig: false }
		},
		noExternal: ['@lucide/svelte']
	},
	cacheDir: '../.artifacts/vite/demo'
})
