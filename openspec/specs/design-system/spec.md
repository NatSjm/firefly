# design-system Specification

## Purpose
TBD - created by archiving change update-design-system-rebrand. Update Purpose after archive.
## Requirements
### Requirement: UI styling is driven by Svitlyachok design tokens

The frontend SHALL style all UI through the Svitlyachok design-token CSS custom properties (cream surfaces, ink text, night-indigo primary action, firefly-amber accent; Alegreya for headings and story text, Alegreya Sans for UI), with no hard-coded hex colors, spacing pixels, or font names in components or pages outside the token files.

#### Scenario: Primary action uses night indigo

- **WHEN** a primary Button renders in the light theme
- **THEN** its background resolves to the night-indigo action token (`--action-primary`, #232946)
- **AND** its text uses the on-primary token, its shape is a pill radius

#### Scenario: Amber is accent only

- **WHEN** links, topic badges, the Warmth control, the focus indicator, or the active navigation underline render
- **THEN** they use amber accent tokens (`--amber-700` for text on light surfaces, `--amber-500` for icons/decor)
- **AND** the amber glow (`--glow-firefly` / `--shadow-glow-*`) appears only on the brand mark and the Warmth control

#### Scenario: Night theme remaps tokens

- **WHEN** `data-theme="night"` is set on the document element
- **THEN** semantic aliases remap to the night palette (indigo ground, cream text, amber-300 accents) with no per-component changes

### Requirement: Brand assets use the firefly flight-trail logo

The frontend SHALL use the delivered «Політ світлячка» brand assets: the amber flight-trail mark in the header and light surfaces, the amber-glow dark variant on night-indigo surfaces, and the indigo-tile favicon.

#### Scenario: Header and footer show the new mark

- **WHEN** the global header and footer render
- **THEN** the header shows `logo-mark.svg` with the «Світлячок» wordmark
- **AND** the footer (a night-indigo surface) shows `logo-mark-dark.svg`

#### Scenario: Favicon is the delivered brand tile

- **WHEN** `index.html` is served
- **THEN** the favicon is the delivered indigo tile with the amber firefly

### Requirement: Rebrand copy stays calm and conflict-free

UI copy and design documentation touched by the rebrand SHALL contain no exclamation marks (BC-BRAND-01) and SHALL NOT reference war.

#### Scenario: No war references in copy

- **WHEN** any UI string or `DESIGN.md` is reviewed after the rebrand
- **THEN** it contains no references to war
- **AND** the lost-fireflies narrative speaks of photos lost to moves and time, not conflict

