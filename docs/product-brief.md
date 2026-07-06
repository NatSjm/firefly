# Product Brief — Svitlyachok (Firefly)

> Companion to `docs/requirements.md`. The requirements document is the numbered,
> traceable source of truth; this brief is the business narrative behind it.
> Tone throughout the product is Ukrainian‑first, warm and calm, with no
> exclamation marks.

## What this is

Svitlyachok is a Ukrainian‑language web community for adults, dedicated to
childhood, family, and kindness. It is simultaneously:

- a personal archive of warm memories (stories, recipes, photos),
- a cozy community organized by topics and cities,
- a tool for finding childhood photos and videos lost due to war or relocation.

There are no accounts required for browsing, no complex profiles, no chase for
likes. There is a space where everyone can preserve their light and, if they
wish, share it with others.

## Who it is for

The primary user is an **adult (25–50+)** who:

- wants to preserve memories of their childhood, family, and loved ones,
- wants to read other people's warm stories about childhood,
- may have lost some photos/videos due to war or relocation and would like to
  recover something.

A visitor can:

- browse the public feed without registration,
- browse "Lost Fireflies" requests without registration,
- but only registered users can create memories, comments, and requests.

## The pain it addresses

Adults often carry many warm but unwritten stories about childhood: about
grandma's recipes, yard games, favorite songs, school events. Many fear these
memories will disappear, especially if:

- there is nowhere to "put them" other than in their head,
- there is no convenient format (not a diary, not social media),
- typing long texts is difficult,
- some photos/videos were lost due to war.

Existing social networks:

- are overloaded,
- are oriented toward feeds and likes,
- are not designed as personal archives with the ability to share only part.

Svitlyachok reduces this to something simple: one cozy platform where you can:

- preserve what is most precious in a personal archive,
- share publicly if desired,
- see others' memories by topics and cities,
- try to find lost childhood photos/videos through other people.

## End‑to‑end usage

1. **Land.** A visitor arrives at the homepage and sees a calm hero section
   with the name "Svitlyachok", a short description, and a call to create a
   first memory or browse the feed. There are no complex menus, no immediate
   registration requirements just to look around.

2. **Exploration.** The visitor scrolls through the public feed:
    - stories about childhood,
    - grandma's recipes,
    - memories about favorite songs, films, games.

   They can filter by topics ("Okean Elzy", "Grandma's Recipes",
   "Computer Games", "Tamagotchi") and by cities (e.g. "Mariupol",
   "Kyiv", "Kharkiv").

3. **Registration.** If the visitor wants to create a memory or request,
   they register:
    - email + password + display name,
    - after login they gain access to their personal dashboard.

4. **Creating the first memory.** In the dashboard, the user:
    - chooses type: story or recipe,
    - fills in title, text, optionally city, topic, years,
    - chooses visibility: "Only me" or "Public",
    - can add one photo,
    - saves.

   After this, the memory appears:
    - in their personal list ("My Fireflies"),
    - and, if public, in the public feed.

5. **Reading and interaction.** A registered user:
    - reads full memories from others,
    - leaves comments,
    - clicks "Warmth" (like),
    - can create a request in the "Lost Fireflies" section.

6. **Searching for what was lost.** In the "Lost Fireflies" section, the user:
    - sees a list of requests from other people,
    - can create their own request (city, type: kindergarten/school/camp/yard,
      years, description, contact email),
    - other users who have similar photos/videos can contact the author
      directly.

7. **Returning.** The user returns from time to time:
    - to add a new memory,
    - to reread old ones,
    - to check new requests or memories from their city.

## Key workflows in prose

- **Preserve the first memory.** A person registers, creates one story about
  childhood or a grandma's recipe, chooses privacy, and saves. This creates
  personal value from the first use.

- **Find your people by topic.** A person chooses a topic (e.g. "Okean Elzy"
  or "Grandma's Recipes") and scrolls the feed, seeing stories from people in
  different cities, united by a shared cultural code.

- **Find your people by city.** A person chooses their city and sees memories
  from other locals: about the same yards, schools, kindergartens, camps.

- **Try to recover what was lost.** A person who lost childhood photos/videos
  creates a request in "Lost Fireflies" and may receive something from other
  people who kept shared materials.

- **Build a cozy personal archive.** A person gradually fills their
  "My Fireflies" section, turning it into a personal childhood museum they
  can return to for years.

## MVP vs Future boundary

**In the MVP:**

- registration / login / basic profile,
- personal memory archive (stories + recipes) with privacy settings,
- public feed with filters by city and topic,
- "Warmth" likes and comments on public memories,
- "Lost Fireflies" section (requests for finding lost items),
- basic moderation (reports, admin panel),
- "About" and "Community Rules" pages.

**Future (deferred):**

- voice input (telling stories by voice, saving as text),
- expanded access circles (family, friends),
- export to PDF / photo books,
- legacy settings (archive heirs),
- expanded collaboration with schools, museums, communities,
- additional languages beyond Ukrainian.

## Operating principles

- **Warmth and calm.** Ukrainian tone is calm, practical, without hype or
  clickbait. There are no calls to chase likes.

- **Personal > public.** The memory archive is primarily for the user themselves;
  publicity is an option, not a requirement.

- **Safety and trust.** Clear community rules, moderation, ability to report
  content, simple privacy settings.

- **Ukrainian‑first.** UI in Ukrainian by default; structured strings for
  future translation.

- **Simplicity.** No unnecessary features, complex profiles, or excessive
  animation. Every action is clear and straightforward.