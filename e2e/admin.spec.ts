import { test, expect } from '@playwright/test'

test.describe('Admin authentication', () => {
  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 })
  })

  test('admin login page renders correctly', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('heading', { name: /admin sign in/i })
    ).toBeVisible()

    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /sign in/i })
    ).toBeVisible()
  })

  test('login form shows error on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')

    await page.locator('input[type="email"]').fill('wrong@test.com')
    await page.locator('input[type="password"]').fill('wrongpassword123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(
      page.locator('[class*="red"]').first()
    ).toBeVisible({ timeout: 10_000 })

    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('login form requires email and password', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/admin\/login/)

    await expect(page.locator('input[type="email"]')).toBeVisible()
  })
})