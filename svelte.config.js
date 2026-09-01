import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        outDir: process.env.GOOBITS_THEMES_SVELTEKIT_OUT_DIR || '.svelte-kit',
    },
};

export default config;
