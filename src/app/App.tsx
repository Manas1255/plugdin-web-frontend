import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AddServiceDraftProvider } from '../context/AddServiceDraftContext';
import {
  HomePage,
  AuthPage,
  AddServiceDetailsPage,
  AddServicePricingPage,
  AddServiceAvailabilityPage,
  AddServicePhotosPage,
  SearchResultsPage,
  PlaceholderPage,
} from '../pages';
import '../styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AddServiceDraftProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            
            {/* Placeholder Routes */}
            <Route
              path="/apply-as-vendor"
              element={
                <PlaceholderPage
                  title="Apply as a Vendor"
                  description="Vendor application coming soon. We'll review your application and get back to you within 2-3 business days."
                />
              }
            />
            <Route
              path="/brand-home"
              element={
                <PlaceholderPage
                  title="Brand Home"
                  description="Brand portal coming soon. Manage your brand presence and partnerships."
                />
              }
            />
            <Route
              path="/creator-vendor-onboarding"
              element={
                <PlaceholderPage
                  title="Creator Vendor Onboarding"
                  description="Complete onboarding coming soon. Start your journey as a creator vendor."
                />
              }
            />

            {/* Add Service Flow (Vendor Only) */}
            <Route path="/add-service/details" element={<AddServiceDetailsPage />} />
            <Route path="/add-service/pricing" element={<AddServicePricingPage />} />
            <Route path="/add-service/availability" element={<AddServiceAvailabilityPage />} />
            <Route path="/add-service/photos" element={<AddServicePhotosPage />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <PlaceholderPage
                  title="404 - Page Not Found"
                  description="The page you're looking for doesn't exist."
                />
              }
            />
          </Routes>
        </AddServiceDraftProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
