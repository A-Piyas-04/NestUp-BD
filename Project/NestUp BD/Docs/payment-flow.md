# Payment Flow

## Overview
- The payment process is a multi-step form for booking a property.
- Located at `/payment` route.

## Steps
1. **Personal Info:** Collects user details (name, email, phone, NID, address).
2. **Payment Method:** User selects payment method (bKash, bank transfer, card, cash) and enters relevant details.
3. **Confirmation:** User reviews all info, accepts terms, and submits payment.

## Components
- **Payment.jsx:** Main container, manages step navigation, form state, and validation.
- **PersonalInfoStep:** Step 1 form.
- **PaymentMethodStep:** Step 2 form, dynamically renders fields based on selected method.
- **ConfirmationStep:** Step 3 summary and terms acceptance.
- **PaymentSidebar:** Shows property details and price breakdown.
- **FormNavigation:** Handles next/back/payment actions.

## Data Flow
- All form data is managed in local state in `Payment.jsx`.
- Step components receive data and handlers as props.
- Validation is performed on each step before proceeding.
- On final step, payment is simulated (real integration needed for production).

## Developer Notes
- Payment methods and banks are defined in `data/paymentData.js`.
- Validation logic is in `utils/validation.js`.
- Add real payment gateway integration for production use. 