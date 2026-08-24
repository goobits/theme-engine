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
	server: {
		host: '0.0.0.0',
		port: 3410,
		strictPort: true
	},
	preview: {
		host: '0.0.0.0',
		port: 3410,
		strictPort: true
	},
	cacheDir: '../.artifacts/vite/demo'
})
