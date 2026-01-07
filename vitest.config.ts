import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST })],
    test: {
        cache: {
            dir: '.artifacts/vitest',
        },
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['**/*.{test,spec}.{js,ts}'],
        exclude: ['node_modules/**', 'dist/**', '.svelte-kit/**', 'demo/**', '.pnpm-store/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['core/**', 'svelte/**', 'server/**', 'utils/**'],
            exclude: ['node_modules/**', 'test/**', '**/*.d.ts', '**/*.config.*', '**/index.ts'],
        },
    },
    resolve: {
        alias: {
			'$app/environment': resolve(__dirname, 'test/mocks/$appEnvironment.ts'),
			'$app/stores': resolve(__dirname, 'test/mocks/$appStores.ts'),
        },
    },
});
