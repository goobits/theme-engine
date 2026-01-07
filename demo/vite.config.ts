import { resolve } from 'node:path';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const workspaceRoot = resolve(__dirname, '..');

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['@goobits/themes'],
	},
	ssr: {
		noExternal: ['@goobits/themes'],
	},
	server: {
		fs: {
			allow: [workspaceRoot],
		},
	},
});
