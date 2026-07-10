// One continuous ~2 minute demo take: user path + admin path, logically
// chained, covering the whole MVP surface. Runs a HEADED Chromium at human
// pace and saves the recording to docs/qa/full-demo/full-demo.webm
// (starts immediately — no lead-in, the file is the deliverable).
//
// Story: an anonymous visitor explores the feed and a memory -> registers ->
// creates a recipe memory (topic, city, years, photo, public) -> edits it ->
// dashboard filters -> likes + comments someone else's memory -> reports it ->
// posts a Lost Fireflies request -> logs out -> admin logs in, reviews the
// report, deletes the reported memory, bans/unbans a user -> rules/about close.
//
// Prerequisites (script checks them and fails early with a clear message):
//   - Postgres up            docker compose up -d postgres
//   - Backend on :8080       cd firefly-be; .\mvnw.cmd spring-boot:run
//                            (needs JAVA_HOME=%USERPROFILE%\.jdks\openjdk-26.0.1)
//   - Frontend on :5173      cd firefly-fe; npm run dev
//   - Admin account admin@firefly.test / Admin1234! with role=admin in the DB
//     (promoted out-of-band via SQL — see docs/technical/operations.md).
//
// Run:  node scripts/record-full-demo.mjs
// Env:  BASE_URL (default http://localhost:5173), API_BASE (default :8080),
//       DEMO_PHOTO (path to a jpg/png to upload; a tiny PNG is generated if unset),
//       SLOWMO (ms per action, default 100).
//
// Off-camera before the browser opens, it seeds via the API: ensures the demo
// user exists and the feed has at least 3 public memories, so the video never
// shows an empty site.

import { chromium } from "@playwright/test";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const API_BASE = process.env.API_BASE ?? "http://localhost:8080";
const OUT_DIR = join("docs", "qa", "full-demo");
const SLOWMO = Number(process.env.SLOWMO ?? 200);
const VIEWPORT = { width: 1920, height: 1080 };

const DEMO_USER = { email: "demo@firefly.test", password: "Demo1234!", name: "Demo User" };
const ADMIN = { email: "admin@firefly.test", password: "Admin1234!" };
const FRESH_USER = {
  name: "Марійка Світло",
  email: `mariyka+${Date.now()}@firefly.test`,
  password: "Svitlo2026!",
};

// 1x1 PNG (solid color) — replaced by DEMO_PHOTO if provided.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const started = Date.now();
const stamp = () => `${((Date.now() - started) / 1000).toFixed(0).padStart(3)}s`;
const stage = (name) => console.log(`[${stamp()}] ▶ ${name}`);
const warn = (msg) => console.warn(`[${stamp()}] ⚠ ${msg} (video continues)`);

// Optional beats never abort the take — a missed label costs one moment, not the video.
async function tryStep(label, fn) {
  try {
    await fn();
  } catch (e) {
    warn(`${label}: ${e.message.split("\n")[0]}`);
  }
}

// ---- subtitles: each caption() is stamped against the recording start and
// written to full-demo.srt after the take, ready to burn in with ffmpeg.
const captions = [];
let videoT0 = 0;
const caption = (text) => captions.push({ t: (Date.now() - videoT0) / 1000, text });

function toSrtTime(s) {
  const ms = Math.round(s * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${sec},${String(ms % 1000).padStart(3, "0")}`;
}

function buildSrt() {
  return captions
    .map((c, i) => {
      const end = i + 1 < captions.length ? captions[i + 1].t - 0.05 : c.t + 4;
      return `${i + 1}\n${toSrtTime(c.t)} --> ${toSrtTime(end)}\n${c.text}\n`;
    })
    .join("\n");
}

// ---------------------------------------------------------------- seeding ----

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) throw new Error(`${opts.method ?? "GET"} ${path} -> ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function loginOrRegister(user) {
  try {
    const r = await api("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: user.password }),
    });
    return r.token;
  } catch {
    const r = await api("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: user.password, name: user.name }),
    });
    return r.token;
  }
}

const SEED_MEMORIES = [
  {
    type: "story",
    title: "Двір на Салтівці, де ми грали до темряви",
    text: "Пам'ятаю, як улітку ми збиралися всім двором і грали у квача, доки мами не кликали вечеряти. Ліхтар над під'їздом світив, як маленьке сонце.",
    city: "Харків",
    topicSlug: "Дворові ігри",
    isPublic: true,
    yearFrom: 1994,
    yearTo: 1999,
  },
  {
    type: "recipe",
    title: "Бабусин борщ із печі",
    text: "Найтепліший спогад мого дитинства — запах борщу, який бабуся готувала в суботу зранку.",
    ingredients: "Буряк, капуста, картопля, квасоля, томат, зелень",
    steps: "Зварити бульйон. Додати овочі. Дати настоятися пів години.",
    city: "Київ",
    topicSlug: "Бабусині рецепти",
    isPublic: true,
  },
  {
    type: "story",
    title: "Перший тамагочі в нашому класі",
    text: "Його передавали з парти на парту, як найбільший скарб. Черга була розписана на тиждень уперед.",
    city: "Київ",
    topicSlug: "Тамагочі",
    isPublic: true,
    yearFrom: 1997,
    yearTo: 1998,
  },
];

async function seed() {
  stage("pre-flight: app reachable");
  const feResponse = await fetch(BASE_URL).catch(() => null);
  if (!feResponse) throw new Error(`frontend not reachable at ${BASE_URL} — start it first`);
  await api("/api/feed?size=1").catch(() => {
    throw new Error(`backend not reachable at ${API_BASE} — start it first`);
  });

  stage("pre-flight: admin account works and has the admin role");
  const adminToken = await api("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ADMIN),
  })
    .then((r) => r.token)
    .catch(() => {
      throw new Error(`admin login failed for ${ADMIN.email} — create/promote it first (see docs/technical/operations.md)`);
    });
  await api("/api/admin/reports", { headers: { Authorization: `Bearer ${adminToken}` } }).catch(() => {
    throw new Error(`${ADMIN.email} exists but is NOT role=admin — promote it via SQL before recording`);
  });

  stage("seeding: demo user + public feed content");
  const token = await loginOrRegister(DEMO_USER);
  const feed = await api("/api/feed?size=5");
  const existing = feed?.content?.length ?? feed?.items?.length ?? (Array.isArray(feed) ? feed.length : 0);
  if (existing >= 3) {
    console.log(`  feed already has ${existing}+ public memories — no seeding needed`);
    return;
  }
  for (const m of SEED_MEMORIES) {
    const form = new FormData();
    form.append("data", new Blob([JSON.stringify(m)], { type: "application/json" }));
    await api("/api/memories", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }).catch((e) => warn(`seed "${m.title}": ${e.message}`));
  }
}

// ------------------------------------------------------------- the take ----

// Calm pacing: a beat after navigations so content settles on camera.
// PACE scales every hold — raise it for a slower, more narratable take.
const PACE = Number(process.env.PACE ?? 1.1);
const beat = (page, ms = 3000) =>
  page.waitForLoadState("networkidle").catch(() => {}).then(() => page.waitForTimeout(ms * PACE));

async function scrollBy(page, px, steps = 4) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps);
    await page.waitForTimeout(250 * PACE);
  }
}

async function run(page, photoPath) {
  page.on("dialog", (d) => d.accept().catch(() => {}));
  // A missed optional beat should cost seconds, not a 30s freeze on camera —
  // but navigations get real headroom (Vite dev compiles routes on first visit).
  page.setDefaultTimeout(5000);
  page.setDefaultNavigationTimeout(20000);

  // ---- ACT 1 · Anonymous visitor (~35s) --------------------------------
  stage("ACT 1 — anonymous visitor: landing, feed, filters, memory detail");
  caption("Svitlyachok — a Ukrainian platform for preserving childhood memories");
  await page.goto(BASE_URL);
  await beat(page, 2400); // hero, glow mark, header
  await scrollBy(page, 900, 4); // down to the footer: rules + report links
  await page.waitForTimeout(1200);
  await scrollBy(page, -900, 3); // back to the hero

  caption("The public feed is open to everyone — no account needed");
  await tryStep("nav to feed via header link", async () => {
    // header nav renders <a> without href (no link role) — match by text
    await page.getByText("Стрічка").first().click();
    await page.waitForURL("**/feed");
  });
  if (!page.url().includes("/feed")) await page.goto(`${BASE_URL}/feed`);
  await beat(page);
  await scrollBy(page, 900);

  caption("Filtering memories by topic and city, sorting by new or popular");
  const feedSelects = page.locator("select");
  await tryStep("topic/city filter", async () => {
    await feedSelects.nth(1).selectOption({ index: 1 });
    await beat(page, 1200);
    await feedSelects.nth(1).selectOption({ index: 0 }); // clear so the feed is full again
    await beat(page, 800);
  });
  await tryStep("sort by popular", async () => {
    await page.getByRole("button", { name: /популярні/i }).first().click();
    await beat(page, 1200);
    await page.getByRole("button", { name: /нові/i }).first().click();
    await beat(page, 800);
  });

  caption("A full memory page — likes and comments ask visitors to sign in first");
  await page.locator("article").first().click();
  await beat(page, 2200); // full memory; disabled warmth + visible sign-in caption
  await scrollBy(page, 700, 3); // comments visible, form prompts sign-in
  await page.waitForTimeout(800);

  // ---- ACT 2 · Registration (~18s) --------------------------------------
  stage("ACT 2 — the visitor registers");
  caption("Creating an account — name, email, password");
  await tryStep("header login button", async () => {
    await page.getByRole("button", { name: /увійти/i }).first().click();
    await page.waitForURL("**/login");
  });
  if (!page.url().includes("/login")) await page.goto(`${BASE_URL}/login`);
  await beat(page, 1000);
  await tryStep("link to register", async () => {
    await page.getByText(/зареєструватися|реєстрація/i).first().click();
    await page.waitForURL("**/register");
  });
  if (!page.url().includes("/register")) await page.goto(`${BASE_URL}/register`);
  await beat(page, 800);

  await page.locator("input").first().pressSequentially(FRESH_USER.name, { delay: 45 });
  await page.fill('input[type="email"]', FRESH_USER.email);
  await page.fill('input[type="password"]', FRESH_USER.password);
  await page.click('button[type="submit"]');
  await beat(page, 1600); // signed in: avatar initial + «Вийти» in the header

  // ---- ACT 3 · Personal archive (~45s) -----------------------------------
  stage("ACT 3 — create a recipe memory, then edit it; dashboard filters");
  caption("The personal archive — empty for a brand-new user");
  await page.goto(`${BASE_URL}/dashboard`);
  await beat(page, 1600); // empty state for a brand-new user

  await tryStep("create-memory button", async () => {
    // empty state says «Створити перший спогад», populated dashboard «Створити спогад»
    await page.getByText(/створити (перший )?спогад/i).first().click();
    await page.waitForURL("**/memories/new");
  });
  if (!page.url().includes("/memories/new")) await page.goto(`${BASE_URL}/memories/new`);
  await beat(page, 1000);

  caption("Creating a recipe memory: type, city, topic, title, story, ingredients, steps");
  const formSelects = page.locator("select"); // order: format, city, topic (MemoryFormPage)
  await formSelects.nth(0).selectOption("recipe");
  await page.waitForTimeout(600); // ingredients/steps fields appear
  await formSelects.nth(1).selectOption({ index: 1 });
  await formSelects.nth(2).selectOption({ index: 2 });
  await page
    .locator('input[type="text"]')
    .first()
    .pressSequentially("Бабусин борщ із пампушками", { delay: 35 });
  const areas = page.locator("textarea");
  await areas.nth(0).fill("Субота в бабусі починалася з борщу. Поки він булькав на плиті, вона пекла пампушки з часником, і цей запах збирав усю родину на кухні швидше за будь-які слова.");
  await tryStep("ingredients + steps", async () => {
    await areas.nth(1).fill("Буряк, капуста, картопля, морква, цибуля, томатна паста, квасоля, лавровий лист, сметана");
    await areas.nth(2).fill("Зварити бульйон. Спасерувати буряк і моркву з томатом. Додати картоплю й капусту, потім засмажку і квасолю. Дати настоятися пів години. Подавати зі сметаною та пампушками.");
  });
  await tryStep("year range", async () => {
    // the two year TextInputs are the only unnamed text inputs on the form
    const years = page.locator('input[type="text"]:not([name])');
    await years.nth(0).fill("1998");
    await years.nth(1).fill("2004");
  });
  caption("Uploading a photo and saving — the memory is published");
  await tryStep("photo upload", () => page.locator('input[type="file"]').setInputFiles(photoPath));
  await page.waitForTimeout(700);
  await page.click('button[type="submit"]');
  await beat(page, 2200); // detail page with the fresh memory
  caption("The saved memory: photo, story, ingredients and cooking steps");
  await scrollBy(page, 800, 4); // show the recipe body: ingredients + steps
  await page.waitForTimeout(1000);
  await scrollBy(page, -800, 3);

  caption("Memories can be edited — changing the title");
  await tryStep("edit the memory", async () => {
    await page.getByText(/редагувати/i).first().click();
    await page.waitForURL("**/edit");
    const title = page.locator('input[type="text"]').first();
    await title.fill("");
    await title.pressSequentially("Бабусин борщ — смак суботи", { delay: 30 });
    await page.click('button[type="submit"]');
    await beat(page, 1800);
  });

  caption("Dashboard filters: all / public / private memories");
  await page.goto(`${BASE_URL}/dashboard`);
  await beat(page, 1200);
  for (const tab of [/приватні/i, /публічні/i, /^всі/i]) {
    await tryStep(`dashboard filter ${tab}`, async () => {
      await page.getByText(tab).first().click();
      await page.waitForTimeout(900);
    });
  }

  // ---- ACT 4 · Warmth, comment, report (~35s) -----------------------------
  stage("ACT 4 — like + comment someone else's memory, then report it");
  caption("Community: opening another member's memory");
  await page.goto(`${BASE_URL}/feed`);
  await beat(page, 1200);
  // nth(1): the first card is our own fresh memory (newest-first) — the report
  // action only renders for non-owners, so open a seeded one instead.
  await page.locator("article").nth(1).click();
  await beat(page, 1600);

  await tryStep("toggle warmth", async () => {
    caption("Sending Warmth — the platform's gentle take on a like");
    await page.locator("button").filter({ hasText: /тепло|❤/i }).first().click();
    await page.waitForTimeout(1200); // amber glow + count
  });
  await tryStep("post a comment", async () => {
    caption("Leaving a comment");
    await scrollBy(page, 700, 3); // read down through the story to the comments
    await page.locator("textarea").first().pressSequentially("Дякую, що поділилися таким теплим спогадом", { delay: 25 });
    await page.locator('button[type="submit"]').last().click();
    await beat(page, 1400);
  });
  await tryStep("report the memory", async () => {
    caption("Reporting content to the moderators");
    await page.getByText(/поскаржит|скарг/i).first().click();
    await page.waitForTimeout(700);
    // the modal mounts AFTER the comment form in the DOM — target its labeled
    // reason field, not the first textarea on the page
    await page
      .getByLabel("Причина скарги")
      .pressSequentially("Демонстраційна скарга для відео", { delay: 20 });
    await page.getByRole("button", { name: /надіслати/i }).click();
    await page.waitForTimeout(1600); // «Скаргу надіслано» banner
  });

  // ---- ACT 5 · Lost Fireflies (~25s) --------------------------------------
  stage("ACT 5 — browse lost requests, create one, see the contact detail");
  caption("Lost Fireflies — requests to find lost photos, classmates, places");
  await page.goto(`${BASE_URL}/lost`);
  await beat(page, 1400);
  await tryStep("open create-request", async () => {
    await page.getByText(/залишити запит/i).first().click();
    await page.waitForURL("**/lost/new");
  });
  if (!page.url().includes("/lost/new")) await page.goto(`${BASE_URL}/lost/new`);
  await beat(page, 900);

  caption("Posting a request: city, place type, years, what to look for, contact email");
  // city and type are native <select>s (city first); years is the only text input
  const lostSelects = page.locator("select");
  try {
    await lostSelects.nth(0).selectOption({ label: "Маріуполь" });
  } catch {
    await lostSelects.nth(0).selectOption({ index: 1 });
  }
  await tryStep("request type", () => lostSelects.nth(1).selectOption({ index: 2 }));
  await tryStep("years", () => page.locator('input[type="text"]').first().fill("1995-2003"));
  await page.locator("textarea").first().fill("Шукаю фотографії нашого 3-Б класу школи № 12. Всі мої альбоми залишилися вдома. Буду вдячна за будь-який знімок.");
  await page.fill('input[type="email"]', FRESH_USER.email);
  await page.click('button[type="submit"]');
  await beat(page, 1600);
  await tryStep("open the new request detail", async () => {
    caption("The published request — full description and a contact button");
    if (!/\/lost\/\d+/.test(page.url())) {
      await page.locator("article").first().click();
      await beat(page, 1200);
    }
    await scrollBy(page, 500, 2); // full description + mailto contact button
    await page.waitForTimeout(1400);
  });

  // ---- ACT 5b · Profile (~10s) --------------------------------------------
  stage("ACT 5b — edit the profile (name, bio)");
  caption("Editing the profile — name, bio, avatar");
  await tryStep("profile edit", async () => {
    await page.goto(`${BASE_URL}/profile`);
    await beat(page, 1000);
    // the form is behind an edit toggle; fields: name, bio, avatar URL
    await page.getByRole("button", { name: /редагувати/i }).first().click();
    await page.waitForTimeout(600);
    await page.locator("textarea").first().fill("Виросла в Маріуполі, збираю спогади про наше дитинство.");
    await page.locator('button[type="submit"]').first().click();
    await beat(page, 1200);
  });

  // ---- ACT 6 · Admin path (~30s) ------------------------------------------
  stage("ACT 6 — logout, admin signs in, handles the report, ban/unban");
  caption("Logging out — and switching to the admin's side of the story");
  await page.getByText(/вийти/i).first().click();
  await beat(page, 1200); // header back to «Увійти»

  await page.goto(`${BASE_URL}/login`);
  await beat(page, 800);
  await page.fill('input[type="email"]', ADMIN.email);
  await page.fill('input[type="password"]', ADMIN.password);
  await page.click('button[type="submit"]');
  await beat(page, 1400);

  caption("The admin panel — the report we just sent is in the queue");
  await page.goto(`${BASE_URL}/admin`);
  await beat(page, 2200); // reports queue with the Act-4 report on top
  await scrollBy(page, 400, 2); // let the report rows read on camera
  await page.waitForTimeout(800);
  await scrollBy(page, -400, 2);
  await tryStep("delete the reported memory", async () => {
    caption("Admins can remove reported content");
    await page.getByRole("button", { name: /видалити/i }).first().click();
    await beat(page, 1600); // row (and sibling rows) disappear
  });
  await tryStep("ban + unban a user", async () => {
    caption("User management — ban and unban");
    // ban actions live behind the users tab
    await page.getByText(/користувач/i).first().click();
    await page.waitForTimeout(1200);
    // protected accounts (admins) render a disabled ban button — pick an enabled one
    await page.locator('button:has-text("Заблокувати"):not([disabled])').first().click();
    await page.waitForTimeout(1300);
    await page.locator('button:has-text("Розблокувати"):not([disabled])').first().click();
    await page.waitForTimeout(1000);
  });

  // ---- ACT 7 · Closing (~12s) ---------------------------------------------
  stage("ACT 7 — rules, about, back to the glow");
  caption("Community rules — kind, calm, Ukrainian-first");
  await page.goto(`${BASE_URL}/rules`);
  await beat(page, 1400);
  await scrollBy(page, 500, 2);
  caption("About the project");
  await page.goto(`${BASE_URL}/about`);
  await beat(page, 1600);
  await scrollBy(page, 700, 3); // the mission text deserves a slow read
  await page.waitForTimeout(800);
  caption("Svitlyachok — keep the light of your childhood");
  await page.goto(BASE_URL);
  await beat(page, 2500); // end on the landing hero

  stage("take complete");
}

// ------------------------------------------------------------------ main ----

async function main() {
  await seed();

  await mkdir(OUT_DIR, { recursive: true });
  let photoPath = process.env.DEMO_PHOTO;
  if (!photoPath) {
    // preferred demo photo if present, otherwise a generated placeholder
    const borscht = join(OUT_DIR, "borscht.jpg");
    if (existsSync(borscht)) {
      photoPath = borscht;
    } else {
      warn("docs/qa/full-demo/borscht.jpg not found — uploading a 1px placeholder");
      photoPath = join(OUT_DIR, "demo-photo.png");
      await writeFile(photoPath, TINY_PNG);
    }
  }

  stage("opening headed browser — recording starts immediately");
  const browser = await chromium.launch({ headless: false, slowMo: SLOWMO });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: OUT_DIR, size: VIEWPORT },
  });
  const page = await context.newPage();
  videoT0 = Date.now(); // recording starts with the first page of the context

  try {
    await run(page, photoPath);
  } finally {
    const video = page.video();
    await page.close();
    // saveAs must happen before browser.close() or it fails silently
    let rawPath = null;
    if (video) {
      rawPath = await video.path().catch(() => null);
      const saved = join(OUT_DIR, "full-demo.webm");
      await video.saveAs(saved).catch((e) => warn(`saveAs failed: ${e.message}`));
      console.log(`[${stamp()}] recording saved: ${saved}`);
    }
    await context.close();
    await browser.close();
    if (rawPath) await rm(rawPath, { force: true }).catch(() => {}); // drop the page@hash duplicate
    if (captions.length) {
      const srt = join(OUT_DIR, "full-demo.srt");
      await writeFile(srt, buildSrt(), "utf8");
      console.log(`[${stamp()}] subtitles written: ${srt} (${captions.length} captions)`);
    }
  }
  console.log(`[${stamp()}] done — target on-camera time ~120s`);
  console.log("burn subtitles while converting to mp4:");
  console.log("  ffmpeg -y -i docs/qa/full-demo/full-demo.webm -vf \"subtitles=docs/qa/full-demo/full-demo.srt\" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart docs/qa/full-demo/full-demo.mp4");
}

main().catch((e) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
