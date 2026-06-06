import { test, expect } from '@playwright/test'

test.describe('Share functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
  })

  test('copy link button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /copy link/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('copy link button shows success toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await expect(
      page.getByRole('button', { name: /copy link/i })
    ).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /copy link/i }).click()
    await expect(
      page.locator('text=/copied/i')
    ).toBeVisible({ timeout: 5_000 })
  })

  test('email list button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /email list/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('email share modal opens', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /email list/i })
    ).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /email list/i }).click()
    await expect(
      page.locator('h2', { hasText: /share via email/i })
    ).toBeVisible({ timeout: 5_000 })
    await expect(
      page.getByPlaceholder(/friend@example.com/i)
    ).toBeVisible()
  })
})
