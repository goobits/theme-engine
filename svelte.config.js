import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        package: {
            dir: 'dist',
            emitTypes: true,
            exports: filepath => {
                // Include all .ts and .svelte files from the root directories
                if (filepath.endsWith('.d.ts')) return true;
                if (filepath.endsWith('.svelte')) return true;
                if (filepath.endsWith('.js')) return true;
                if (filepath === 'index.js') return true;
                return false;
            },
            files: filepath => {
                // Exclude test files and config files
                return (
                    !filepath.includes('test') &&
                    !filepath.includes('.spec.') &&
                    !filepath.includes('.test.')
                );
            },
        },
    },
};

export default config;
