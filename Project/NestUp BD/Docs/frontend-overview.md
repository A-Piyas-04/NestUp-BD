# Frontend Overview

## Structure
- **Framework:** React 19
- **Routing:** React Router 7
- **Styling:** Custom CSS, some Tailwind utility classes
- **Entry Point:** `src/main.jsx` wraps the app in `AuthProvider` and renders `App`.
- **Main App:** `src/App.jsx` sets up all routes using `<Routes>` and `<Route>`.

## Main Routes
- `/` → Home page (`Home`)
- `/search` → Search page (`Search`)
- `/dashboard/*` → Dashboard (with nested routes)
- `/login`, `/register` → Auth pages (`LoginRegister`)
- `/provide-service` → List property page
- `/payment` → Payment page
- `*` → NotFound page

## Components
- **Header/Footer:** Present on most pages, handle navigation and user actions.
- **Sidebar:** Used in Dashboard for navigation between subviews.
- **Cards, Forms, Step Indicators:** Modular, reusable components for listings, payment, etc.

## State Management
- **Local State:** Used for form fields, step navigation, etc.
- **AuthContext:** Provides user authentication state and actions (login, logout, loading) via React Context API. Used throughout the app for protected routes and user info.

## Navigation Flow
- Navigation is handled via React Router. Authenticated state is checked for protected routes (e.g., Dashboard).
- Header and mobile nav adapt based on authentication status.

## Developer Notes
- All main logic is split into modular components for maintainability.
- Forms use local state and pass handlers as props.
- AuthContext is the single source of truth for user state. 