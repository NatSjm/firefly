# Design: add-identity-and-access

## Overview

This slice uses stateless JWT authentication between the Spring Boot backend and the React SPA. The implementation is retrofitted from existing code and documented here for Phase 4 evidence.

## Decisions

### JWT stateless auth

- The backend issues signed JWTs at registration and login.
- The security filter validates bearer tokens on each protected request.
- No server-side session state is stored.

### Password hashing

- Passwords are hashed with Spring Security `BCryptPasswordEncoder`.
- Raw passwords are never stored or returned.

### User role model

- `User.role` stores either `user` or `admin`.
- Spring Security maps this field to `ROLE_USER` or `ROLE_ADMIN` for route guards.

### Banned-user flag

- `User.isBanned` defaults to `false`.
- Banned users are denied authenticated access even if they present a token.

### Frontend token storage

- The frontend stores the JWT in `localStorage`.
- Axios attaches the token as a bearer header for API requests.

### Protected frontend routes

- A React `ProtectedRoute` component redirects anonymous users to `/login`.
- Admin-only pages additionally require `role === 'admin'`.

## Trade-offs

- `localStorage` keeps the SPA simple and matches the current implementation, but it is more exposed to XSS than httpOnly cookies.
- Stateless JWTs reduce backend complexity, but revocation depends on short expiries or additional server-side controls.
- Role and ban state are re-checked against the database on each authenticated request, which improves correctness at the cost of one repository lookup per request.
