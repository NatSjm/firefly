## ADDED Requirements

### Requirement: Public feed returns only public memories

The system SHALL expose a public feed of memories that includes only memories marked public.

#### Scenario: Anonymous visitor loads the feed

- **WHEN** a visitor requests `GET /api/feed`
- **THEN** the API returns HTTP 200 with paginated feed items
- **AND** every returned memory is public

#### Scenario: Feed items include social counts

- **WHEN** the feed response contains one or more memories
- **THEN** each item includes `likesCount` and `commentsCount`
- **AND** an authenticated caller also receives the correct `likedByMe` flag

### Requirement: Public feed supports city, topic, and sort filters

The system SHALL let visitors narrow the public feed by city, topic, and sort order.

#### Scenario: Filtering by city

- **WHEN** a visitor requests `GET /api/feed?city=Київ`
- **THEN** the API returns only public memories whose city is `Київ`

#### Scenario: Filtering by topic

- **WHEN** a visitor requests `GET /api/feed?topic=school`
- **THEN** the API returns only public memories whose topic matches `school`

#### Scenario: Sorting by popularity

- **WHEN** a visitor requests `GET /api/feed?sort=popular`
- **THEN** the API orders items by like count descending
- **AND** ties fall back to newer memories first

### Requirement: Feed page renders filter bar and public cards

The system SHALL render a feed page with the filter controls and public memory cards.

#### Scenario: Rendering the feed page

- **WHEN** the frontend renders `/feed`
- **THEN** the page shows city and topic selectors plus sort controls
- **AND** each rendered memory card shows the title, author, warmth count, and comment count

#### Scenario: Feed page empty state

- **WHEN** the feed API returns no items for the active filters
- **THEN** the page shows an empty-state message instead of cards

### Requirement: Warmth toggles for authenticated users

The system SHALL allow an authenticated user to toggle warmth on a visible public memory.

#### Scenario: Adding warmth

- **WHEN** an authenticated user calls `POST /api/likes` for a memory they can view and no like exists yet
- **THEN** the API returns HTTP 200 with `{ liked: true, count }`
- **AND** the like count increases by one

#### Scenario: Removing warmth

- **WHEN** an authenticated user calls `POST /api/likes` for a memory they already liked
- **THEN** the API returns HTTP 200 with `{ liked: false, count }`
- **AND** the like is removed

#### Scenario: Signed-out user on the memory page

- **WHEN** an anonymous visitor opens `/memories/:id`
- **THEN** the warmth button is disabled
- **AND** the page prompts the visitor to sign in before interacting

### Requirement: Comments support public read and authenticated write

The system SHALL allow public reads of comments and authenticated creation for visible memories.

#### Scenario: Listing comments oldest first

- **WHEN** a visitor requests `GET /api/memories/{id}/comments`
- **THEN** the API returns HTTP 200 with comments in ascending creation order

#### Scenario: Adding a comment

- **WHEN** an authenticated user posts valid text to `POST /api/memories/{id}/comments`
- **THEN** the API returns HTTP 201 with the created comment
- **AND** the frontend shows the new comment on the memory detail page

### Requirement: Comment deletion enforces ownership or admin role

The system SHALL restrict comment deletion to the comment author or an admin.

#### Scenario: Author deletes their own comment

- **WHEN** the comment author calls `DELETE /api/memories/{id}/comments/{commentId}`
- **THEN** the API returns HTTP 204

#### Scenario: Non-owner tries to delete a comment

- **WHEN** an authenticated user who is neither the comment author nor an admin deletes a comment
- **THEN** the API returns HTTP 403

#### Scenario: Deleting through the wrong memory id

- **WHEN** a caller targets a comment through a different memory id than the comment belongs to
- **THEN** the API returns HTTP 404
