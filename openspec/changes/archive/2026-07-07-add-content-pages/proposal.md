# Proposal: add-content-pages

Introduce the Content Pages slice as a tracked retrofitted OpenSpec change for the static informational pages `/about` and `/rules`.

This change captures the two public content pages that provide essential project information and community guidelines. Both pages are accessible without authentication and follow the project's Ukrainian-first, warm tone (no exclamation marks per BC-BRAND-01).

**FRs covered:** FR-CONTENT-01, FR-CONTENT-02.

## Why

Users and visitors need to understand what Svitlyachok is, who it's for, and what the community guidelines are. These static pages provide:
- **Project context** (`/about`): Helps first-time visitors understand the purpose and scope of the platform
- **Community norms** (`/rules`): Sets clear expectations for behavior, reducing moderation burden

Both pages are required for MVP launch and linked from the global footer (FR-MOD-05 requires a rules link).

## What Changes

- `/about` page component rendering project description, target audience, and features in Ukrainian
- `/rules` page component rendering community guidelines in Ukrainian
- Both pages use design tokens, have no authentication requirement, contain no exclamation marks (BC-BRAND-01)
- Public routes configured in App.tsx
- Unit tests added for both pages (15 tests total: 6 for About, 9 for Rules)

### In scope
- `/about` page with project description, purpose, and target audience (FR-CONTENT-01)
- `/rules` page with community guidelines (FR-CONTENT-02)
- Routes configured as public (no auth required)
- Ukrainian content following brand guidelines
- Design tokens applied
- Accessibility validation
- Unit tests for both pages

### Out of scope
- CMS-driven content (future)
- Dynamic content loading
- User-submitted content on these pages
