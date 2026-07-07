import { test, expect } from '@playwright/test';
import { seedUser, TEST_USERS } from './helpers/seed-demo-data';

/**
 * E2E tests for authentication and authorization.
 * 
 * Covers:
 * - FR-AUTH-01: User registration
 * - FR-AUTH-02: User login
 * - FR-AUTH-03: User logout
 * - FR-AUTH-05: Unauthenticated redirect
 */

test.describe('Authentication', () => {
  
  test('should allow user registration', async ({ page }) => {
    // @trace FR-AUTH-01
    await page.goto('/register');
    
    const timestamp = Date.now();
    const email = `new-user-${timestamp}@firefly.test`;
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'NewPass123!');
    await page.fill('input[name="name"]', 'Новий Користувач');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    
    // Should see user name in header
    await expect(page.locator('text=Новий Користувач')).toBeVisible();
  });
  
  test('should allow user login', async ({ page }) => {
    // @trace FR-AUTH-02
    // Seed a user first
    await seedUser(TEST_USERS.regular);
    
    await page.goto('/login');
    
    await page.fill('input[name="email"]', TEST_USERS.regular.email);
    await page.fill('input[name="password"]', TEST_USERS.regular.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    await expect(page.locator(`text=${TEST_USERS.regular.name}`)).toBeVisible();
  });
  
  test('should allow user logout', async ({ page }) => {
    // @trace FR-AUTH-03
    const token = await seedUser(TEST_USERS.regular);
    
    // Set token in localStorage to simulate logged-in state
    await page.goto('/');
    await page.evaluate((t) => {
      localStorage.setItem('token', t);
    }, token);
    
    await page.goto('/dashboard');
    await expect(page.locator(`text=${TEST_USERS.regular.name}`)).toBeVisible();
    
    // Click logout (look for button or link with text containing "Вийти" or similar)
    await page.click('text=/Вийти|Logout/i');
    
    // Should redirect to home or login
    await expect(page).toHaveURL(/\/(login)?$/, { timeout: 5000 });
    
    // Token should be cleared
    const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenAfter).toBeNull();
  });
  
  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // @trace FR-AUTH-05
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
  
  test('should show login errors for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'nonexistent@firefly.test');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    
    // Should show error message (Ukrainian)
    await expect(page.locator('text=/помилка|невірн|не знайдено/i')).toBeVisible({ timeout: 3000 });
  });
});
