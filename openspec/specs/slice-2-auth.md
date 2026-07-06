# Spec: Slice 2 — Registration, Auth & Profile

**Status:** retrofitted  
**FRs covered:** FR-AUTH-01, FR-AUTH-02, FR-AUTH-03, FR-AUTH-04, FR-PROFILE-01, FR-PROFILE-02  
**Slice:** 1.2

## Summary
User registration and login with JWT, protected routes, profile view/edit.

## Data Model

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(512),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

## Endpoints

### POST /api/auth/register
- **Auth:** none
- **Body:** `{ email, password (min 8), name }`
- **Response 201:** `{ token, user: { id, email, name, role } }`
- **Response 409:** email already taken

### POST /api/auth/login
- **Auth:** none
- **Body:** `{ email, password }`
- **Response 200:** `{ token, user: { id, email, name, role } }`
- **Response 401:** invalid credentials

### GET /api/auth/me
- **Auth:** Bearer JWT
- **Response 200:** `{ id, email, name, bio, avatarUrl, role }`

### PUT /api/users/me
- **Auth:** Bearer JWT
- **Body:** `{ name?, bio?, avatarUrl? }`
- **Response 200:** updated user object

## Frontend
- `/register` — form with email, password, name; POST → redirect to /dashboard
- `/login` — form; POST → store JWT in localStorage → redirect to /dashboard
- `/profile` — displays name, bio, avatar; edit button opens inline form
- Protected routes redirect unauthenticated users to `/login`
- Header shows name/avatar and logout button when authenticated

## Acceptance Criteria
- Register with new email → 201 + JWT returned
- Register with duplicate email → 409 error shown in UI
- Login with valid creds → JWT stored, user redirected to /dashboard
- Login with wrong password → 401 error shown
- `GET /api/auth/me` with valid JWT → 200
- `GET /api/auth/me` without token → 401
- Profile page shows current user data
- Profile edit updates name/bio
