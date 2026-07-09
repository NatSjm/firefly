# Manual Test Plan — Svitlyachok MVP

**For human QA testers. These scenarios verify behavior not fully covered by automated tests.**

---

## Overview

This document contains 47 structured test scenarios organized by capability area. Each scenario includes:
- **Preconditions:** What state must exist before the test
- **Steps:** Numbered action sequence
- **Expected Results:** Outcome to verify
- **Cleanup:** Reset actions if needed
- **Notes:** Edge cases, browser/device considerations

### Test Data Setup

Create these accounts before starting:

```
User A (regular user):
  Email: qa-user-a@test.uk
  Password: SecurePass123!
  Name: Марія Петренко

User B (regular user):
  Email: qa-user-b@test.uk
  Password: SecurePass456!
  Name: Іван Ковальчук

Admin User:
  Email: qa-admin@test.uk
  Password: AdminPass789!
  Name: Адміністратор
  Role: admin (set in database)

All users should have valid memories, lost requests, and comments created for social testing.
```

---

## 1. AUTHENTICATION (FR-AUTH-01 to FR-AUTH-05)

### Test 1.1: User Registration — Valid Email & Password
**ID:** FR-AUTH-01.01-positive-register  
**Preconditions:** No user with email qa-register-new@test.uk exists  
**Steps:**
1. Navigate to /register
2. Enter email: qa-register-new@test.uk
3. Enter password: ValidPass123!
4. Enter name: Новий користувач
5. Click "Зареєструватися"

**Expected Results:**
- Form submits successfully
- JWT token stored in localStorage (verify in DevTools → Application)
- Redirected to /dashboard (or /login if manual verification required)
- User profile shows entered name

**Cleanup:** Delete user from database or use unique email for each run

---

### Test 1.2: User Registration — Duplicate Email
**ID:** FR-AUTH-01.02-negative-duplicate-email  
**Preconditions:** User qa-user-a@test.uk already exists  
**Steps:**
1. Navigate to /register
2. Enter email: qa-user-a@test.uk (existing)
3. Enter password: ValidPass123!
4. Enter name: Якийсь Користувач
5. Click "Зареєструватися"

**Expected Results:**
- Error message displayed: "Email вже зареєстрований" (or equivalent)
- No redirect occurs
- Page remains on /register
- Email field retains focus for correction

---

### Test 1.3: User Registration — Weak Password
**ID:** FR-AUTH-01.03-negative-weak-password  
**Preconditions:** Clean register page  
**Steps:**
1. Navigate to /register
2. Enter email: qa-weak-pass@test.uk
3. Enter password: short (less than 8 chars)
4. Click "Зареєструватися" or blur password field

**Expected Results:**
- Client-side or server validation error: "Пароль повинен мати мінімум 8 символів"
- Submit is prevented
- User can correct and retry

---

### Test 1.4: User Login — Valid Credentials
**ID:** FR-AUTH-02.01-positive-login  
**Preconditions:** User qa-user-a@test.uk with password SecurePass123! exists  
**Steps:**
1. Navigate to /login
2. Enter email: qa-user-a@test.uk
3. Enter password: SecurePass123!
4. Click "Увійти"

**Expected Results:**
- Form submits successfully
- JWT token stored in localStorage
- Redirected to /dashboard or home
- Header shows user name "Марія Петренко"
- Logout button visible in header

---

### Test 1.5: User Login — Incorrect Password
**ID:** FR-AUTH-02.02-negative-wrong-password  
**Preconditions:** User qa-user-a@test.uk exists  
**Steps:**
1. Navigate to /login
2. Enter email: qa-user-a@test.uk
3. Enter password: WrongPassword123!
4. Click "Увійти"

**Expected Results:**
- Error message: "Невірна пошта або пароль" (translated Ukrainian error)
- No token stored
- Page remains on /login
- Email and password fields cleared or retain email

---

### Test 1.6: User Logout
**ID:** FR-AUTH-03.01-positive-logout  
**Preconditions:** User logged in as qa-user-a@test.uk  
**Steps:**
1. Click user menu in top-right header
2. Select "Вийти" (Logout)

**Expected Results:**
- Logout request sent to backend
- JWT token removed from localStorage
- Redirected to /feed (public page)
- Header shows "Увійти" (Login) button instead of user name
- Accessing /dashboard redirects to /login

---

### Test 1.7: Profile View & Edit
**ID:** FR-AUTH-04.01-positive-edit-profile  
**Preconditions:** User logged in as qa-user-a@test.uk  
**Steps:**
1. Navigate to /profile
2. Verify current name, bio, avatar URL display
3. Click "Редагувати" (Edit button)
4. Change name to "Оновлена Марія"
5. Add bio: "Мені 35 років, люблю старі фотографії"
6. Enter avatar URL: https://example.com/avatar.jpg
7. Click "Зберегти" (Save)

**Expected Results:**
- Profile updates successfully
- Page shows updated values
- PUT /api/users/me called with new data
- No console errors

**Notes:** Avatar URL should be any valid public HTTPS URL; if not HTTPS, browser may block

---

### Test 1.8: Protected Route Redirect — Unauthenticated Access
**ID:** FR-AUTH-05.01-negative-protected-redirect  
**Preconditions:** Browser localStorage cleared (logged out)  
**Steps:**
1. Manually navigate to /dashboard
2. Observe redirect

**Expected Results:**
- Redirected to /login
- Query parameter ?returnTo=/dashboard may be appended (for return after login)
- No 403 error; clean redirect

---

## 2. MEMORIES — CREATE & VIEW (FR-MEM-01 to FR-MEM-06)

### Test 2.1: Create Memory — Story Type, Complete Fields
**ID:** FR-MEM-01.01-positive-create-story  
**Preconditions:** User logged in as qa-user-a@test.uk  
**Steps:**
1. Navigate to /dashboard or click "Створити спогад" button
2. Click "Нова історія" or "История" (Story type)
3. Enter Title: "Мої улюблені дворові ігри"
4. Select Topic: "Дворові ігри" from dropdown
5. Enter City: Start typing "Київ" (autocomplete shown)
6. Select "Київ" from autocomplete
7. Enter Year Range: From 1990, To 1995
8. Enter full Text: (several sentences about childhood games)
9. Click "Додати фото" and upload a valid JPEG/PNG (< 10 MB)
10. Select Visibility: "Публічна" (Public)
11. Click "Зберегти спогад"

**Expected Results:**
- Form validates successfully (all required fields filled)
- Memory created and stored
- Redirect to /memories/{id} (detail page)
- Detail page shows all entered information
- Photo displays correctly
- Memory appears in /dashboard with "Публічна" tag
- Memory appears in /feed if browsing as another user

**Cleanup:** Delete memory from dashboard

---

### Test 2.2: Create Memory — Recipe Type, Optional Fields
**ID:** FR-MEM-01.02-positive-create-recipe  
**Preconditions:** User logged in as qa-user-b@test.uk  
**Steps:**
1. Navigate to /dashboard
2. Click "Нова рецепта" (Recipe type)
3. Enter Title: "Бабусина кисла капуста"
4. Select Topic: "Бабусині рецепти"
5. Skip City (optional)
6. Skip Year Range (optional)
7. Enter Ingredients: (multi-line list of ingredients)
8. Enter Steps: (numbered cooking instructions)
9. Skip Photo (optional)
10. Select Visibility: "Приватна" (Private)
11. Click "Зберегти спогад"

**Expected Results:**
- Memory created successfully
- Recipe fields (ingredients, steps) stored and displayed
- No photo required
- Recipe appears only in user's /dashboard, not in /feed
- Error if ingredients/steps too long (server limit check)

---

### Test 2.3: Create Memory — Missing Required Field
**ID:** FR-MEM-02.01-negative-missing-title  
**Preconditions:** User logged in  
**Steps:**
1. Go to create memory page
2. Leave Title blank
3. Enter other required fields (text, visibility)
4. Try to submit

**Expected Results:**
- Validation error: "Назва обов'язкова" (Title required)
- Form does not submit
- Field highlighted in red (or similar visual indicator)

---

### Test 2.4: View Dashboard — Filter by Visibility
**ID:** FR-MEM-04.01-positive-dashboard-filter  
**Preconditions:** User qa-user-a@test.uk has 3+ memories (mix of public and private)  
**Steps:**
1. Log in as qa-user-a@test.uk
2. Navigate to /dashboard
3. Observe "Все" (All) tab — all memories shown
4. Click "Публічні" (Public) tab
5. Verify only public memories display
6. Click "Приватні" (Private) tab
7. Verify only private memories display

**Expected Results:**
- Filters work instantly (no page reload needed)
- Memory counts accurate per tab
- No private memories leak in public view

---

### Test 2.5: View Memory Detail — Owner Can See Private
**ID:** FR-MEM-06.01-positive-owner-sees-private  
**Preconditions:** User qa-user-a@test.uk has a private memory  
**Steps:**
1. Log in as qa-user-a@test.uk
2. Navigate to /dashboard → Приватні → click a private memory
3. Open memory detail page

**Expected Results:**
- Detail page displays fully
- Full text, photo, all metadata shown
- No access restriction

---

### Test 2.6: View Memory Detail — Non-Owner Cannot See Private
**ID:** FR-MEM-06.02-negative-non-owner-sees-private  
**Preconditions:** User qa-user-a@test.uk has a private memory with ID 42  
**Steps:**
1. Log in as qa-user-b@test.uk (different user)
2. Manually navigate to /memories/42 (URL of the private memory)

**Expected Results:**
- 403 Forbidden error page displayed
- Message: "У вас немає доступу до цього спогаду" (You don't have access)
- No memory content leaked

---

### Test 2.7: Edit Memory
**ID:** FR-MEM-05.01-positive-edit-memory  
**Preconditions:** User qa-user-a@test.uk created a memory, viewing its detail page  
**Steps:**
1. Click "Редагувати" button on memory detail page
2. Change Title to "Оновлена назва"
3. Modify Text
4. Replace Photo (or remove it)
5. Click "Зберегти"

**Expected Results:**
- Form pre-populates with current memory data
- Changes save successfully
- Redirect back to detail page showing updated content
- Last modified timestamp updates (if shown)

---

### Test 2.8: Delete Memory
**ID:** FR-MEM-05.02-positive-delete-memory  
**Preconditions:** User qa-user-a@test.uk has a memory, viewing detail page  
**Steps:**
1. Click "Видалити" (Delete) button
2. Confirm in dialog: "Ви впевнені?" → "Так, видалити"

**Expected Results:**
- Memory deleted from database
- Redirect to /dashboard
- Memory no longer appears in dashboard list
- GET request to /memories/{id} returns 404 for anyone
- Any uploaded photo file cleaned up from /uploads/

---

## 3. FEED & SOCIAL (FR-FEED-01 to FR-FEED-07, FR-LIKE, FR-COMMENT)

### Test 3.1: Browse Public Feed — No Login Required
**ID:** FR-FEED-01.01-positive-public-feed-anon  
**Preconditions:** At least 2 public memories exist in database  
**Steps:**
1. Clear localStorage (log out if needed)
2. Navigate to /feed

**Expected Results:**
- Public feed displays without error
- Memory cards show (title, excerpt, author, city, photo, topic, like count, comment count)
- No "Login required" message
- No broken images if all memories have photos

---

### Test 3.2: Feed Filter — By City
**ID:** FR-FEED-02.01-positive-filter-by-city  
**Preconditions:** Public memories exist for multiple cities (Київ, Львів, etc.)  
**Steps:**
1. Navigate to /feed
2. Click City filter dropdown
3. Select "Київ"
4. Verify results update

**Expected Results:**
- Feed re-fetches with city=Київ query parameter
- Only memories with city="Київ" display
- Other cities' memories hidden
- Loading indicator appears briefly during filter

---

### Test 3.3: Feed Sort — By Popular (Likes)
**ID:** FR-FEED-03.01-positive-sort-popular  
**Preconditions:** Public memories exist with varying like counts  
**Steps:**
1. Navigate to /feed
2. Click Sort dropdown
3. Select "Популярні" (Popular)

**Expected Results:**
- Feed re-sorts by likes descending (highest likes first)
- Memory order visually changes
- Like count badge highlights the popularity

---

### Test 3.4: Toggle Like (Warmth) — Authenticated User
**ID:** FR-FEED-06.01-positive-add-like  
**Preconditions:** User qa-user-a@test.uk logged in, viewing /feed with public memories  
**Steps:**
1. Find a memory card that user hasn't liked yet
2. Click the heart/warmth icon

**Expected Results:**
- Heart fills/changes color (yellow/amber per design)
- Like count increments by 1 immediately (optimistic UI)
- Backend POST /api/likes called
- If refresh page, like persists (verified in DB)

---

### Test 3.5: Toggle Like Off — Unauthenticated User Cannot
**ID:** FR-FEED-06.02-negative-like-requires-auth  
**Preconditions:** Browser logged out (no JWT token)  
**Steps:**
1. Navigate to /feed (as anonymous user)
2. Click heart/warmth icon on any memory

**Expected Results:**
- Redirect to /login page (or login modal appears)
- Like not toggled
- User prompted to authenticate

---

### Test 3.6: Add Comment
**ID:** FR-FEED-07.01-positive-add-comment  
**Preconditions:** User qa-user-a@test.uk logged in, viewing a public memory detail page (/memories/{id})  
**Steps:**
1. Scroll to Comments section
2. Click in comment text box
3. Type: "Дякую за цей спогад! У мене була схожа гра в дворі."
4. Click "Додати коментар" or press Enter

**Expected Results:**
- Comment appears immediately in comment list (optimistic UI)
- Backend POST /api/comments called
- Comment shows author name (qa-user-a), timestamp, text
- No console errors

---

### Test 3.7: Report Memory (Moderation)
**ID:** FR-MOD-02.01-positive-report-memory  
**Preconditions:** User qa-user-b@test.uk logged in, viewing a public memory  
**Steps:**
1. Click "Пожалуйтесь" (Report) button/link on memory card or detail page
2. Modal opens with options: "Спам", "Образливий контент", "Інше"
3. Select "Образливий контент"
4. Optionally enter reason: "Містить неприйнятну мову"
5. Click "Надіслати звіт"

**Expected Results:**
- Report submitted to backend
- Success message: "Дякуємо за звіт"
- Modal closes
- Report visible in /admin page for admin users

**Notes:** Verify report is NOT visible to public, only to admin

---

## 4. LOST FIREFLIES (FR-LOST-01 to FR-LOST-05)

### Test 4.1: View Lost Requests — No Auth Required
**ID:** FR-LOST-01.01-positive-view-lost-anon  
**Preconditions:** At least 2 lost requests exist in database  
**Steps:**
1. Log out (clear localStorage)
2. Navigate to /lost

**Expected Results:**
- Lost request cards display
- Cards show: city, type, years, description excerpt, author, date
- Contact email NOT shown on list view (PII protection)
- Can click card to view detail

---

### Test 4.2: Create Lost Request
**ID:** FR-LOST-02.01-positive-create-lost  
**Preconditions:** User qa-user-a@test.uk logged in  
**Steps:**
1. Navigate to /lost/new
2. Select Type: "Пошук фотографії" (Photo search)
3. Select City: "Маріуполь" (autocomplete)
4. Enter Years: "1985–1995" or From/To separate fields
5. Enter Description: "Шукаю фотографію класу 1990 року з школи #15"
6. Enter Contact Email: qa-user-a@test.uk
7. Click "Опублікувати запит"

**Expected Results:**
- Lost request created
- Redirect to /lost/{id} detail page
- Detail page shows full description + contact email with mailto: link
- Request appears in /lost list for all users

---

### Test 4.3: Filter Lost Requests — By Type
**ID:** FR-LOST-03.01-positive-filter-lost-by-type  
**Preconditions:** Lost requests of different types exist (photo search, classmate search, place search)  
**Steps:**
1. Navigate to /lost
2. Click Type filter dropdown
3. Select "Пошук однокласника" (Classmate search)

**Expected Results:**
- Lost list re-filters to show only selected type
- Other types hidden
- Count may update

---

### Test 4.4: View Lost Request Detail — Contact Email
**ID:** FR-LOST-05.01-positive-view-lost-detail  
**Preconditions:** Lost request exists and is public  
**Steps:**
1. Navigate to /lost list
2. Click on a lost request card
3. View detail page at /lost/{id}

**Expected Results:**
- Full description displays
- Contact email visible as mailto: link
- Clicking email opens mail client (or browser behavior)
- Author name and date shown
- No 404 or permission errors

---

## 5. MODERATION & ADMIN (FR-MOD-03, FR-MOD-04, FR-MOD-05)

### Test 5.1: Admin Panel — View Reports
**ID:** FR-MOD-03.01-positive-admin-view-reports  
**Preconditions:** User qa-admin@test.uk (role=admin) logged in; reports exist in database  
**Steps:**
1. Navigate to /admin
2. Observe Reports section

**Expected Results:**
- List of reported memories/comments displays
- Columns: Target (memory/comment ID), Reason, Reporter, Date Created
- Each report row has "Delete" and/or "Ban User" action buttons
- No reports visible if user is not admin (403 error)

---

### Test 5.2: Admin Action — Delete Reported Memory
**ID:** FR-MOD-04.01-positive-admin-delete-memory  
**Preconditions:** Admin logged in, report against a memory visible in /admin  
**Steps:**
1. View /admin reports list
2. Find report against a memory
3. Click "Видалити спогад" (Delete memory) button
4. Confirm dialog: "Видалити цей спогад?" → "Так"

**Expected Results:**
- Memory deleted from database
- All reports against this memory disappear from admin list
- Memory no longer appears in /feed or /dashboard
- Comments on the memory may also be removed (cascade delete)

---

### Test 5.3: Admin Action — Ban User
**ID:** FR-MOD-04.02-positive-admin-ban-user  
**Preconditions:** Admin logged in, a user with reports visible  
**Steps:**
1. View /admin reports list
2. Find report by a user (or navigate to user management)
3. Click "Заблокувати користувача" (Ban user) button
4. Confirm: "Заблокувати користувача?" → "Так"

**Expected Results:**
- User account marked as banned in database (is_banned=true)
- Banned user cannot log in (login rejected with message "Акаунт заблокований")
- Banned user's existing memories/comments remain visible (with "banned" label if design shows)
- Banned user cannot post new content (API returns 403)

---

### Test 5.4: Footer — Report & Rules Links
**ID:** FR-MOD-05.01-positive-footer-links  
**Preconditions:** Any page loaded  
**Steps:**
1. Scroll to footer
2. Verify "Пожалуйтесь" (Report) link visible
3. Verify "Правила" (Rules) link visible
4. Click "Правила" link

**Expected Results:**
- Links present on all pages (header and footer)
- Clicking navigates to /rules page
- Rules page displays community guidelines
- No 404 errors

---

## 6. CONTENT PAGES (FR-CONTENT-01, FR-CONTENT-02)

### Test 6.1: About Page — Public & Accessible
**ID:** FR-CONTENT-01.01-positive-about-page  
**Preconditions:** Browser is at any page  
**Steps:**
1. Navigate to /about
2. Verify page renders
3. Check for any placeholder text or missing sections

**Expected Results:**
- About page displays without error
- Ukrainian text and tone appropriate (warm, calm, no exclamation marks)
- Design tokens applied (colors, fonts, spacing)
- Accessible without login
- No console errors or broken images

---

### Test 6.2: Rules Page — Community Guidelines
**ID:** FR-CONTENT-02.01-positive-rules-page  
**Preconditions:** Browser at any page  
**Steps:**
1. Navigate to /rules
2. Read community guidelines section
3. Verify structure and completeness

**Expected Results:**
- Rules page displays
- Clear guidance on acceptable content
- No exclamation marks (BC-BRAND-01 compliance)
- Accessible without login
- Footer has link to /rules

---

## 7. RESPONSIVE DESIGN (FR-SHELL-02)

### Test 7.1: Responsive Layout — Mobile (< 768px)
**ID:** FR-SHELL-02.01-responsive-mobile  
**Preconditions:** Browser DevTools open with device emulation  
**Steps:**
1. Set viewport to 375px width (mobile breakpoint)
2. Navigate to /feed
3. Verify layout adapts:
   - Top nav collapses to mobile menu
   - Memory cards stack vertically
   - Buttons/inputs readable
   - No horizontal scroll

**Expected Results:**
- Layout responsive and readable
- No text overflow
- Touch targets > 44px (accessibility standard)
- Mobile menu button visible and functional

**Notes:** Test on iPhone SE (375px), Pixel 5 (393px)

---

### Test 7.2: Responsive Layout — Tablet (768px–1280px)
**ID:** FR-SHELL-02.02-responsive-tablet  
**Preconditions:** Browser DevTools with tablet emulation  
**Steps:**
1. Set viewport to 768px (tablet breakpoint)
2. Navigate to /feed
3. Verify 2-column layout (or layout changes at breakpoint)
4. Resize to 1024px
5. Verify content reorganizes appropriately

**Expected Results:**
- No jarring jumps in layout
- Optimal reading column widths
- Whitespace increases with screen size
- No content hidden unexpectedly

---

### Test 7.3: Responsive Layout — Desktop (> 1280px)
**ID:** FR-SHELL-02.03-responsive-desktop  
**Preconditions:** Browser on desktop (full width or maximized)  
**Steps:**
1. Set viewport to 1920px (desktop)
2. Navigate to /dashboard and /feed
3. Verify comfortable use at wide widths

**Expected Results:**
- Max-width applied to content (likely 1200–1400px)
- Sidebars or additional panels may appear
- No overly long text lines (readability issue)

---

## 8. EDGE CASES & ERROR HANDLING

### Test 8.1: Network Error — Feed Fails to Load
**ID:** EDGE-001-network-error-feed  
**Preconditions:** Backend service unavailable or network blocked (DevTools throttle/offline)  
**Steps:**
1. Open DevTools → Network → Throttle to Offline
2. Navigate to /feed (or refresh if already there)

**Expected Results:**
- Error message displayed: "Помилка завантаження. Спробуйте пізніше." (or similar)
- Retry button present
- No blank page or console errors
- User not confused

---

### Test 8.2: Large Text Input — Memory Description
**ID:** EDGE-002-large-text-memory  
**Preconditions:** User creating a memory  
**Steps:**
1. Open create memory form
2. Paste a 4000+ character description (near server limit)
3. Try to submit

**Expected Results:**
- Validation error if text exceeds max (e.g., 5000 chars)
- Friendly error message: "Текст занадто довгий. Максимум 5000 символів."
- User can edit and retry

---

### Test 8.3: Special Characters in Text Fields
**ID:** EDGE-003-special-characters  
**Preconditions:** User creating a memory  
**Steps:**
1. Enter title with special chars: "Мої улюблені ігри: додж-болл & марблс"
2. Enter description with emojis and punctuation: "Дивні часи! 😊 #тамагочі"
3. Submit

**Expected Results:**
- All characters preserved correctly
- No encoding errors
- Display back on detail page matches input

**Notes:** Verify no SQL injection or XSS via escaped storage/display

---

### Test 8.4: Photo Upload — File Type Validation
**ID:** EDGE-004-invalid-photo-type  
**Preconditions:** User on memory creation form  
**Steps:**
1. Click "Додати фото"
2. Try to upload a .txt file (not an image)

**Expected Results:**
- Upload rejected: "Дозволені тільки фотографії (JPG, PNG)"
- File not processed
- No broken image placeholder created

---

### Test 8.5: Photo Upload — File Size Limit (10 MB)
**ID:** EDGE-005-photo-size-limit  
**Preconditions:** User on memory form with a 15 MB image file  
**Steps:**
1. Click "Додати фото"
2. Select a 15 MB image

**Expected Results:**
- Upload fails: "Файл занадто великий. Максимум 10 МБ."
- User can select a smaller file
- No partial upload to disk

---

### Test 8.6: Pagination — Feed Load More
**ID:** EDGE-006-pagination-feed  
**Preconditions:** Feed has 20+ memories  
**Steps:**
1. Navigate to /feed
2. Scroll to bottom
3. Click "Завантажити ще" (Load More) button or auto-load triggers

**Expected Results:**
- Next 10 memories load
- No duplicates from previous page
- Scroll position maintained or smooth scroll to new content

---

## 9. BROWSER & DEVICE COMPATIBILITY

### Test 9.1: Chrome Desktop (Latest)
**ID:** COMPAT-001-chrome-desktop  
**Steps:** Run full smoke test on Chrome 120+
**Expected Results:** All features work, no console errors

### Test 9.2: Firefox Desktop (Latest)
**ID:** COMPAT-002-firefox-desktop  
**Steps:** Run full smoke test on Firefox 121+
**Expected Results:** All features work, no console errors

### Test 9.3: Safari Desktop (Latest)
**ID:** COMPAT-003-safari-desktop  
**Steps:** Run full smoke test on Safari 17+
**Expected Results:** All features work, CSS custom properties supported

### Test 9.4: Mobile Safari (iOS 15+)
**ID:** COMPAT-004-mobile-safari  
**Steps:** Test on real iPhone or Safari iOS simulator
**Expected Results:** Responsive, touch targets adequate, no overlap

### Test 9.5: Chrome Mobile (Android)
**ID:** COMPAT-005-chrome-mobile  
**Steps:** Test on real Android or Chrome Mobile emulation
**Expected Results:** Responsive, forms keyboard-friendly

---

## 10. ACCESSIBILITY CHECKS (Manual)

### Test 10.1: Keyboard Navigation
**ID:** A11Y-001-keyboard-nav  
**Steps:**
1. On /dashboard page, press Tab repeatedly
2. Verify focus ring moves through interactive elements
3. Try form submission with keyboard only (Tab + Enter)

**Expected Results:**
- Focus always visible (amber ring per design token `--focus-ring`)
- All buttons, links, form inputs reachable
- No keyboard traps
- Logical tab order (left-to-right, top-to-bottom)

---

### Test 10.2: Screen Reader (NVDA, JAWS, or built-in)
**ID:** A11Y-002-screen-reader  
**Steps:**
1. Enable screen reader
2. Navigate to /feed
3. Listen to structure and labels

**Expected Results:**
- Page structure announced (headings, landmarks)
- Form labels announced with inputs
- Button purposes clear ("Create Memory", "Delete", etc.)
- Image alt text present
- No redundant announcements

---

### Test 10.3: Color Contrast (Manual Review)
**ID:** A11Y-003-contrast  
**Steps:**
1. Use browser DevTools color picker or Chrome Lighthouse
2. Sample text colors against backgrounds
3. Measure contrast ratio

**Expected Results:**
- Normal text ≥ 4.5:1 contrast ratio (WCAG AA)
- Large text ≥ 3:1 ratio
- No gray-on-white combos too light
- Ensure dark theme also meets ratios

---

## Test Execution Checklist

- [ ] All 47 test scenarios reviewed
- [ ] Test data created (3 user accounts + admin)
- [ ] Each scenario executed and result logged
- [ ] No data left behind (cleanup completed)
- [ ] Browser compatibility checked (Chrome, Firefox, Safari, mobile)
- [ ] Accessibility checks performed (keyboard, screen reader, contrast)
- [ ] All bugs/findings recorded with test ID and screenshot
- [ ] Sign-off: QA Lead signature & date

---

**Last updated:** 2026-07-07 21:58 UTC+02:00  
**Scope:** 47 manual test scenarios (positive, negative, edge cases, responsive, accessibility, compatibility)  
**Estimated Execution Time:** 6–8 hours (depending on environment setup and thoroughness)
