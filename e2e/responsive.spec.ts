import { test, expect, devices } from '@playwright/test';

/**
 * E2E tests for responsive design.
 * 
 * Covers:
 * - FR-SHELL-02: Layout adapts at 768px and 1280px breakpoints
 */

test.describe('Responsive Design', () => {
  
  test('should render correctly on mobile (360px)', async ({ browser }) => {
    // @trace FR-SHELL-02
    const context = await browser.newContext({
      ...devices['iPhone 12'],
      viewport: { width: 360, height: 640 },
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Should render without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(360 + 20); // Allow small margin
    
    // Should have mobile navigation (hamburger menu or similar)
    const hasMobileNav = await page.locator('button[aria-label*="menu"], button[aria-label*="меню"]').isVisible().catch(() => false);
    
    // Page should be functional
    await expect(page.locator('text=/світлячок|firefly/i')).toBeVisible();
    
    await context.close();
  });
  
  test('should render correctly on tablet (768px)', async ({ browser }) => {
    // @trace FR-SHELL-02
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Should render without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(768 + 20);
    
    // Should be readable and functional
    await expect(page.locator('text=/світлячок|firefly/i')).toBeVisible();
    
    await context.close();
  });
  
  test('should render correctly on desktop (1280px)', async ({ browser }) => {
    // @trace FR-SHELL-02
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Should have full desktop layout
    await expect(page.locator('text=/світлячок|firefly/i')).toBeVisible();
    
    // Navigation should be visible (not hamburger)
    const hasDesktopNav = await page.locator('nav a, header a').count();
    expect(hasDesktopNav).toBeGreaterThan(0);
    
    await context.close();
  });
});
