# Authentication Flow

## Overview
Authentication in NestUp BD is handled using JWT tokens and React Context for state management. Both frontend and backend work together to provide secure login, registration, and protected routes.

## Backend (Express)
- **Routes:**
  - `POST /api/auth/register` — Registers a new user, returns JWT token and name.
  - `POST /api/auth/login` — Authenticates user, returns JWT token and name.
- **Token Generation:**
  - On successful login/register, a JWT token is generated and sent to the client.
- **Middleware:**
  - `verifyToken` (in `middleware/auth.js`): Checks for JWT in cookies or Authorization header, verifies it, and attaches user info to `req.user`.
  - `checkAuth`: Ensures `req.user` exists for protected routes.
- **User Data:**
  - Currently stored in-memory (array); planned for DB integration.

## Frontend (React)
- **AuthContext:**
  - Provides `user`, `login`, `logout`, and `loading` state via React Context API.
  - On login/register, saves token and user name to `localStorage` and updates context.
  - On logout, clears token and user info from `localStorage` and context.
- **Login/Register Flow:**
  - `LoginRegister.jsx` toggles between login and register forms based on route.
  - `LoginForm` and `RegisterForm` submit credentials to backend endpoints.
  - On success, user is redirected to dashboard; on failure, error is shown.
- **Token Handling:**
  - JWT token is stored in `localStorage` and sent with requests as needed.
  - On app load, AuthContext checks for token and user info in `localStorage` to persist login state.
- **Protected Routes:**
  - Dashboard and other sensitive pages check for authenticated user in context; if not present, user is redirected to login.

## Developer Notes
- For production, move user data to a database and secure token handling (e.g., HTTP-only cookies).
- Add token expiration handling and refresh logic as needed. 