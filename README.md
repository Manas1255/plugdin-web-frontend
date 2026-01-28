# Plugdin Web Frontend

A modern React-based MVP for a service marketplace similar to Tensano.

## Features

- **Guest Homepage**: Hero section with service search by category and listing type
- **Authentication**: Combined Sign up / Log in page with role-based routing (Client/Vendor)
- **Vendor Add Service Flow**: Multi-step form for vendors to create services
  - Details: Listing type, category, title, description, specifications, cities
  - Pricing: Hourly or fixed pricing with package options
  - Availability: Weekly schedule with timezone support
  - Photos: Upload service photos (up to 10)
- **Search Results**: Browse and filter services with pagination
- **Service Details**: View detailed service information with booking sidebar
- **Checkout & Booking**: Stripe-integrated checkout flow for booking requests
  - Date and time selection
  - Pricing package selection
  - Secure card information collection (SetupIntent)
  - Billing details form
  - No charge until vendor confirms
- **Role-Based Access**: Vendors-only routes with friendly access control

## Tech Stack

- React 19
- TypeScript
- React Router v7
- Axios for API calls
- Stripe Elements for payment processing
- CSS3 for styling
- date-fns for date utilities

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Environment Setup

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Stripe Configuration (for checkout)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

Update the URLs and keys:
- `VITE_API_BASE_URL`: Your backend API endpoint
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will run at `http://localhost:5173`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/                    # App root component
├── assets/                 # Static assets
├── components/             # Reusable components
│   ├── Navbar.tsx
│   ├── Modal.tsx
│   ├── Stepper.tsx
│   ├── Loading.tsx
│   └── VendorGuard.tsx
├── context/                # React context providers
│   ├── AuthContext.tsx
│   └── AddServiceDraftContext.tsx
├── hooks/                  # Custom hooks
├── pages/                  # Page components
│   ├── HomePage.tsx
│   ├── AuthPage.tsx
│   ├── SearchResultsPage.tsx
│   ├── ServiceDetailsPage.tsx
│   ├── CheckoutPage.tsx
│   ├── AddServiceDetailsPage.tsx
│   ├── AddServicePricingPage.tsx
│   ├── AddServiceAvailabilityPage.tsx
│   ├── AddServicePhotosPage.tsx
│   ├── ApplyAsVendorPage.tsx
│   └── PlaceholderPage.tsx
├── services/               # API service layer
│   ├── apiClient.ts
│   ├── auth.ts
│   ├── services.ts
│   ├── vendorApplications.ts
│   └── bookingRequests.ts
├── styles/                 # Global styles
├── types/                  # TypeScript types
└── utils/                  # Utility functions
    ├── timeUtils.ts
    └── mappers.ts
```

## Routes

### Public Routes
- `/` - Homepage with hero search
- `/auth` - Sign up / Log in page
- `/search` - Search results page
- `/services/:serviceId` - Service details and booking
- `/booking/checkout` - Checkout with Stripe payment
- `/apply-as-vendor` - Vendor application (placeholder)
- `/brand-home` - Brand portal (placeholder)
- `/creator-vendor-onboarding` - Creator onboarding (placeholder)

### Vendor-Only Routes
- `/add-service/details` - Service details step
- `/add-service/pricing` - Pricing configuration
- `/add-service/availability` - Set weekly schedule
- `/add-service/photos` - Upload service photos

## API Integration

### Authentication

**Sign Up (Client Only)**
```
POST /api/auth/signup/client
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string"
}
```

**Log In**
```
POST /api/auth/login
{
  "email": "string",
  "password": "string"
}
```

### Services

**Get Categories**
```
GET /api/services/categories/all
```

**Get Category Specifications**
```
GET /api/services/categories/{slug}/specifications
```

**Get Cities**
```
GET /api/services/cities/all
```

**Search Services**
```
POST /api/services/search
{
  "category": "string | null",
  "listingType": "hourly | fixed | null",
  "page": number,
  "limit": number
}
```

**Create Service**
```
POST /api/services
{
  "listingType": "hourly | fixed",
  "category": "string",
  "listingTitle": "string",
  "listingDescription": "string",
  "packageSpecifications": ["string"],
  "servicingArea": ["string"],
  "pricePerHour": number,
  "bookingStartInterval": "string",
  "pricingOptions": [...],
  "availability": {...},
  "photos": ["string"]
}
```

### Booking Requests

**Create Booking Request**
```
POST /api/booking-requests
{
  "serviceId": "string",
  "pricingOptionId": "string?",
  "bookingStart": "ISO 8601 datetime",
  "bookingEnd": "ISO 8601 datetime",
  "notes": "string?",
  "billingDetails": {
    "name": "string",
    "address": {...}
  }
}
```

**Complete Payment Method**
```
POST /api/booking-requests/:id/complete-payment-method
{
  "setupIntentId": "string"
}
```

For detailed backend integration guide, see [CHECKOUT_INTEGRATION.md](./CHECKOUT_INTEGRATION.md)

## Testing the Flow

### As a Client
1. Go to homepage
2. Click "Sign up" in navbar
3. Sign up as a client
4. Search for services
5. Browse results and click on a service
6. On service details page:
   - Select a date
   - Select a time
   - Choose a pricing package (if available)
   - Click "Select & Request"
7. On checkout page:
   - Fill in billing details
   - Enter test card: `4242 4242 4242 4242`
   - Use any future expiry, any CVC, any ZIP
   - Click "Submit Availability Request"
8. See success confirmation

### As a Vendor
1. Log in with vendor credentials
2. Click "Add New Service" in navbar
3. Complete all four steps:
   - Fill in service details
   - Set pricing
   - Configure availability schedule
   - Upload photos
4. Submit to create service

### Access Control
- Non-authenticated users trying to add services are redirected to auth page
- Clients trying to add services see a friendly "Vendor access required" message
- Only vendors can access `/add-service/*` routes

## Important Notes

### Role-Based Rules
- **Sign up is CLIENT-ONLY** - Vendors must use "Apply as Vendor"
- **Log in is generic** - Backend returns role ("vendor" or "client")
- **Add Service routes are VENDOR-ONLY** - Protected by VendorGuard component

### State Management
- Auth state persisted in localStorage
- Add Service draft auto-saved to localStorage (survives page refresh)
- Token automatically attached to API requests via axios interceptor

### Stripe Integration
- Uses SetupIntent for secure card collection (no immediate charge)
- Currently uses mock API responses for frontend testing
- To integrate with backend:
  1. Implement backend endpoints as documented in `CHECKOUT_INTEGRATION.md`
  2. Uncomment API calls in `src/services/bookingRequests.ts`
  3. Add your Stripe publishable key to `.env`

### Photo Upload
Currently implemented with client-side file handling. In production:
- Implement backend photo upload endpoint
- Upload photos before creating service
- Store returned URLs in `uploadedPhotoUrls`

## Future Enhancements

- Photo upload API integration
- Date-based availability filtering
- Price range filtering in search
- Vendor dashboard with booking management
- Client dashboard with booking history
- Reviews and ratings
- Vendor booking confirmation flow
- Apple Pay / Google Pay support
- Saved payment methods
- Promotional codes
- Split payments
- Recurring bookings

## License

MIT
