# Backend Overview

## Structure
- **Framework:** Express.js
- **Entry Point:** `server/server.js`
- **Middleware:**
  - `cors` (with credentials)
  - `express.json()` (body parsing)
  - `cookie-parser` (cookie parsing)
- **Routes:**
  - `/api/auth` → Auth routes (register, login)
  - `/api` → General API routes (protected/public examples)
- **Auth Middleware:** `middleware/auth.js` provides JWT verification and user check.

## Authentication
- **JWT-based:** Tokens are generated on login/register and sent to the client.
- **Mock User Data:** Users are stored in-memory (array) for now; DB integration is planned.
- **Protected Routes:** Use `verifyToken` middleware to restrict access.

## Error Handling
- Centralized error handler logs errors and returns 500 status for unhandled exceptions.

## Developer Notes
- All routes are modularized for clarity.
- Auth logic is separated from business logic.
- Add database integration for production use. 