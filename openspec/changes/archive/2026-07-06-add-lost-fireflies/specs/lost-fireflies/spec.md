## ADDED Requirements

### Requirement: Anyone can view the list of lost requests

The system SHALL let any visitor, authenticated or not, view the list of Lost Fireflies
requests (FR-LOST-01).

#### Scenario: Anonymous visitor loads the lost requests list

- **WHEN** a visitor requests `GET /api/lost-requests` without an `Authorization` header
- **THEN** the API returns HTTP 200 with an array of lost request summary objects
- **AND** each object includes `city`, `type`, `years`, `description`, `authorName`, and
  `createdAt`
- **AND** the list response does NOT include `contactEmail` (only the detail endpoint
  returns it, to avoid bulk-scraping contact addresses from the public list)

#### Scenario: Frontend renders the lost requests list for a signed-out visitor

- **WHEN** an unauthenticated visitor opens `/lost`
- **THEN** the page renders the request cards without requiring login
- **AND** the call-to-action button reads "Увійти, щоб залишити запит" and navigates to
  `/login` when clicked

### Requirement: Authenticated user creates a lost request

The system SHALL let an authenticated user create a lost request with city, type, years,
description, and contact email (FR-LOST-02).

#### Scenario: Authenticated user submits a valid request

- **WHEN** an authenticated user posts `{ city, type, description, contactEmail }` (with
  `years` optional) to `POST /api/lost-requests`
- **THEN** the API returns HTTP 201 with the created lost request
- **AND** the created record's author is the authenticated user

#### Scenario: Missing required field is rejected

- **WHEN** an authenticated user posts a request missing `city`, `description`, or
  `contactEmail`
- **THEN** the API returns HTTP 400 and does not create a record

#### Scenario: Malformed contact email is rejected

- **WHEN** an authenticated user posts a request where `contactEmail` is not a valid email
  address
- **THEN** the API returns HTTP 400 and does not create a record

#### Scenario: Unauthenticated visitor cannot create a request

- **WHEN** a visitor without a valid `Authorization` header posts to
  `POST /api/lost-requests`
- **THEN** the API returns HTTP 401 and does not create a record

#### Scenario: Frontend blocks submission of an incomplete form

- **WHEN** an authenticated user submits `/lost/new` with a blank city, description, or
  contact email
- **THEN** the page shows an inline validation message
- **AND** no request is sent to the API

### Requirement: Lost requests list supports city and type filters

The system SHALL let visitors narrow the lost requests list by city and by type
(FR-LOST-03).

#### Scenario: Filtering by city

- **WHEN** a visitor requests `GET /api/lost-requests?city=Маріуполь`
- **THEN** the API returns only lost requests whose `city` equals `Маріуполь`

#### Scenario: Filtering by type

- **WHEN** a visitor requests `GET /api/lost-requests?type=school`
- **THEN** the API returns only lost requests whose `type` equals `school`

#### Scenario: No filters returns the full list

- **WHEN** a visitor requests `GET /api/lost-requests` with no `city` or `type` query
  parameters
- **THEN** the API returns all lost requests ordered by creation date descending

#### Scenario: Frontend filter bar narrows the rendered list

- **WHEN** a visitor selects a city and a type in the `/lost` filter bar
- **THEN** the page re-fetches and renders only the cards matching both filters
- **AND** if no card matches, the page shows an empty-state message instead of cards

### Requirement: Lost request card shows summary fields

The system SHALL render each lost request card with city, type, years, description
excerpt, author, and date (FR-LOST-04).

#### Scenario: Rendering a card in the list

- **WHEN** the `/lost` page renders a lost request card
- **THEN** the card shows the city, the type label, the years (if provided), a description
  excerpt (truncated with an ellipsis when the description exceeds the excerpt length),
  the author's display name, and a formatted creation date

#### Scenario: Card omits years when not provided

- **WHEN** a lost request was created without a `years` value
- **THEN** the rendered card does not show a years badge or field

### Requirement: Lost request detail shows full description and mailto contact

The system SHALL render a lost request's full description and a mailto link to the
contact email on its detail page (FR-LOST-05).

#### Scenario: Anonymous visitor loads the detail page

- **WHEN** a visitor requests `GET /api/lost-requests/{id}` for an existing request
- **THEN** the API returns HTTP 200 with the full `description` and `contactEmail`

#### Scenario: Detail page renders full description and contact button

- **WHEN** `/lost/:id` renders successfully
- **THEN** the page shows the full (non-truncated) description
- **AND** the page shows the author's contact email as text
- **AND** the page shows a "Написати автору" button

#### Scenario: Clicking the contact button opens the visitor's mail client

- **WHEN** a visitor clicks the "Написати автору" button on `/lost/:id`
- **THEN** the browser navigates to a `mailto:` URL addressed to the request's
  `contactEmail`

#### Scenario: Requesting a non-existent id

- **WHEN** a visitor requests `GET /api/lost-requests/{id}` for an id that does not exist
- **THEN** the API returns HTTP 404

#### Scenario: Detail page handles a not-found or failed fetch

- **WHEN** `/lost/:id` fails to load the request (network/API error) or no request is
  returned
- **THEN** the page shows an error message or a "Запит не знайдено" message instead of a
  blank or crashed page
