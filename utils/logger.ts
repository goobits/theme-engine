// A simple logger for the theme package
export const logger = {
    info: (...args: any[]) => console.log('[svelte-themes]', ...args),
    debug: (...args: any[]) => console.log('[svelte-themes]', ...args),
    warn: (...args: any[]) => console.warn('[svelte-themes]', ...args),
    error: (...args: any[]) => console.error('[svelte-themes]', ...args),
};
