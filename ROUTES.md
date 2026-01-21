# Application Routes

## Public Routes

### `/` - Homepage
**Status:** ✅ Fully Implemented  
**Features:**
- Hero section with gradient background
- Search box (category + listing type filters)
- Features showcase section
- Responsive navigation bar

### `/auth` - Authentication
**Status:** ✅ Fully Implemented  
**Features:**
- Tabbed interface (Sign up / Log in)
- Client-only signup with locked user type
- Generic login with role detection
- Terms acceptance checkbox
- Redirect handling after auth
- Form validation and error display

### `/search` - Search Results
**Status:** ✅ Fully Implemented  
**Features:**
- Left sidebar with filters (category, dates, price, cities)
- Service cards grid (4-column responsive)
- Sort controls
- Pagination
- Results count
- Empty state handling

---

## Vendor-Only Routes
*Protected by VendorGuard - requires authentication and vendor role*

### `/add-service/details` - Service Details
**Status:** ✅ Fully Implemented  
**Features:**
- Listing type selection (hourly/fixed)
- Category dropdown (from API)
- Title and description inputs
- Dynamic package specifications (based on category)
- Cities multi-select with scrollable list
- Form validation
- Next button (navigates to pricing)

### `/add-service/pricing` - Pricing Configuration
**Status:** ✅ Fully Implemented  
**Features:**
- Hourly rate input (for hourly listings)
- Booking start interval selector
- Pricing options manager (add/remove packages)
- Session length configuration
- Validation based on listing type
- Back/Next navigation

### `/add-service/availability` - Availability Schedule
**Status:** ✅ Fully Implemented  
**Features:**
- Modal for editing schedule
- Timezone selector (11 common zones)
- Day-by-day configuration
- Multiple time slots per day
- Add/remove slots
- Time validation
- Weekly calendar preview
- Visual status indicators

### `/add-service/photos` - Photos Upload
**Status:** ✅ Fully Implemented  
**Features:**
- Click-to-upload interface
- File type validation (.jpg, .png)
- File size validation (20MB max)
- Preview thumbnails grid
- Remove photo button
- Photo count indicator (max 10)
- Review summary card
- Create service submission

---

## Placeholder Routes

### `/apply-as-vendor` - Vendor Application
**Status:** 🔶 Placeholder  
**Description:** "Vendor application coming soon..."

### `/brand-home` - Brand Portal
**Status:** 🔶 Placeholder  
**Description:** "Brand portal coming soon..."

### `/creator-vendor-onboarding` - Creator Onboarding
**Status:** 🔶 Placeholder  
**Description:** "Complete onboarding coming soon..."

### `*` (404) - Not Found
**Status:** 🔶 Placeholder  
**Description:** "404 - Page Not Found"

---

## Route Navigation Flow

```
Homepage (/)
  ├─> Auth (/auth)
  │   └─> After Login → Homepage or Redirect URL
  │
  ├─> Search (/search?category=...&listingType=...)
  │
  └─> Add Service (requires vendor role)
      ├─> Details (/add-service/details)
      ├─> Pricing (/add-service/pricing)
      ├─> Availability (/add-service/availability)
      ├─> Photos (/add-service/photos)
      └─> Success → Homepage
```

---

## Access Control Matrix

| Route | Guest | Client | Vendor |
|-------|-------|--------|--------|
| `/` | ✅ | ✅ | ✅ |
| `/auth` | ✅ | ✅ | ✅ |
| `/search` | ✅ | ✅ | ✅ |
| `/add-service/*` | ❌ Redirect to auth | ❌ Blocked with message | ✅ Full access |
| Placeholder pages | ✅ | ✅ | ✅ |

---

## Routing Implementation Details

### Router Setup
- **Library:** React Router v6
- **Mode:** BrowserRouter (uses HTML5 History API)
- **Providers:** Wrapped in AuthProvider and AddServiceDraftProvider

### Protected Routes
- **VendorGuard Component:** Wraps vendor-only routes
  - Checks authentication status
  - Checks user role
  - Shows friendly blocked message for non-vendors
  - Redirects to auth if not logged in

### Query Parameters
- `/auth?redirect=...` - Redirect URL after successful auth
- `/search?category=...&listingType=...&page=...` - Search filters

### State Persistence
- Auth state → localStorage (key: `user`, `token`)
- Add Service draft → localStorage (key: `addServiceDraft`)
- Both restore on page refresh

---

## Navigation Components

### Navbar
**Behavior based on auth state:**

**Guest (not logged in):**
- Show "Sign up" and "Log in" buttons
- "Add New Service" → redirects to `/auth?redirect=/add-service/details`

**Client (logged in):**
- Show user name, role, and "Logout" button
- "Add New Service" → shows blocked message

**Vendor (logged in):**
- Show user name, role, and "Logout" button
- "Add New Service" → navigates to `/add-service/details`

### Stepper
**Shows in Add Service flow:**
- Details (always enabled)
- Pricing (enabled after details complete)
- Availability (enabled after pricing complete)
- Photos (enabled after availability complete)

---

## Future Routes (Not Implemented)

Potential additions for future iterations:
- `/services/:id` - Service detail page
- `/vendor/dashboard` - Vendor dashboard
- `/client/dashboard` - Client dashboard
- `/booking/:serviceId` - Booking flow
- `/profile` - User profile
- `/services/:id/reviews` - Reviews page
- `/favorites` - Saved services
- `/orders` - Order history

---

**All MVP routes are fully functional and tested! ✅**
