# Full-Coverage Demo Video — Recording Plan & Scenario

**Purpose:** one continuous video showing the complete user journey through
Svitlyachok (Світлячок), covering all 37 MVP functional requirements through
real user interaction — not isolated clips.

**Target length:** 20–25 minutes. **Resolution:** 1920×1080, browser at 100% zoom.

> This complements the existing artifacts: `docs/qa/demo-script.md` (narrated
> stakeholder pitch) and `docs/qa/demo-recordings/` (13 short automated proof
> clips). This scenario is a single human-driven walkthrough that chains every
> capability into one believable story, including validation errors, guards,
> and the admin side.

---

## 1. Recommended recording approach

**Record manually with OBS Studio (or Windows Game Bar, Win+Alt+R), in acts,
then stitch.** Reasons:

- The goal is *full user interaction* — natural mouse movement, typing, and
  pacing read far better on video than Playwright's instant robotic actions.
  The automated harness (`scripts/record-demos.mjs`) already exists for proof
  clips; it is the wrong tool for a watchable end-to-end walkthrough.
- Recording **one act at a time** (10 segments below) means a mistake costs a
  1–3 minute retake, not the whole video. Stitch losslessly afterwards
  (OBS scene-by-scene, or `ffmpeg -f concat`).
- OBS settings: 1920×1080 @ 30 fps, capture the browser window only (not the
  full desktop), enable a cursor highlight if available.

**Browser setup:**

- Fresh Chrome/Edge profile: no extensions, no bookmarks bar, default fonts.
- DevTools closed except where the scenario explicitly opens device emulation.
- Window maximized, zoom 100%, Ukrainian content renders — check fonts load.

**Voice-over:** record narration separately after the video is cut, or speak
while driving if confident. The narration beats from `docs/qa/demo-script.md`
sections 1–10 can be reused nearly verbatim.

---

## 2. Environment pre-flight (not recorded)

```powershell
# 1. Database
docker compose up -d postgres

# 2. Backend (needs the modern JDK — shell default Java is too old)
$env:JAVA_HOME = "$env:USERPROFILE\.jdks\openjdk-26.0.1"
cd firefly-be; .\mvnw.cmd spring-boot:run          # port 8080

# 3. Frontend
cd firefly-fe; npm run dev                          # port 5173
```

**Gotchas (paid for in prior sessions):**

- If :5173 is already taken, check `netstat -ano | findstr :5173` — a stale
  Vite server from another checkout often holds the port. Kill it first;
  don't record against the wrong build.
- Confirm backend health before recording: `GET http://localhost:8080/api/memories/feed`
  returns 200.

**Demo accounts** (same as the automated recording harness):

| Role | Email | Password |
|---|---|---|
| Regular user | `demo@firefly.test` | `Demo1234!` |
| Admin | `admin@firefly.test` | `Admin1234!` |
| Fresh registrant (Act 2) | pick an unused email, e.g. `maryna.demo.<date>@firefly.test` | `Svitlo2026!` |

**Seed state.** The feed must not be empty when the anonymous visitor arrives.
Before recording, ensure via the demo user:

- ≥ 25 public memories (so `/feed` pagination has a page 2 at page size 20),
  spread across ≥ 2 topics and ≥ 2 cities (e.g. Київ, Харків), a mix of
  stories and recipes, at least one with a photo.
- ≥ 3 comments and a few warmth likes on one visible memory.
- ≥ 3 lost requests with different cities/types.
- Admin has ≥ 1 pending report is NOT needed — Act 7 creates reports live.

The e2e helper `e2e/helpers/seed-demo-data.ts` and one full run of
`node scripts/record-demos.mjs` (BASE_URL=http://localhost:5173) both create
suitable content; top up manually if pagination needs more items.

**Prepared assets:** one demo photo (~1 MB jpg) on the desktop; pre-written
Ukrainian texts in a scratch file for clean copy-paste of long fields (typing
titles live is fine; typing a 5-paragraph story live is dead air).

---

## 3. Scenario — ten acts

Format per step: **action → what the viewer must see**. FR ids in brackets are
what the step proves; the checklist in §4 confirms nothing is missed.

### Act 1 — The anonymous visitor (~4.5 min)

*Story: a displaced Kharkiv native hears about the site and explores without an account.*

1. Open `http://localhost:5173/` → landing page: firefly mark with amber glow,
   hero copy, header with logo left / nav / «Увійти» right, footer with
   «Правила» and report links. [FR-SHELL-01, FR-SHELL-04, FR-MOD-05, BC-BRAND-02]
2. Footer link → `/rules`: community guidelines, calm tone, no exclamation
   marks. Back. [FR-MOD-01, FR-CONTENT-02, BC-BRAND-01]
3. Nav → `/about`: project mission. [FR-CONTENT-01]
4. Nav → `/feed`: cards show author, city, title, excerpt, photo, topic badge,
   warmth count, comment count. Scroll slowly. [FR-FEED-01, FR-FEED-04]
5. Filter by topic («Комп'ютерні ігри»), then city («Київ») → list narrows.
   [FR-FEED-02, FR-CITY-02]
6. Switch sort «Нові» → «Популярні» → order changes. [FR-FEED-03]
7. Clear filters, scroll to bottom → click next-page control → page 2 loads,
   page indicator updates. Return to page 1.
8. Click a card → `/memories/{id}` detail: full text, large photo, author,
   city, topic, years. [FR-FEED-05, FR-MEM-06]
9. Point at the warmth (❤) button — it is disabled with a **visible caption**
   inviting sign-in (not just a tooltip). Comments below are readable but the
   comment form prompts sign-in. [FR-FEED-06/07 negative side, FR-SHELL-03]
10. Nav → `/lost`: request cards show city, type, years, excerpt, author,
    date. Apply a city filter, then a type filter. [FR-LOST-01, FR-LOST-03, FR-LOST-04]
11. Open one request → full description + contact email as a `mailto:` link —
    hover it so the status bar shows `mailto:`. [FR-LOST-05, BC-PRIVACY-02]
12. Type `/dashboard` in the URL bar → redirected to `/login`. [FR-AUTH-05, FR-SHELL-03]

### Act 2 — Registration, with the guardrail shown (~2 min)

13. On `/login`, click through to «Зареєструватися» → `/register`.
14. Fill name + fresh email, but a **short password** (`123`) → submit →
    inline Ukrainian error: password must be at least 8 characters. No crash,
    no English text. [FR-AUTH-01 validation, NFR-I18N-01]
15. Correct the password → submit → registered and signed in; header now shows
    the avatar initial and «Вийти». [FR-AUTH-01, FR-AUTH-02]
16. *(Optional, technical audiences)* F12 → Application → localStorage → show
    the JWT token briefly, close DevTools. [FR-AUTH-02]

### Act 3 — Building the personal archive (~5.5 min)

17. `/dashboard` → **empty state** with an inviting call to create the first
    memory. [FR-MEM-04 empty state]
18. «Створити спогад» → `/memories/new`. Walk the form top to bottom: type
    (story/recipe), title, topic dropdown (read out the five predefined
    topics), city with suggestions, year range, text, photo, visibility.
    [FR-MEM-01, FR-MEM-02, FR-TOPIC-01]
19. **Validation demo:** submit empty → per-field inline errors appear under
    the exact fields, each clears as you fix it.
20. **Second validation demo:** years 2005 → 1998 (backwards) → inline range
    error. Fix to 1998 → 2005.
21. Fill as a story: title «Мої дворові ігри на Салтівці», topic «Дворові
    ігри», city «Харків», paste prepared text, upload the photo, visibility
    **«Приватний»**. Save → detail page renders it. [FR-MEM-03, FR-TOPIC-02, FR-CITY-01]
22. Create a second memory as a **recipe**, filling ingredients + steps,
    visibility **public**. Save. [FR-MEM-02 recipe branch]
23. `/dashboard`: both memories listed; click filter tabs Все / Публічні /
    Приватні — counts change accordingly. [FR-MEM-04]
24. Open the private story → «Редагувати» → change the title slightly and flip
    visibility to public → save → detail shows the change. [FR-MEM-05 edit]
25. Quickly create a third throwaway memory, then delete it from its detail
    page (confirm dialog) → gone from dashboard. [FR-MEM-05 delete]

### Act 4 — Warmth and comments (~2 min)

26. `/feed` → the new public story is now in the feed (privacy model works
    both ways). Open a *seeded* memory (someone else's). [BC-PRIVACY-01]
27. Click the warmth ❤ → fills with the amber glow, count +1. Click again →
    un-likes. Like once more and leave it. [FR-FEED-06]
28. Write a comment: «Дякую, що поділилися — теж таке пам'ятаю» → appears
    immediately with author + time. [FR-FEED-07]
29. Delete your own comment via its delete control, then post it again (leaves
    material for Act 7's comment report).

### Act 5 — Lost Fireflies, authoring side (~2.5 min)

30. `/lost` → «Створити запит» → `/lost/new` (accessible because signed in).
31. **Validation demo:** years `2025-1990` → inline backwards-range error;
    also show the empty-submit per-field errors briefly.
32. Fill honestly: city «Маріуполь», type photo-search, years `1995-2003`,
    description about a lost school photo album, contact email. Submit.
    [FR-LOST-02]
33. Land on the detail page: full description + mailto contact. Back to `/lost`
    — the new request is first (newest-first). [FR-LOST-04, FR-LOST-05]

### Act 6 — Profile (~1 min)

34. Header avatar/menu → `/profile`: current name and email shown.
35. Edit name and bio, paste an avatar URL → save → header initial/name
    updates. [FR-AUTH-04]

### Act 7 — Reporting, the user side of safety (~1.5 min)

36. Open any seeded memory → report control → modal with reason field → write
    a reason («Тестова скарга для демонстрації») → submit → calm success
    message. [FR-MOD-02 memory]
37. In the comments of the Act-4 memory, use the per-comment report action →
    submit a second report. [FR-MOD-02 comment]
38. While still a regular user, type `/admin` in the URL → redirected away
    (not authorized). [FR-MOD-03 negative, FR-AUTH-05]

### Act 8 — The admin (~2.5 min)

39. Header → «Вийти» → signed out, header returns to «Увійти»; visiting
    `/dashboard` now redirects to login again. [FR-AUTH-03]
40. Log in as `admin@firefly.test` → `/admin` opens. [FR-MOD-03]
41. Reports list shows the two reports from Act 7 with type, target, reason,
    reporter, date.
42. Delete the reported **comment** → its report row disappears; verify on the
    memory page the comment is gone. [FR-MOD-04 delete]
43. Users tab/section → ban the fresh Act-2 user → status flips to banned;
    unban again (leave the demo DB clean). [FR-MOD-04 ban]
44. Dismiss/resolve the remaining memory report without deleting the memory
    (if the UI offers it) or delete the throwaway target — leave the queue empty.

### Act 9 — Responsive design (~1.5 min)

45. F12 → device toolbar → iPhone SE (375 px): header collapses to the burger
    menu (open it), feed cards stack in one column, touch targets comfortable.
    [FR-SHELL-02]
46. iPad (768 px): intermediate layout. Close DevTools → desktop: content
    max-width holds, no over-stretched lines. [FR-SHELL-02]

### Act 10 — Closing (~0.5 min)

47. `/about` once more, slow scroll over the mission text; end on the landing
    page with the glowing firefly mark. Closing narration from
    `demo-script.md` §10.

---

## 4. FR coverage checklist (tick during editing review)

| FR | Act/Step | | FR | Act/Step |
|---|---|---|---|---|
| FR-SHELL-01 | 1.1 | | FR-FEED-01 | 1.4 |
| FR-SHELL-02 | 9.45–46 | | FR-FEED-02 | 1.5 |
| FR-SHELL-03 | 1.9, 1.12 | | FR-FEED-03 | 1.6 |
| FR-SHELL-04 | 1.1 | | FR-FEED-04 | 1.4 |
| FR-AUTH-01 | 2.14–15 | | FR-FEED-05 | 1.8 |
| FR-AUTH-02 | 2.15–16 | | FR-FEED-06 | 4.27 |
| FR-AUTH-03 | 8.39 | | FR-FEED-07 | 4.28 |
| FR-AUTH-04 | 6.34–35 | | FR-LOST-01 | 1.10 |
| FR-AUTH-05 | 1.12, 7.38, 8.39 | | FR-LOST-02 | 5.30–32 |
| FR-MEM-01 | 3.18 | | FR-LOST-03 | 1.10 |
| FR-MEM-02 | 3.21–22 | | FR-LOST-04 | 1.10, 5.33 |
| FR-MEM-03 | 3.21 | | FR-LOST-05 | 1.11, 5.33 |
| FR-MEM-04 | 3.17, 3.23 | | FR-MOD-01 | 1.2 |
| FR-MEM-05 | 3.24–25 | | FR-MOD-02 | 7.36–37 |
| FR-MEM-06 | 1.8 | | FR-MOD-03 | 7.38, 8.40 |
| FR-TOPIC-01 | 3.18 | | FR-MOD-04 | 8.42–43 |
| FR-TOPIC-02 | 3.21 | | FR-MOD-05 | 1.1 |
| FR-CITY-01 | 3.21 | | FR-CONTENT-01 | 1.3, 10.47 |
| FR-CITY-02 | 1.5 | | FR-CONTENT-02 | 1.2 |

Also demonstrated beyond the FR list: feed pagination, per-field inline
validation (eval-hardened error clarity), backwards-year-range rejection on
both forms, empty dashboard state, BC-PRIVACY-01/02, BC-BRAND-01/02.

---

## 5. Production tips

- **Rehearse Acts 3–5 once** against the live DB before the real take; then
  delete the rehearsal content (or reset the DB) so the real take starts clean.
- Registration (Act 2) needs an **unused email each take** — suffix with the
  date.
- Pause ~1 s after every navigation before moving the mouse; cuts feel calmer
  and async content (photos, counts) settles.
- Keep the failed-validation moments **short but visible** — they are quality
  evidence, not bloopers; the narration should own them: «форма підказує, що
  саме виправити».
- Never show `.env.local`, terminal windows, or DevTools beyond the two
  scripted moments (JWT peek, device emulation).
- After stitching, watch once end-to-end against §4 and tick every FR before
  publishing.
