# Implementation of Dynamic Permissions Matrix and Automated Security Tests

## Summary
Build a dynamic permission management interface and an automated security testing suite to ensure the MSI 2.0 access control is robust, granular, and verifiable.

## Proposed Changes

### Database & Backend
- Create `role_permissions` table to persist dynamic permission settings.
- Update `hasPermission` logic in `src/lib/permissions.ts` to check database-stored permissions (with caching/fallback).
- Implement server-side validation functions to protect sensitive actions.

### Management UI
- Create `/admin/permissions` route for managing the role-action matrix.
- Build a grid interface where administrators can toggle specific permissions for each role.
- Implement real-time audit logging for any changes to the permission matrix.

### Automated Testing
- Develop a suite of integration tests that simulate requests from different roles.
- Verify that restricted actions (e.g., PDG validation, financial writes) are strictly blocked for unauthorized roles.
- Generate a security audit report based on test results.

## Technical Details
- **Tables**: `public.role_permissions (id, role, permission, created_at, updated_at)`.
- **Logic**: Use `createServerFn` with strict `requireSupabaseAuth` and role-based guards.
- **Frontend**: Shadcn/UI for the matrix grid (Table + Switch components).
- **Testing**: Bun/Vitest for server-side function testing against a mock or dev environment.

## User Review Required
- Which specific roles (other than PDG/Informaticien) should be allowed to view the permission matrix?
- Do you have a list of "Critical Actions" that must be monitored with highest priority?
