# Spec: Slice 5 — Lost Fireflies (Search Requests)

**Status:** retrofitted  
**FRs covered:** FR-LOST-01, FR-LOST-02, FR-LOST-03, FR-LOST-04, FR-LOST-05  
**Slice:** 1.5

## Summary
Section for posting and browsing requests to find lost childhood photos/videos or reconnect with people.

## Data Model

```sql
CREATE TABLE lost_requests (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city VARCHAR(120) NOT NULL,
  type VARCHAR(30) NOT NULL,    -- 'kindergarten' | 'school' | 'camp' | 'yard' | 'other'
  years VARCHAR(50),
  description TEXT NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Endpoints

### GET /api/lost-requests
- **Auth:** none
- **Query:** `city`, `type`
- **Response 200:** array of lost request objects

### POST /api/lost-requests
- **Auth:** Bearer JWT
- **Body:** `{ city, type, years?, description, contactEmail }`
- **Response 201:** created lost request

### GET /api/lost-requests/{id}
- **Auth:** none
- **Response 200:** single lost request with author info

## Frontend
- `/lost` — header + description; filters (city, type); cards list
- `/lost/new` — form: city (required), type, years, description, contactEmail (required)
- `/lost/:id` — full description, contact email, optional mailto button

## Acceptance Criteria
- Unauthenticated user can browse /lost
- Authenticated user can submit a request via /lost/new
- Filter by city/type narrows results
- Contact email visible on detail page
- mailto button opens email client
