## ADDED Requirements

### Requirement: Memory creation with story and recipe types

The system SHALL allow an authenticated user to create a memory of type `story` or `recipe` with a title, text, optional recipe ingredients and steps, optional city, optional topic, optional year range, optional photo, and a visibility choice.

#### Scenario: Creating a story

- **WHEN** an authenticated user submits a memory with type `story`, a title, and text
- **THEN** the API returns HTTP 201 with the created memory owned by that user

#### Scenario: Creating a recipe with ingredients and steps

- **WHEN** an authenticated user submits a memory with type `recipe`, ingredients, and steps
- **THEN** the API persists the ingredients and steps
- **AND** the created memory returns them in the response

#### Scenario: Rejecting a memory without required fields

- **WHEN** an authenticated user submits a memory with a blank title or blank text
- **THEN** the API rejects the request with a validation error

### Requirement: Memory photo upload

The system SHALL accept one optional photo per memory as a multipart file part and serve it from the uploads path.

#### Scenario: Creating a memory with a photo

- **WHEN** an authenticated user submits a memory with a photo file part
- **THEN** the file is stored under the configured upload directory with a generated name
- **AND** the memory's media URLs include the `/uploads/` path of the stored file

#### Scenario: Replacing a photo on update

- **WHEN** the owner updates a memory and attaches a new photo
- **THEN** the previous media record is removed
- **AND** the new photo becomes the memory's media URL

### Requirement: Memory visibility control

The system SHALL let the author choose between private and public visibility, defaulting to private, and SHALL hide private memories from other users.

#### Scenario: Viewing a public memory anonymously

- **WHEN** any visitor requests a memory marked public
- **THEN** the API returns HTTP 200 with the memory

#### Scenario: Viewing a private memory as a non-owner

- **WHEN** a user who is not the owner and not an admin requests a private memory
- **THEN** the API returns HTTP 403

#### Scenario: Defaulting to private

- **WHEN** a memory is created without an explicit visibility choice
- **THEN** the memory is stored as private

### Requirement: Dashboard lists own memories with visibility filters

The system SHALL show the authenticated user their own memories in a dashboard filterable by all, public, or private.

#### Scenario: Listing own memories

- **WHEN** an authenticated user requests their memories without filters
- **THEN** the API returns only memories owned by that user, newest first

#### Scenario: Filtering by visibility

- **WHEN** an authenticated user filters their memories by public or private
- **THEN** the API returns only their memories with the matching visibility

### Requirement: Owner can edit and delete own memories

The system SHALL allow users to edit and delete only their own memories, with admin override for deletion.

#### Scenario: Owner updates a memory

- **WHEN** the owner submits changed fields for their memory
- **THEN** the API persists the changes and returns HTTP 200 with the updated memory

#### Scenario: Non-owner attempts an update

- **WHEN** an authenticated user submits an update for a memory they do not own
- **THEN** the API returns HTTP 403

#### Scenario: Owner deletes a memory

- **WHEN** the owner deletes their memory
- **THEN** the API returns HTTP 204
- **AND** the memory and its media records are removed

### Requirement: Single memory page shows full content

The system SHALL render a single memory page with the full text, photo, and metadata, restricted to the owner when private.

#### Scenario: Viewing the full memory page

- **WHEN** a permitted viewer opens a memory page
- **THEN** the page shows the title, full text, author, photo when present, and city, topic, and year metadata when present

#### Scenario: Recipe sections on the memory page

- **WHEN** a permitted viewer opens a recipe memory with ingredients and steps
- **THEN** the page shows the ingredients and steps sections

### Requirement: Predefined topics and suggested cities

The system SHALL offer a predefined topic list for memory creation and an optional city chosen from a suggested list.

#### Scenario: Choosing a topic from the predefined list

- **WHEN** a user creates or edits a memory
- **THEN** the form offers exactly the predefined topics: Океан Ельзи, Бабусині рецепти, Комп'ютерні ігри, Тамагочі, Дворові ігри

#### Scenario: City is optional

- **WHEN** a user submits a memory without a city
- **THEN** the memory is saved with no city value
