import { resolve } from 'node:path';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const workspaceRoot = resolve(__dirname, '..');

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['@goobits/themes', '@goobits/themes/goo', '@goobits/themes/server'],
	},
	ssr: {
		noExternal: ['@goobits/themes', '@goobits/themes/goo', '@goobits/themes/server'],
	},
	resolve: {
		alias: {
			'@goobits/themes': resolve(workspaceRoot, 'src/lib/index.ts'),
			'@goobits/themes/core': resolve(workspaceRoot, 'src/lib/core/index.ts'),
			'@goobits/themes/goo': resolve(workspaceRoot, 'src/lib/goo/index.ts'),
			'@goobits/themes/server': resolve(workspaceRoot, 'src/lib/server/index.ts'),
			'@goobits/themes/svelte': resolve(workspaceRoot, 'src/lib/svelte/index.ts'),
			'@goobits/themes/utils': resolve(workspaceRoot, 'src/lib/utils/index.ts'),
		},
	},
	server: {
		fs: {
			allow: [workspaceRoot],
		},
	},
});
