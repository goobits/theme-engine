import { defineConfig } from '@playwright/test'

export default defineConfig({
	testDir: './tests',
	use: {
		baseURL: 'http://localhost:3410'
	},
	webServer: {
		command: 'pnpm dev',
		url: 'http://localhost:3410',
		reuseExistingServer: false
	}
})
