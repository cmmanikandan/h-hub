# H-Hub Smoke Test Checklist

Use this checklist after starting both frontend and backend.

## Environment

- Frontend is running on http://localhost:5173 or next available port
- Backend is running on http://localhost:5000
- Health endpoint returns HTTP 200: http://localhost:5000/api/health

## Authentication

- Open login page and sign in with a valid user
- Confirm no Network Error popup appears
- Confirm role redirects work (admin, seller, delivery, logix)
- Sign out and verify session is cleared

## Core User Flow

- Browse product listing
- Add item to cart
- Place one test order
- Open My Orders and verify order appears

## Seller Flow

- Login as seller and open dashboard
- Create one product
- Edit one product field
- Delete or deactivate test product

## Delivery Flow

- Login as delivery account
- Open assigned orders
- Update one order status

## Admin Flow

- Login as admin dashboard
- Open orders table
- Open one order details modal
- Add order bonus and verify success response

## Payments And Wallet

- Open online payment QR flow
- Confirm payment request call succeeds
- Verify wallet or payment status update appears

## File Upload

- Upload one image/file
- Verify URL is returned and renders correctly

## Error Handling

- Stop backend temporarily and try login
- Confirm popup title is Backend Offline with actionable message
- Restart backend and verify normal operation resumes
