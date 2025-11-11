/**
 * Mock for SvelteKit's $app/stores module
 * Used in tests to simulate SvelteKit's stores
 */

import { readable, writable } from 'svelte/store';

const getStores = () => {
  const navigating = writable(null);
  const updated = { subscribe: readable(false).subscribe, check: async () => false };

  const page = writable({
    url: new URL('http://localhost'),
    params: {},
    route: {
      id: null,
    },
    status: 200,
    error: null,
    data: {},
    state: {},
    form: undefined,
  });

  return { navigating, page, updated };
};

const stores = getStores();

export const navigating = stores.navigating;
export const page = stores.page;
export const updated = stores.updated;
