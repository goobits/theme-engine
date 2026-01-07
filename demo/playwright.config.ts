import { defineConfig } from '@playwright/test'

export default defineConfig({
	testDir: './tests',
	use: {
		baseURL: 'http://localhost:3410'
	},
	webServer: {
		command: 'pnpm dev -- --host 0.0.0.0 --port 3410',
		url: 'http://localhost:3410',
		reuseExistingServer: true
	}
})
