import { test, expect } from '@playwright/test'

test.describe('CSV export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    await expect(
      page.locator('a[href^="/hospitals/"]').first()
    ).toBeVisible({ timeout: 15_000 })
  })

  test('export CSV button is visible in results area', async ({ page }) => {
    // Target the green Export CSV button in main (not navbar)
    await expect(
      page.locator('main').getByRole('button', { name: /export csv/i })
    ).toBeVisible()
  })

  test('export modal opens when export button is clicked', async ({ page }) => {
    await page.locator('main')
      .getByRole('button', { name: /export csv/i }).click()
    await expect(
      page.locator('h2', { hasText: /export csv/i })
    ).toBeVisible({ timeout: 5_000 })
  })

  test('export modal contains checkboxes for column selection', async ({ page }) => {
    await page.locator('main')
      .getByRole('button', { name: /export csv/i }).click()
    await expect(
      page.locator('h2', { hasText: /export csv/i })
    ).toBeVisible({ timeout: 5_000 })
    await expect(page.getByRole('checkbox').first()).toBeVisible()
    expect(await page.getByRole('checkbox').count()).toBeGreaterThan(0)
  })

  test('download triggers a CSV file download', async ({ page }) => {
    await page.locator('main')
      .getByRole('button', { name: /export csv/i }).click()
    await expect(
      page.locator('h2', { hasText: /export csv/i })
    ).toBeVisible({ timeout: 5_000 })

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /download csv/i }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.csv$/)
  })

  test('cancel button closes the export modal', async ({ page }) => {
    await page.locator('main')
      .getByRole('button', { name: /export csv/i }).click()
    await expect(
      page.locator('h2', { hasText: /export csv/i })
    ).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(
      page.locator('h2', { hasText: /export csv/i })
    ).not.toBeVisible({ timeout: 3_000 })
  })
})
