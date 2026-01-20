# Plugdin Frontend - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Configure Backend URL

Create a `.env` file in the project root:

```bash
echo "VITE_API_BASE_URL=http://localhost:3000" > .env
```

Replace `http://localhost:3000` with your backend API URL.

### 2. Start the Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### 3. Test the Application

Open your browser and navigate to the local URL displayed in the terminal.

---

## 📋 Routes Map

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Homepage with search | Public |
| `/auth` | Sign up / Log in | Public |
| `/search` | Search results | Public |
| `/add-service/details` | Add service - Details | Vendor only |
| `/add-service/pricing` | Add service - Pricing | Vendor only |
| `/add-service/availability` | Add service - Availability | Vendor only |
| `/add-service/photos` | Add service - Photos | Vendor only |
| `/apply-as-vendor` | Vendor application | Public (placeholder) |
| `/brand-home` | Brand portal | Public (placeholder) |
| `/creator-vendor-onboarding` | Creator onboarding | Public (placeholder) |

---

## 🧪 Quick Test Scenarios

### Test as Guest
1. Visit homepage
2. Search for services
3. View results

### Test as Client
1. Sign up from navbar
2. Try to add service → See access message
3. Browse services

### Test as Vendor
1. Log in with vendor credentials
2. Click "Add New Service"
3. Complete all 4 steps
4. Submit service

---

## 🔑 Key Features

✅ **Authentication**
- Combined sign up / log in page
- Role-based routing (client vs vendor)
- Token persistence

✅ **Add Service Flow (Vendors)**
- 4-step wizard with progress tracking
- Auto-save draft to localStorage
- Rich form controls and validation

✅ **Search & Browse**
- Category and type filters
- City/location filtering
- Responsive card layout

✅ **Professional UI**
- Modern design
- Fully responsive
- Loading states
- Error handling

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📡 Backend Requirements

Your backend API should implement these endpoints:

### Authentication
- `POST /api/auth/signup/client` - Sign up clients
- `POST /api/auth/login` - Log in any user

### Services
- `GET /api/services/categories/all` - Get categories
- `GET /api/services/categories/{slug}/specifications` - Get specs
- `GET /api/services/cities/all` - Get cities
- `POST /api/services/search` - Search services
- `POST /api/services` - Create service

All endpoints return responses in this format:
```json
{
  "statusCode": number,
  "data": { ... },
  "error": { "message": "...", ... } | null
}
```

---

## 🎯 What's Implemented

✅ Guest homepage with hero search  
✅ Auth flow (sign up/log in with role detection)  
✅ Add service flow (4 steps: details, pricing, availability, photos)  
✅ Search results page with filters  
✅ Vendor-only route protection  
✅ Data persistence across refreshes  
✅ Responsive design  
✅ TypeScript throughout  
✅ Production-ready build  

---

## 📚 Need More Details?

- **README.md** - Full project documentation
- **IMPLEMENTATION_SUMMARY.md** - Complete implementation details
- **src/** - Browse source code with inline comments

---

## 🐛 Troubleshooting

**Port already in use?**
- Vite will automatically try the next available port
- Or specify a port: `npm run dev -- --port 3001`

**Backend connection issues?**
- Check `.env` file has correct `VITE_API_BASE_URL`
- Ensure backend is running
- Check browser console for CORS errors

**Build errors?**
- Delete `node_modules` and run `npm install` again
- Ensure Node.js version is 16+

---

**Ready to build? Start coding! 🚀**
