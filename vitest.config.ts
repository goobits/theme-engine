import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST })],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['**/*.{test,spec}.{js,ts}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['core/**', 'svelte/**', 'server/**', 'utils/**'],
            exclude: ['node_modules/**', 'test/**', '**/*.d.ts', '**/*.config.*', '**/index.ts'],
        },
    },
    resolve: {
        alias: {
            '$app/environment': '/home/user/theme-engine/test/mocks/$app-environment.ts',
            '$app/stores': '/home/user/theme-engine/test/mocks/$app-stores.ts',
            '@lucide/svelte': '/home/user/theme-engine/test/mocks/@lucide-svelte.ts',
        },
    },
});
