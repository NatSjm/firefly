## ADDED Requirements

### Requirement: User registration returns JWT access

The system SHALL allow a visitor to create an account with email, password, and display name, then receive a JWT for authenticated use.

#### Scenario: Registering a new account
- **WHEN** a visitor submits a unique email, a password with at least 8 characters, and a display name
- **THEN** the API creates the user with a hashed password
- **AND** the response returns HTTP 201 with a JWT and the created user's summary

#### Scenario: Registering with an existing email
- **WHEN** a visitor submits an email that already belongs to another account
- **THEN** the API returns HTTP 409
- **AND** the response includes a user-safe error message

### Requirement: User login returns JWT access

The system SHALL allow a registered user to sign in with email and password and receive a JWT for client-side storage.

#### Scenario: Logging in with valid credentials
- **WHEN** a registered user submits a valid email and password
- **THEN** the API returns HTTP 200 with a JWT and the authenticated user's summary

#### Scenario: Logging in with invalid credentials
- **WHEN** a registered user submits an incorrect email or password
- **THEN** the API returns HTTP 401
- **AND** the response does not expose which field was incorrect

### Requirement: Authenticated profile access

The system SHALL allow an authenticated user to read and update their own profile through JWT-protected endpoints.

#### Scenario: Reading the current profile
- **WHEN** a user calls `GET /api/auth/me` with a valid bearer token
- **THEN** the API returns HTTP 200 with the current user's profile

#### Scenario: Updating the current profile
- **WHEN** a user calls `PUT /api/users/me` with a valid bearer token and profile changes
- **THEN** the API persists the updates for that user
- **AND** the API returns HTTP 200 with the updated profile

### Requirement: Protected routes redirect anonymous users

The system SHALL keep protected frontend pages behind authenticated navigation.

#### Scenario: Visiting a protected route while signed out
- **WHEN** an anonymous visitor opens a protected frontend route
- **THEN** the app redirects the visitor to `/login`
- **AND** the original destination is preserved for post-login navigation
