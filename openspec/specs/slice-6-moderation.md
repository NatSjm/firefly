# Spec: Slice 6 — Moderation & Admin

**Status:** retrofitted  
**FRs covered:** FR-MOD-01, FR-MOD-02, FR-MOD-03, FR-ADMIN-01, FR-ADMIN-02, FR-ADMIN-03  
**Slice:** 1.6

## Summary
User reporting of memories/comments, admin panel to review reports and take action (delete content, ban users).

## Data Model

```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL,   -- 'memory' | 'comment'
  target_id INT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Users table has `role VARCHAR(20) DEFAULT 'user'` — admins have `role = 'admin'`.

## Endpoints

### POST /api/reports
- **Auth:** Bearer JWT
- **Body:** `{ targetType, targetId, reason? }`
- **Response 201:** created report

### GET /api/admin/reports
- **Auth:** Bearer JWT (role=admin only)
- **Response 200:** array of report objects with target details

### DELETE /api/admin/memories/{id}
- **Auth:** Bearer JWT (role=admin only)
- **Response 204**

### DELETE /api/admin/comments/{id}
- **Auth:** Bearer JWT (role=admin only)
- **Response 204**

### POST /api/admin/users/{id}/ban
- **Auth:** Bearer JWT (role=admin only; cannot ban self)
- **Response 200**

## Frontend
- Memory cards and comments have "Report" button → modal with optional reason
- `/rules` — community rules page (static content)
- `/admin` — reports list; delete memory/comment buttons; ban user button (admin only, redirects non-admins)

## Acceptance Criteria
- Authenticated user can submit a report
- Report appears in /admin for admin users
- Admin can delete a reported memory → memory no longer in feed
- Admin can delete a reported comment → comment removed from thread
- Admin cannot ban themselves
- Non-admin accessing /admin is redirected to /feed
