import { test, expect } from '@playwright/test';
import { seedUser, TEST_USERS } from './helpers/seed-demo-data';

/**
 * E2E tests for role-based access control (RBAC).
 * 
 * Covers:
 * - FR-MOD-03: Admin can access /admin
 * - Regular users cannot access /admin
 * - Admin-only actions are properly protected
 */

test.describe('RBAC - Role-Based Access Control', () => {
  
  test('should deny regular users access to admin panel', async ({ page }) => {
    // @trace FR-MOD-03
    const token = await seedUser(TEST_USERS.regular);
    
    await page.goto('/');
    await page.evaluate((t) => {
      localStorage.setItem('token', t);
    }, token);
    
    await page.goto('/admin');
    
    // Should either redirect to home/dashboard or show access denied
    await page.waitForURL(/\/(dashboard|login)?$/, { timeout: 5000 });
    
    // Should NOT see admin content
    const hasAdminContent = await page.locator('text=/звіт|користувач|бан/i').isVisible().catch(() => false);
    expect(hasAdminContent).toBe(false);
  });
  
  test('should allow admin users to access admin panel', async ({ page }) => {
    // @trace FR-MOD-03
    // Note: This test requires the ability to create admin users
    // In a real scenario, you'd need a test endpoint or manual DB setup
    
    // For now, we skip this test if we can't create admin users programmatically
    // The backend integration tests cover this scenario
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'Admin user creation not configured for E2E');
    
    const adminToken = await seedUser({
      ...TEST_USERS.admin,
      email: process.env.TEST_ADMIN_EMAIL || TEST_USERS.admin.email,
    });
    
    await page.goto('/');
    await page.evaluate((t) => {
      localStorage.setItem('token', t);
    }, adminToken);
    
    await page.goto('/admin');
    
    // Should stay on admin page
    await expect(page).toHaveURL('/admin', { timeout: 5000 });
    
    // Should see admin-specific content
    await expect(page.locator('text=/звіт|модерація/i')).toBeVisible();
  });
  
  test('should redirect anonymous users trying to create content', async ({ page }) => {
    // @trace FR-AUTH-05
    await page.goto('/memories/new');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});
