import { test, expect } from '@playwright/test'

test.describe('Hospital search', () => {
  test('home page loads correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveTitle(/Carefinder/, { timeout: 10_000 })
  })

  test('search page loads hospitals on initial load', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    const cards = page.locator('a[href^="/hospitals/"]')
    await expect(cards.first()).toBeVisible({ timeout: 15_000 })
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('searching by city filters results', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    await expect(
      page.locator('a[href^="/hospitals/"]').first()
    ).toBeVisible({ timeout: 15_000 })

    await page.getByPlaceholder(/search by name/i).fill('Lagos')
    await page.getByRole('button', { name: /search hospitals/i }).click()
    await page.waitForTimeout(2000)

    expect(
      await page.locator('a[href^="/hospitals/"]').count()
    ).toBeGreaterThan(0)
  })

  test('search updates URL with query params', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    await page.getByPlaceholder(/search by name/i).fill('Abuja')
    await page.getByRole('button', { name: /search hospitals/i }).click()
    await page.waitForTimeout(2000)

    expect(page.url()).toContain('q=Abuja')
  })

  test('empty search shows no results message', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    await page.getByPlaceholder(/search by name/i)
      .fill('xyznonexistenthospital999')
    await page.getByRole('button', { name: /search hospitals/i }).click()
    await page.waitForTimeout(2000)

    await expect(
      page.getByText(/no hospitals found/i)
    ).toBeVisible({ timeout: 10_000 })
  })
})
