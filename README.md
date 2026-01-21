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
- **Role-Based Access**: Vendors-only routes with friendly access control

## Tech Stack

- React 19
- TypeScript
- React Router
- Axios for API calls
- CSS Modules for styling

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Update the URL to match your backend API endpoint.

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
│   ├── AddServiceDetailsPage.tsx
│   ├── AddServicePricingPage.tsx
│   ├── AddServiceAvailabilityPage.tsx
│   ├── AddServicePhotosPage.tsx
│   └── PlaceholderPage.tsx
├── services/               # API service layer
│   ├── apiClient.ts
│   ├── auth.ts
│   └── services.ts
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

## Testing the Flow

### As a Client
1. Go to homepage
2. Click "Sign up" in navbar
3. Sign up as a client
4. Search for services
5. Browse results

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

### Photo Upload
Currently implemented with client-side file handling. In production:
- Implement backend photo upload endpoint
- Upload photos before creating service
- Store returned URLs in `uploadedPhotoUrls`

## Future Enhancements

- Photo upload API integration
- Date-based availability filtering
- Price range filtering in search
- Service detail pages
- Booking flow
- Vendor dashboard
- Client dashboard
- Reviews and ratings
- Payment integration

## License

MIT
