import { test, expect } from '@playwright/test'

test.describe('Hospital detail page', () => {
  async function goToFirstHospital(page: import('@playwright/test').Page) {
    await page.goto('/search')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    const firstCard = page.locator('a[href^="/hospitals/"]').first()
    await expect(firstCard).toBeVisible({ timeout: 15_000 })
    const href = await firstCard.getAttribute('href')
    await firstCard.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    return href
  }

  test('clicking a hospital card opens the detail page', async ({ page }) => {
    const href = await goToFirstHospital(page)
    expect(href).toMatch(/\/hospitals\//)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 })
  })

  test('detail page shows hospital information', async ({ page }) => {
    await goToFirstHospital(page)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 })
    await expect(
      page.locator('h2', { hasText: 'Visiting Hours' })
    ).toBeVisible({ timeout: 5_000 })
    await expect(
      page.locator('a', { hasText: 'Call Hospital' })
    ).toBeVisible()
    await expect(
      page.locator('a', { hasText: 'Get Directions' })
    ).toBeVisible()
    await expect(
      page.locator('h3', { hasText: 'Write a review' })
    ).toBeVisible()
  })

  test('back to results navigates to search page', async ({ page }) => {
    await goToFirstHospital(page)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 })
    await page.locator('a[href="/search"]').first().click()
    await expect(page).toHaveURL(/\/search/, { timeout: 10_000 })
  })
})
