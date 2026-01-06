import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/svelte'
import { afterEach } from 'vitest'

// Extend Vitest's expect with jest-dom matchers
// This enables matchers like toBeInTheDocument(), toHaveClass(), etc.
// The matchers are automatically available via the import above

// Cleanup after each test
afterEach(() => {
	cleanup()
})

// Global test utilities can be added here
// For example, custom matchers or helper functions
