# moderation-and-admin Specification

## Purpose
TBD - created by archiving change 2026-07-07-add-moderation-and-admin. Update Purpose after archive.
## Requirements
### Requirement: Authenticated user reports a memory or comment

The system SHALL let an authenticated user report a memory or a comment, with an
optional free-text reason (FR-MOD-02).

#### Scenario: Authenticated user submits a report with a reason

- **WHEN** an authenticated user posts `{ targetType: "memory" | "comment", targetId, reason }`
  to `POST /api/reports`
- **THEN** the API returns HTTP 201
- **AND** the persisted report carries the trimmed reason, the target type/id, and the
  reporting user's id

#### Scenario: Reason is optional and blank reasons are stored as absent

- **WHEN** an authenticated user posts a report without a `reason`, or with a
  whitespace-only `reason`
- **THEN** the API returns HTTP 201
- **AND** the persisted report's reason is null

#### Scenario: Unauthenticated report is rejected

- **WHEN** a visitor without a valid `Authorization` header posts to `POST /api/reports`
- **THEN** the API returns HTTP 401 and does not create a report

#### Scenario: Unknown target type is rejected

- **WHEN** an authenticated user posts a report whose `targetType` is neither `memory`
  nor `comment`
- **THEN** the API returns HTTP 400 and does not create a report

#### Scenario: Signed-in non-owner reports a memory from its detail page

- **WHEN** a signed-in user who does not own the memory opens `/memories/:id` and clicks
  the "Поскаржитися" button
- **THEN** a modal opens with an optional reason field
- **AND** submitting the modal sends the report for that memory (with the trimmed reason,
  or without a reason when the field is blank) and shows a confirmation message

#### Scenario: Report button is hidden where reporting does not apply

- **WHEN** the memory detail page renders for the memory's owner or for a signed-out
  visitor
- **THEN** the "Поскаржитися" button is not shown

### Requirement: Admin views the reports list

The system SHALL let admin users, and only admin users, view the list of submitted
reports (FR-MOD-03).

#### Scenario: Admin lists reports

- **WHEN** an admin requests `GET /api/admin/reports`
- **THEN** the API returns HTTP 200 with an array of reports, each carrying the target
  type, target id, reason, and creation date

#### Scenario: Non-admins cannot access admin endpoints

- **WHEN** an anonymous visitor calls an `/api/admin/*` endpoint
- **THEN** the API returns HTTP 401
- **WHEN** an authenticated non-admin user calls an `/api/admin/*` endpoint
- **THEN** the API returns HTTP 403

#### Scenario: Admin panel renders the reports queue

- **WHEN** an admin opens `/admin`
- **THEN** the page shows a reports table with target type, target id, reason (with an
  explicit "no reason given" fallback), date, and a delete action per row
- **AND** an empty state is shown when there are no reports

#### Scenario: Non-admin is redirected away from the admin panel

- **WHEN** a signed-in non-admin user navigates to `/admin`
- **THEN** the SPA redirects them away from the admin panel instead of rendering it

### Requirement: Admin moderates content and users

The system SHALL let admins delete reported memories and comments and toggle a user
ban, with self- and admin-ban protection (FR-MOD-04).

#### Scenario: Admin deletes a reported memory

- **WHEN** an admin calls `DELETE /api/admin/memories/{id}` for an existing memory
- **THEN** the API returns HTTP 204
- **AND** the memory is no longer retrievable and its photo files are removed
- **AND** all reports targeting that memory are removed

#### Scenario: Admin deletes a reported comment

- **WHEN** an admin calls `DELETE /api/admin/comments/{id}` for an existing comment
- **THEN** the API returns HTTP 204
- **AND** the comment no longer appears in its memory's comment list
- **AND** all reports targeting that comment are removed

#### Scenario: Deleting a missing target returns 404

- **WHEN** an admin calls `DELETE /api/admin/memories/{id}` or
  `DELETE /api/admin/comments/{id}` for an id that does not exist
- **THEN** the API returns HTTP 404

#### Scenario: Admin bans and unbans a user

- **WHEN** an admin calls `POST /api/admin/users/{id}/ban` for a regular user
- **THEN** the API returns HTTP 200 with the new ban state (`{ "banned": true }` on the
  first call, `{ "banned": false }` when called again)
- **AND** while banned the user cannot log in and existing tokens stop authenticating

#### Scenario: Self-ban and admin-ban are refused

- **WHEN** an admin calls `POST /api/admin/users/{id}/ban` targeting themselves or
  another admin
- **THEN** the API returns HTTP 400 and the target's ban state is unchanged
- **WHEN** the target user id does not exist
- **THEN** the API returns HTTP 404

#### Scenario: Admin panel moderation actions update the page

- **WHEN** an admin clicks a report row's delete action and the deletion succeeds
- **THEN** the row disappears and a confirmation message is shown
- **WHEN** an admin toggles a user's ban on the users tab
- **THEN** the row's status reflects the new state
- **AND** the ban action is disabled for admin accounts and for the signed-in admin's
  own row

### Requirement: Public pages link to the rules and to abuse reporting

The system SHALL show, on public pages, a visible link to the community rules and a
visible link for reporting abuse (FR-MOD-05).

#### Scenario: Footer links to the rules

- **WHEN** any page renders with the global footer
- **THEN** the footer shows a "Правила спільноти" link that navigates to `/rules`

#### Scenario: Footer report-abuse link leads to the reporting instructions

- **WHEN** a visitor clicks "Повідомити про порушення" in the global footer
- **THEN** the SPA navigates to `/rules`, whose rules include using the per-content
  "Поскаржитися" button to report violations

