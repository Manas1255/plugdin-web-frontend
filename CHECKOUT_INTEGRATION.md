# Checkout Page Integration Guide

## Overview

The checkout page implementation allows users to submit booking requests with Stripe payment method setup (SetupIntent). No charge is made immediately - the card is only saved for future use once the vendor confirms the booking.

## Flow

1. **Service Details Page** → User selects date, time, and pricing option
2. **Checkout Page** → User enters billing details and card information
3. **Stripe SetupIntent** → Card is saved securely (no charge)
4. **Backend Confirmation** → Payment method is attached to booking request
5. **Success Page** → User sees confirmation

## Files Created

### Components & Pages
- `src/pages/CheckoutPage.tsx` - Main checkout page with Stripe Elements
- `src/pages/CheckoutPage.css` - Styling for checkout page

### Services
- `src/services/bookingRequests.ts` - API service for booking requests

### Types
- Added to `src/types/index.ts`:
  - `BillingDetails`
  - `BookingRequestPayload`
  - `BookingRequestResponse`
  - `CompletePaymentMethodPayload`
  - `CompletePaymentMethodResponse`

### Configuration
- `.env.example` - Environment variables template

## Environment Setup

Create a `.env` file in the project root:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

Get your Stripe publishable key from: https://dashboard.stripe.com/apikeys

## Backend API Integration

The frontend expects the following API endpoints:

### 1. Create Booking Request

**Endpoint:** `POST /api/booking-requests`

**Request Body:**
```json
{
  "serviceId": "service_123",
  "pricingOptionId": "option_123", // Optional
  "bookingStart": "2026-01-25T14:00:00",
  "bookingEnd": "2026-01-25T16:00:00",
  "notes": "Special requests...", // Optional
  "billingDetails": { // Optional, can be sent later
    "name": "John Doe",
    "address": {
      "line1": "123 Main St",
      "line2": "Apt 4B",
      "city": "Toronto",
      "state": "ON",
      "postalCode": "M5H 2N2",
      "country": "CA"
    }
  }
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "bookingRequestId": "br_123",
    "stripe": {
      "clientSecret": "seti_xxx_secret_yyy"
    },
    "pricing": {
      "subtotal": 150.00,
      "platformFee": 15.00,
      "tax": 0.00,
      "total": 165.00
    },
    "service": {
      "id": "service_123",
      "title": "Professional Photography",
      "vendor": {
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "bookingStart": "2026-01-25T14:00:00",
    "bookingEnd": "2026-01-25T16:00:00"
  },
  "error": null
}
```

### 2. Complete Payment Method

**Endpoint:** `POST /api/booking-requests/:bookingRequestId/complete-payment-method`

**Request Body:**
```json
{
  "setupIntentId": "seti_xxx"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "success": true,
    "message": "Payment method saved successfully"
  },
  "error": null
}
```

## Backend Implementation Steps

### Step 1: Install Stripe SDK

```bash
npm install stripe
# or
yarn add stripe
```

### Step 2: Initialize Stripe

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
```

### Step 3: Create SetupIntent

When a booking request is created:

```typescript
// Create or get Stripe customer
const customer = await stripe.customers.create({
  email: user.email,
  name: `${user.firstName} ${user.lastName}`,
  metadata: {
    userId: user.id,
  },
});

// Create SetupIntent
const setupIntent = await stripe.setupIntents.create({
  customer: customer.id,
  payment_method_types: ['card'],
  metadata: {
    bookingRequestId: bookingRequest.id,
  },
});

// Return client secret to frontend
return {
  bookingRequestId: bookingRequest.id,
  stripe: {
    clientSecret: setupIntent.client_secret,
  },
  // ... other data
};
```

### Step 4: Save Payment Method

After frontend confirms setup:

```typescript
// Retrieve the SetupIntent to get payment method
const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

// Save payment method ID to booking request
await bookingRequest.update({
  paymentMethodId: setupIntent.payment_method,
  stripeCustomerId: setupIntent.customer,
});

// Later, when vendor confirms, charge the card:
const paymentIntent = await stripe.paymentIntents.create({
  amount: bookingRequest.total * 100, // Amount in cents
  currency: 'cad',
  customer: bookingRequest.stripeCustomerId,
  payment_method: bookingRequest.paymentMethodId,
  off_session: true,
  confirm: true,
  metadata: {
    bookingRequestId: bookingRequest.id,
  },
});
```

## Testing

### Test Cards

Use Stripe's test cards in test mode:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

Use any future expiry date, any CVC, and any ZIP code.

### Mock Mode

The current implementation uses mock data. To switch to real API:

1. Update `src/services/bookingRequests.ts`
2. Uncomment the real API calls
3. Comment out the mock responses

## User Experience

1. **No Immediate Charge**: Users see clear messaging that they won't be charged now
2. **Validation**: All required fields are validated before submission
3. **Error Handling**: Clear error messages for failed payment setups
4. **Success State**: Confirmation page with next steps

## Security Considerations

- **Never** send card details to your backend - Stripe handles this
- **Always** validate the SetupIntent status on backend before saving
- **Store** only the payment method ID, never raw card data
- **Use** webhooks to handle asynchronous events

## Future Enhancements

- Add support for other payment methods (Apple Pay, Google Pay)
- Implement saved payment methods for returning users
- Add promotional codes/discounts
- Support for split payments
- Refund handling when vendor cancels

## Troubleshooting

### Stripe Elements not loading
- Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Verify the key starts with `pk_test_` or `pk_live_`

### SetupIntent creation fails
- Check backend has correct Stripe secret key
- Verify Stripe API version compatibility
- Check customer creation is successful

### Payment method not saving
- Ensure `setupIntent.status === 'succeeded'`
- Verify webhook handlers are set up (if using webhooks)
- Check that payment method is attached to customer

## Contact

For questions or issues with the checkout integration, please refer to:
- Stripe Documentation: https://stripe.com/docs/payments/setup-intents
- Project Repository: [Add your repo URL]
