import { expect, test } from '@playwright/test'

test('unauthenticated visitor is redirected to login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('admin can log in and reach the users grid', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('admin@example.com')
  await page.getByLabel(/password/i).fill('password')
  await page.getByRole('button', { name: /sign in/i }).click()

  await expect(page).toHaveURL(/\/$/)
  await page.getByRole('link', { name: 'Users' }).click()

  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
  await expect(page.getByText(/\d+ users/)).toBeVisible()
})
