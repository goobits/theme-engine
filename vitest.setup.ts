import '@testing-library/jest-dom/vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// Extend Vitest's expect with jest-dom matchers
// This enables matchers like toBeInTheDocument(), toHaveClass(), etc.

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global test utilities can be added here
// For example, custom matchers or helper functions
