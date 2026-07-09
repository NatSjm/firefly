# Tasks: add-identity-and-access

## 1. Schema

- [x] Confirm `users` table exists in the V1 Flyway migration with profile fields and auth columns.
- [x] Confirm `role` and `is_banned` fields are represented in the backend entity model.

## 2. Tests

- [x] Add JWT service unit coverage for token generation, extraction, and expiry handling.
- [x] Add request validation coverage for registration inputs with Jakarta validation.
- [x] Add user entity default-value coverage for role and ban state.
- [x] Add frontend rendering coverage for `/login` and `/register`.

## 3. Auth endpoints

- [x] Confirm `POST /api/auth/register` accepts email, password, and name, then returns a JWT-auth response.
- [x] Confirm `POST /api/auth/login` accepts email and password, then returns a JWT-auth response.
- [x] Confirm `GET /api/auth/me` returns the authenticated user.

## 4. User endpoints

- [x] Confirm `PUT /api/users/me` updates the authenticated user profile.
- [x] Confirm JWT protection blocks unauthenticated access to protected user routes.

## 5. FE pages

- [x] Confirm `/register` renders the registration form and submits through the auth context.
- [x] Confirm `/login` renders the login form and stores the token client-side through the auth context.
- [x] Confirm `/profile` reads and updates the authenticated profile.
- [x] Confirm protected routes redirect anonymous users to `/login`.

## 6. Validation battery + archive

- [x] Run the frontend validation battery: `pnpm run lint`, `pnpm run test:run`, `pnpm run build`.
- [x] Run backend Maven validation and record the environment blocker when dependency resolution or DB access prevents the full suite.
- [x] Run backend unit-test targeting for `JwtServiceTest`, `RegisterRequestValidationTest`, and `UserEntityTest`.
- [x] Validate the change with `npx openspec validate add-identity-and-access --strict`.
- [x] Validate the repository with `npx openspec validate --all --strict`.
- [x] Archive the change and preserve inline review evidence.
