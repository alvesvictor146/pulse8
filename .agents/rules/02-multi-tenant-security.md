# Multi-Tenant & Security Rules — Pulse8

## Directives
1. **Tenant Isolation**: Every database entity must include an `organization_id` field. Database queries and mutations MUST scope results by the active user's `organization_id`.
2. **Role-Based Access Control (RBAC)**: Enforce granular role checks (`ADMIN`, `PRODUCER`, `FINANCE`, `STAFF`, `PROMOTER`) before executing API mutations.
3. **Data Protection (LGPD)**: Mask sensitive information (CPF, phone numbers, banking details) in default UI lists unless explicitly authorized.
4. **QR Code Security**: Guest QR codes must be signed with HMAC-SHA256 containing `guest_id`, `event_id`, and `timestamp` to prevent forgery.
5. **Audit Logging**: Write immutable audit logs for all financial entries, ticket status changes, and user permission updates.
