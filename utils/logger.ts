// A simple logger for the theme package
export const logger = {
  info: (...args: unknown[]) => console.log('[svelte-themes]', ...args),
  debug: (...args: unknown[]) => console.log('[svelte-themes]', ...args),
  warn: (...args: unknown[]) => console.warn('[svelte-themes]', ...args),
  error: (...args: unknown[]) => console.error('[svelte-themes]', ...args),
};
