# Dashboard Structure

## Overview
- The dashboard is the main user area for managing listings, bookings, reviews, profile, and payments.
- Located at `/dashboard/*` route, with nested subviews.

## Layout
- **Sidebar:** `DashboardSidebar` component provides navigation links (Dashboard, My Nests, Reviews, Booked Nests, Profile Info, Payment History).
- **Content Area:** Renders the selected subview using React Router nested routes.
- **Header/Footer:** Consistent with the rest of the app.
- **Sidebar Toggle:** Allows opening/closing sidebar on smaller screens.

## Subviews
- **Overview:** Welcome, stats, recent activity, quick actions.
- **My Nests:** User's listed properties.
- **Nest Reviews:** Reviews for user's properties.
- **Booked Nests:** Properties the user has booked.
- **Profile Info:** User profile and settings.
- **Payment History:** List of past payments/transactions.

## Developer Notes
- Each subview is a separate component for maintainability.
- Sidebar state is managed in the main `Dashboard` component.
- Navigation is handled via React Router. 