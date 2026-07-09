# content-pages Specification

## Purpose
TBD - created by archiving change add-content-pages. Update Purpose after archive.
## Requirements
### Requirement: Public About page describes the project

The system SHALL provide a public `/about` page that describes what Svitlyachok is, who it is for, and what users can do, in Ukrainian (FR-CONTENT-01).

#### Scenario: About page renders project description

- **WHEN** any visitor navigates to `/about`
- **THEN** the page renders a heading "Про проєкт"
- **AND** the page shows a section "Що таке Світлячок" describing the project as a Ukrainian community for preserving and sharing childhood memories
- **AND** the description mentions personal archive, community features, and finding lost photos

#### Scenario: About page renders target audience

- **WHEN** the `/about` page renders
- **THEN** a section "Для кого цей простір" describes the target audience
- **AND** the text mentions family stories, recipes, lost photos from school/kindergarten/camp/yards, and supporting others

#### Scenario: About page renders usage information

- **WHEN** the `/about` page renders
- **THEN** a section "Що тут можна робити" lists available features
- **AND** the text mentions creating private and public memories, reading the feed, leaving warmth, commenting, editing profile, and posting lost firefly requests

#### Scenario: About page is accessible without authentication

- **WHEN** an unauthenticated visitor navigates to `/about`
- **THEN** the page renders successfully with no redirect to login
- **AND** the page contains no authentication-gated content

#### Scenario: About page follows brand guidelines

- **WHEN** the `/about` page renders
- **THEN** all text is in Ukrainian
- **AND** the page contains no exclamation marks (BC-BRAND-01)
- **AND** the tone is warm and calm throughout

### Requirement: Public Rules page contains community guidelines

The system SHALL provide a public `/rules` page that presents community guidelines covering kindness, respect, no spam, and no political conflicts, in Ukrainian (FR-CONTENT-02).

#### Scenario: Rules page renders community guidelines

- **WHEN** any visitor navigates to `/rules`
- **THEN** the page renders a heading "Правила спільноти"
- **AND** the page shows an ordered list of community rules

#### Scenario: Rules cover required topics

- **WHEN** the `/rules` page renders
- **THEN** the rules include a guideline about respect and no insults/harassment
- **AND** the rules include a guideline about no political conflicts
- **AND** the rules include a guideline about no spam or advertising
- **AND** the rules include a guideline about not sharing others' personal data without consent
- **AND** the rules include a call-to-action to use the "Поскаржитися" button when violations are observed

#### Scenario: Rules page is accessible without authentication

- **WHEN** an unauthenticated visitor navigates to `/rules`
- **THEN** the page renders successfully with no redirect to login
- **AND** the page contains no authentication-gated content

#### Scenario: Rules page follows brand guidelines

- **WHEN** the `/rules` page renders
- **THEN** all text is in Ukrainian
- **AND** the page contains no exclamation marks (BC-BRAND-01)
- **AND** the tone is warm but clear throughout

