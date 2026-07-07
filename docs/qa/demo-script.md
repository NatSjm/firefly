# Demo Script — Svitlyachok MVP

**Narrated walkthrough for stakeholder presentations. ~15–20 minutes.**

---

## Pre-Demo Checklist

- [ ] Frontend running on http://localhost:5173
- [ ] Backend running on http://localhost:8080
- [ ] Test data seeded (demo-data-seed.ts run or fixtures loaded)
- [ ] Browser zoomed to 100%
- [ ] DevTools closed
- [ ] Dark theme active (optional, show both light + dark for design system)
- [ ] Network throttling OFF (clean 0-latency demo)

**Test User Logins:**
```
Regular User:
  Email: demo-user@test.uk
  Password: DemoPass123!
  
Admin User:
  Email: demo-admin@test.uk
  Password: AdminPass123!
```

---

## SECTION 1: Landing & Onboarding (2 min)

### Slide: "Welcome to Svitlyachok"

**Narrator:**  
> "Svitlyachok — Світлячок in Ukrainian — is a platform for preserving childhood memories. Imagine you're an adult now, living in a different city, maybe displaced due to the war. You have stories, family recipes, photos from your past. Where do you keep them? Svitlyachok is that place — warm, calm, Ukrainian-first, without the noise of commercial social media."

**Actions:**
1. Navigate to http://localhost:5173
2. Show home/landing page with:
   - Firefly logo mark (glowing amber glow per design system)
   - Hero section: "Збережи світло своєї дитинства" (Preserve the light of your childhood)
   - Brief description
   - CTA buttons: "Переглянути стрічку" (Browse Feed), "Зареєструватися" (Register)

**Key Points:**
- ✅ **FR-SHELL-01:** Single-page app with header and content area
- ✅ **FR-SHELL-04:** Logo left, nav center/right, login button right
- ✅ Design system: warm amber glow, calm typography (Literata), no exclamation marks (BC-BRAND-01)

---

## SECTION 2: Public Feed Without Login (2 min)

### Slide: "Browse Community Memories"

**Narrator:**  
> "You don't need an account to start exploring. Let's look at the public feed — stories and recipes shared by the community."

**Actions:**
1. Click "Переглянути стрічку" or navigate to /feed
2. Show memory cards:
   - Title, excerpt, author name, city
   - Photo on left or top
   - Topic badge ("Дворові ігри", "Бабусині рецепти", etc.)
   - Like count (Warmth/Тепло) with heart icon (amber glow)
   - Comment count
3. Scroll down to show multiple memories

**Key Points:**
- ✅ **FR-FEED-01:** Public feed without login
- ✅ **FR-FEED-04:** Card shows author, city, title, excerpt, photo, topic, likes, comments
- ✅ **FR-FEED-05:** Click card navigates to detail (click a card)
- ✅ **NFR-A11Y-01:** Focus ring visible on card links (use Tab to highlight)

---

## SECTION 3: Feed Filters & Discovery (2 min)

### Slide: "Discover by Topic & City"

**Narrator:**  
> "The feed is huge, so we filter by what matters to you. Let's say you're from Kyiv and want to see memories about old computer games from the 90s."

**Actions:**
1. Show filter bar at top of /feed
2. Click Topic dropdown → select "Комп'ютерні ігри"
3. Show instant feed refresh (optimistic UI, no loading spinner needed)
4. Click City dropdown → select "Київ"
5. Show feed now filtered to both criteria
6. Click Sort dropdown → select "Популярні" (by likes/Warmth)
7. Observe card order changes

**Key Points:**
- ✅ **FR-FEED-02:** City and topic filters
- ✅ **FR-FEED-03:** Sort by new (created_at) or popular (likes)
- ✅ **FR-TOPIC-01 & FR-CITY-02:** Predefined topics and cities
- ✅ **FR-CITY-02:** City dropdown available

**Talking Point:**  
> "All filter combinations are fast because the backend is optimized and the UI is responsive. No spinner, just instant results."

---

## SECTION 4: Memory Detail & Social Features (2.5 min)

### Slide: "Engage with Community"

**Narrator:**  
> "Let's click on one memory to see the full story and meet the community around it."

**Actions:**
1. Click any memory card to open /memories/{id} detail page
2. Show full layout:
   - Full text (story or recipe)
   - Photo (large)
   - Metadata: author, city, topic, year range, date created
   - If recipe: ingredients section, steps section
3. Scroll down to show **Likes** section:
   - Show heart icon (Warmth badge)
   - Click heart to like (logged out user should see redirect to login)
4. **Login Demo User** (log in as demo-user@test.uk)
5. Return to same memory detail page
6. Click heart to **toggle like** → observe count +1, heart fills with amber color
7. Scroll to **Comments** section:
   - Show existing comments (author, time, text)
   - Click "Додати коментар" text box
   - Type: "Чудова історія, дякую за спогад!"
   - Submit → observe comment appears instantly (optimistic UI)

**Key Points:**
- ✅ **FR-MEM-06:** Single memory page shows full text + photo + metadata
- ✅ **FR-FEED-06:** Toggle Warmth (like) on public memory
- ✅ **FR-FEED-07:** View and post comments
- ✅ **FR-AUTH-02:** JWT token stored client-side (show in DevTools → Application → localStorage)
- ✅ Design system: Warmth badge uses glow effect (--shadow-glow-sm reserved for this)

**Talking Point:**  
> "Notice the heart fills with that warm amber glow — that's our 'Warmth' or 'Тепло' reaction. It's not about 'likes' like TikTok; it's about feeling the warmth of shared memories. And comments are instant — no page refresh needed."

---

## SECTION 5: User Registration & Personal Archive (3 min)

### Slide: "Create Your Own Memory"

**Narrator:**  
> "Now let's create our own memory. First, we register or log in. Let's create a new memory to show the personal archive feature."

**Actions:**
1. Already logged in as demo-user, navigate to /dashboard
2. Show empty/partial dashboard with user's existing memories
3. Click "Створити спогад" (Create Memory) button
4. Show memory creation form:
   - Type selection: Story or Recipe (radio/tab buttons)
   - Title field
   - Topic dropdown (show predefined list)
   - City field (autocomplete)
   - Year range (From/To sliders or inputs)
   - Text area for story or recipe
   - Ingredients/steps (recipe only)
   - Photo upload
   - Visibility toggle: Приватна vs. Публічна
5. Fill in example:
   - Type: Story
   - Title: "Мої улюблені дворові ігри"
   - Topic: "Дворові ігри"
   - City: Start typing "Ки..." → autocomplete shows "Київ" → select
   - Years: 1990–1995
   - Text: "Коли я було дітьми, ми грали..." (paste a pre-written story)
   - Photo: Click upload → select a demo image
   - Visibility: Click **Приватна** radio (to show privacy control)
6. Click "Зберегти спогад"
7. Show success → redirect to detail page

**Key Points:**
- ✅ **FR-AUTH-01 & FR-AUTH-02:** Registration & login with JWT
- ✅ **FR-MEM-01:** User creates memory of type story or recipe
- ✅ **FR-MEM-02:** Memory includes all fields: title, text, city, topic, year range, photo
- ✅ **FR-MEM-03:** User chooses visibility (public vs. private)
- ✅ **FR-TOPIC-02:** User selects topic from dropdown
- ✅ **FR-CITY-01:** Memory has optional city with autocomplete
- ✅ **NFR-I18N-01:** All UI text from locales/uk/common.json (no hardcoded Ukrainian)

**Talking Point:**  
> "This memory was marked private, so only you can see it. If you set it to public, it will appear in the community feed for others to discover and comment on. The photo upload is automatically stored and served securely. No third-party cloud dependency — your memories live on our server."

---

## SECTION 6: Dashboard Filters (1.5 min)

### Slide: "Manage Your Memories"

**Narrator:**  
> "Let's go to your personal dashboard to organize your memories."

**Actions:**
1. Navigate to /dashboard
2. Show dashboard layout:
   - User info at top
   - Filter tabs: "Все" (All) | "Публічні" (Public) | "Приватні" (Private)
3. Click "Приватні" → show only private memories
4. Click "Публічні" → show only public memories
5. Click "Все" → show all

**Key Points:**
- ✅ **FR-MEM-04:** User views memories in dashboard with filters (all/public/private)
- ✅ **FR-SHELL-03:** Private memories visible only to owner; public in /feed

---

## SECTION 7: Lost Fireflies Feature (2 min)

### Slide: "Find Lost Memories"

**Narrator:**  
> "One of the most powerful parts of Svitlyachok is the 'Lost Fireflies' feature. If you lost photos or videos due to the war or relocation, or if you're looking for a childhood friend, you can post a request here. Others can help you find them."

**Actions:**
1. Navigate to /lost
2. Show list of lost requests:
   - Cards display: city, type, years, description excerpt, author, date
   - Types: "Пошук фотографії" (Photo search), "Пошук однокласника" (Classmate search), etc.
3. Click one lost request card → detail page /lost/{id}
4. Show full description + contact email as mailto: link
5. (Optionally) Go back and click "Створити запит" → show create form:
   - Type selector
   - City
   - Years
   - Description
   - Contact email
6. Cancel or skip (to avoid cluttering demo)

**Key Points:**
- ✅ **FR-LOST-01:** Any visitor views lost requests without login
- ✅ **FR-LOST-02:** Authenticated user creates a lost request
- ✅ **FR-LOST-03:** Lost list filterable by city and type
- ✅ **FR-LOST-04:** Lost card shows city, type, years, excerpt, author, date
- ✅ **FR-LOST-05:** Lost detail shows full description + contact email (mailto link)
- ✅ **BC-PRIVACY-02:** Only provided contact email shown (no PII scraping)

**Talking Point:**  
> "This isn't just nostalgia — this is help. For displaced Ukrainians, reconnecting with photos from Mariupol or Kharkiv might be the only way to preserve those memories. A stranger in Kyiv might recognize a face in your search photo and help you."

---

## SECTION 8: Moderation & Community Rules (1.5 min)

### Slide: "Safe Community"

**Narrator:**  
> "Svitlyachok is a kind place. We have community guidelines to keep it that way."

**Actions:**
1. Navigate to /rules page
2. Show community guidelines content (warm, calm tone, no exclamation marks)
3. Go back and show **Report** flow:
   - On /feed, scroll to a memory card
   - Click "..." menu or "Пожалуйтесь" (Report) link
   - Modal opens with reasons: Спам, Образливий контент, Інше
   - Select one → optional reason text → submit
   - Show success message
4. (Optional) Show admin dashboard:
   - Log out of demo-user
   - Log in as demo-admin@test.uk
   - Navigate to /admin
   - Show reports list
   - Demonstrate delete or ban actions

**Key Points:**
- ✅ **FR-MOD-01:** /rules page with community guidelines
- ✅ **FR-MOD-02:** Authenticated users report memories/comments
- ✅ **FR-MOD-03:** Admin views reports at /admin
- ✅ **FR-MOD-04:** Admin can delete content and ban users
- ✅ **FR-MOD-05:** Footer has visible "Правила" (Rules) and "Пожалуйтесь" (Report) links
- ✅ **BC-BRAND-01:** All text warm, calm, no exclamation marks

**Talking Point:**  
> "We take community health seriously. But we don't over-moderate. Users report what feels wrong, our admins review, and we keep the platform safe for everyone."

---

## SECTION 9: Responsive Design Demo (1.5 min)

### Slide: "Works Everywhere"

**Narrator:**  
> "Svitlyachok works beautifully on every device — desktop, tablet, mobile."

**Actions:**
1. Open DevTools → Device Emulation
2. Emulate iPhone SE (375px):
   - Show /feed responsive layout
   - Top nav collapses to hamburger menu
   - Memory cards stack vertically
   - All touch targets adequate
3. Emulate iPad (768px):
   - Show 2-column layout or optimized spacing
4. Return to full desktop (1920px)
5. Show max-width layout (content doesn't stretch too wide for readability)

**Key Points:**
- ✅ **FR-SHELL-02:** Layout adapts at 768px and 1280px breakpoints
- ✅ **NFR-A11Y-01:** Touch targets > 44px, focus ring visible

**Talking Point:**  
> "Whether you're browsing on your phone while waiting for the tram, or on your laptop at home, the experience is smooth and readable. No stretched-out text, no clickable elements too small."

---

## SECTION 10: About Page & Closing (1 min)

### Slide: "Our Story"

**Narrator:**  
> "Finally, let's see what we're about."

**Actions:**
1. Navigate to /about
2. Show project description and mission

**Key Points:**
- ✅ **FR-CONTENT-01:** /about page describes the project

**Closing Statement:**
> "Svitlyachok is built for people who treasure their memories and want to share them warmly with a community that cares. No algorithm chasing engagement, no ads tracking you. Just memories, stories, recipes, and a space to preserve what matters. Thank you for being part of this journey."

---

## APPENDIX: Quick Reference — FRs Demonstrated

| FR ID | Description | Section Shown | Action |
|-------|-------------|---------------|--------|
| FR-SHELL-01 | SPA with header + content | 1 | Landing page layout |
| FR-SHELL-02 | Responsive at 768px/1280px | 9 | DevTools emulation |
| FR-SHELL-03 | Public pages no login; create requires login | 2 → 4 | Feed vs. create button |
| FR-SHELL-04 | Header: logo left, nav center, user/login right | 1, 5 | Header navigation |
| FR-AUTH-01 | Register with email, password, name | 5 | Registration form (or show from doc) |
| FR-AUTH-02 | Login with email/password; JWT stored | 4 | Show localStorage JWT after login |
| FR-AUTH-03 | Logout; session cleared | N/A (time) | (Show in manual test notes) |
| FR-AUTH-04 | View/edit profile | 5 | Dashboard shows user info |
| FR-AUTH-05 | Unauthenticated users redirected to /login | 2 → 4 | Try like button without login |
| FR-MEM-01 | User creates memory story or recipe | 5 | Memory creation form |
| FR-MEM-02 | Memory includes title, text, city, topic, year range, photo | 5 | Form fields filled |
| FR-MEM-03 | User chooses visibility (private/public) | 5 | Visibility toggle in form |
| FR-MEM-04 | Dashboard with filters (all/public/private) | 6 | Filter tabs |
| FR-MEM-05 | User edits/deletes memories | N/A (time) | (Show in manual test) |
| FR-MEM-06 | Memory detail page (full text, photo, metadata; private to owner) | 4 | Detail page layout |
| FR-TOPIC-01 | Predefined topic list | 5 | Topic dropdown in form |
| FR-TOPIC-02 | User selects topic from dropdown | 5 | Select "Дворові ігри" |
| FR-CITY-01 | Memory has optional city (autocomplete) | 5 | City autocomplete |
| FR-FEED-01 | Public feed without login | 2 | /feed page access |
| FR-FEED-02 | Feed filterable by city and topic | 3 | City + topic filters |
| FR-FEED-03 | Feed sortable (new/popular) | 3 | Sort dropdown |
| FR-FEED-04 | Card shows author, city, title, excerpt, photo, topic, likes, comments | 2 | Memory card layout |
| FR-FEED-05 | Click card → detail page | 2 | Card click navigation |
| FR-FEED-06 | Authenticated users toggle Warmth (like) | 4 | Like button + heart fill |
| FR-FEED-07 | Authenticated users comment | 4 | Comment form + submit |
| FR-CITY-02 | Feed filterable by city | 3 | City filter dropdown |
| FR-LOST-01 | Any visitor views lost requests | 7 | /lost page access |
| FR-LOST-02 | Authenticated user creates lost request | 7 | Create form overview |
| FR-LOST-03 | Lost list filterable by city and type | 7 | City + type filters |
| FR-LOST-04 | Lost card shows city, type, years, excerpt, author, date | 7 | Card layout |
| FR-LOST-05 | Lost detail shows full description + contact email (mailto) | 7 | Detail page + mailto link |
| FR-MOD-01 | /rules page with community guidelines | 8 | Rules page content |
| FR-MOD-02 | Authenticated users report memories/comments | 8 | Report modal + submit |
| FR-MOD-03 | Admin views reports at /admin | 8 | Admin panel (logged in as admin) |
| FR-MOD-04 | Admin deletes content/bans users | 8 | Admin action buttons |
| FR-MOD-05 | Footer shows report + rules links | 8 | Footer link verification |
| FR-CONTENT-01 | /about page describes project | 10 | About page |
| FR-CONTENT-02 | /rules page with guidelines | 8 | Rules page |

---

## Post-Demo Q&A Notes

**Expected Questions:**

1. **Q: "What happens to deleted memories and photos?"**  
   A: Photos are removed from /uploads/, database records cascade-deleted, reports cleaned up. No orphaned files or data leak.

2. **Q: "Can users edit memories after posting?"**  
   A: Yes, up until deletion. They can change text, photo, visibility, etc. (FR-MEM-05)

3. **Q: "What about email confirmation or 2FA?"**  
   A: Out of scope for MVP. Post-MVP enhancement.

4. **Q: "How do admins get notified of new reports?"**  
   A: Currently manual check of /admin dashboard. Email notifications are post-MVP.

5. **Q: "Is there a moderation API for bulk actions?"**  
   A: No. Post-MVP feature. Current admin UI is click-by-click.

6. **Q: "What about voice input for accessibility?"**  
   A: Out of MVP scope. Text-only for now.

7. **Q: "How scalable is this?"**  
   A: See risk-register.md for known scale limitations (pagination clamped to 100 per page, upload size limits).

---

**Last updated:** 2026-07-07 21:58 UTC+02:00  
**Duration:** 15–20 minutes  
**Scope:** All 37 MVP FRs + responsive design + community safety
