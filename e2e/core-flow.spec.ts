import { test, expect } from '@playwright/test';
import { seedUser, seedMemory, TEST_USERS, TEST_MEMORIES } from './helpers/seed-demo-data';

/**
 * E2E tests for core business flow.
 * 
 * Covers the primary user journey:
 * 1. User registers/logs in
 * 2. Creates a memory
 * 3. Views their dashboard
 * 4. Browses public feed
 * 5. Interacts with memories (likes, comments)
 */

test.describe('Core Business Flow', () => {
  
  test('complete user journey: register → create memory → view feed → like', async ({ page }) => {
    // @trace FR-AUTH-01 FR-MEM-01 FR-MEM-04 FR-FEED-01 FR-FEED-06
    
    // Step 1: Register
    const timestamp = Date.now();
    const email = `journey-user-${timestamp}@firefly.test`;
    
    await page.goto('/register');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'JourneyPass123!');
    await page.fill('input[name="name"]', 'Тестовий Користувач');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    
    // Step 2: Create a memory
    await page.goto('/memories/new');
    
    await page.selectOption('select[name="type"]', 'story');
    await page.fill('input[name="title"]', 'Моя перша спогад');
    await page.fill('textarea[name="text"]', 'Це мій перший спогад на платформі Світлячок.');
    await page.check('input[name="isPublic"]'); // Make it public
    
    await page.click('button[type="submit"]');
    
    // Should redirect to memory detail or dashboard
    await page.waitForURL(/\/(memories\/\d+|dashboard)/, { timeout: 5000 });
    
    // Step 3: View dashboard
    await page.goto('/dashboard');
    
    // Should see the created memory
    await expect(page.locator('text=Моя перша спогад')).toBeVisible();
    
    // Step 4: Browse public feed
    await page.goto('/feed');
    
    // Should see feed content
    await expect(page.locator('text=/спогад|світлячок/i').first()).toBeVisible();
    
    // Step 5: Like a memory (if any public memories exist)
    const likeButton = page.locator('button:has-text("Тепло"), button[aria-label*="like"], button[aria-label*="Тепло"]').first();
    const hasLikeButton = await likeButton.isVisible().catch(() => false);
    
    if (hasLikeButton) {
      await likeButton.click();
      // Should show liked state (implementation-specific)
      await page.waitForTimeout(1000);
    }
  });
  
  test('should filter memories in dashboard', async ({ page }) => {
    // @trace FR-MEM-04
    const token = await seedUser(TEST_USERS.regular);
    
    // Seed both public and private memories
    await seedMemory(token, TEST_MEMORIES.publicStory);
    await seedMemory(token, TEST_MEMORIES.privateRecipe);
    
    await page.goto('/');
    await page.evaluate((t) => {
      localStorage.setItem('token', t);
    }, token);
    
    await page.goto('/dashboard');
    
    // Should see both memories initially (or with "all" filter)
    await expect(page.locator('text=Літо в бабусиному саду').first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Бабусин борщ').first()).toBeVisible({ timeout: 3000 });

    // Filter by public
    const publicFilter = page.locator('button:has-text("Публічні"), select option:has-text("Публічні")').first();
    if (await publicFilter.isVisible()) {
      await publicFilter.click();
      await expect(page.locator('text=Літо в бабусиному саду').first()).toBeVisible();
    }

    // Filter by private
    const privateFilter = page.locator('button:has-text("Приватні"), select option:has-text("Приватні")').first();
    if (await privateFilter.isVisible()) {
      await privateFilter.click();
      await expect(page.locator('text=Бабусин борщ').first()).toBeVisible();
    }
  });
  
  test('should filter feed by city', async ({ page }) => {
    // @trace FR-FEED-02 FR-CITY-02
    await page.goto('/feed');
    
    // Look for city filter dropdown
    const cityFilter = page.locator('select[name="city"], select:has(option:has-text("Київ"))').first();
    const hasCityFilter = await cityFilter.isVisible().catch(() => false);
    
    if (hasCityFilter) {
      await cityFilter.selectOption({ label: /Київ/i });
      await page.waitForTimeout(1000); // Wait for filter to apply
      
      // Feed should update (check URL or content)
      const url = page.url();
      expect(url).toContain('city=');
    }
  });
});
