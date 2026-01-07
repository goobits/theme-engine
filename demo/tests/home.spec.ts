import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
	const errors: Error[] = []
	page.on('pageerror', error => {
		errors.push(error)
	})

	const response = await page.goto('/')
	expect(response?.ok()).toBe(true)
	await expect(page.getByRole('heading', { name: /theme engine/i })).toBeVisible()
	await expect(page.getByText(/pick a theme/i)).toBeVisible()
	expect(errors).toEqual([])
})
