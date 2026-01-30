import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar, Loading } from '../components';
import { servicesService } from '../services/services';
import type { Service, VendorServicesPagination } from '../types';
import './VendorProfilePage.css';

const PLACEHOLDER_AVATAR = 'https://via.placeholder.com/400x400/e2e8f0/64748b?text=Photo';

type VendorInfo = {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
};

export const VendorProfilePage = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const listingsScrollRef = useRef<HTMLDivElement>(null);

  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<VendorServicesPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentPage = pagination?.currentPage ?? 1;
  const totalPages = pagination?.totalPages ?? 0;
  const totalItems = pagination?.totalItems ?? 0;

  useEffect(() => {
    if (!vendorId) {
      setError('Vendor not found');
      setLoading(false);
      return;
    }
    loadVendorServices(vendorId, 1);
  }, [vendorId]);

  const loadVendorServices = async (id: string, page: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await servicesService.getServicesByVendorId(id, page, 10);
      if (response.error) {
        setError(response.error.message || 'Failed to load vendor');
        return;
      }
      const list = response.data.services;
      setServices(list);
      setPagination(response.data.pagination);
      if (list.length > 0 && list[0].vendor) {
        const v = list[0].vendor;
        setVendor({
          id: v.id ?? id,
          firstName: v.firstName,
          lastName: v.lastName,
          profilePicture: v.profilePicture ?? null,
        });
      } else {
        setVendor(null);
      }
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
        : null;
      setError(message || 'Failed to load vendor profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!vendorId || newPage < 1 || newPage > totalPages) return;
    loadVendorServices(vendorId, newPage);
  };

  const scrollListings = (direction: 'left' | 'right') => {
    const el = listingsScrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  const formatPrice = (service: Service) => {
    if (service.listingType === 'hourly' && service.pricePerHour != null) {
      return `$${service.pricePerHour.toFixed(2)} per hour`;
    }
    if (service.pricingOptions && service.pricingOptions.length > 0) {
      const minPrice = Math.min(...service.pricingOptions.map((opt) => opt.pricePerSession));
      return `From $${minPrice.toFixed(2)}`;
    }
    return 'Price on request';
  };

  if (!vendorId) {
    return (
      <div className="vendor-profile-page">
        <Navbar />
        <div className="vendor-profile-container">
          <div className="vendor-profile-error">
            <h2>Vendor not found</h2>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && services.length === 0) {
    return (
      <div className="vendor-profile-page">
        <Navbar />
        <div className="vendor-profile-loading">
          <Loading />
        </div>
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="vendor-profile-page">
        <Navbar />
        <div className="vendor-profile-container">
          <div className="vendor-profile-error">
            <h2>{error}</h2>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = vendor
    ? `${vendor.firstName} ${vendor.lastName}`
    : 'Vendor';

  return (
    <div className="vendor-profile-page">
      <Navbar />
      <div className="vendor-profile-container">
        <header className="vendor-profile-header">
          <div className="vendor-profile-avatar-wrap">
            <img
              src={vendor?.profilePicture || PLACEHOLDER_AVATAR}
              alt={displayName}
              className="vendor-profile-avatar"
            />
          </div>
          <div className="vendor-profile-info">
            <h1 className="vendor-profile-name">{displayName}</h1>
            {/* Bio and website can be added when/if the API provides them */}
          </div>
        </header>

        <section className="vendor-listings-section">
          <div className="vendor-listings-header">
            <h2 className="vendor-listings-title">My listings ({totalItems})</h2>
            {totalPages > 1 && (
              <div className="vendor-listings-pagination">
                <button
                  type="button"
                  className="vendor-listings-page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination?.hasPrevPage}
                  aria-label="Previous page"
                >
                  ‹ Previous
                </button>
                <span className="vendor-listings-page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="vendor-listings-page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination?.hasNextPage}
                  aria-label="Next page"
                >
                  Next ›
                </button>
              </div>
            )}
          </div>

          {services.length === 0 ? (
            <p className="vendor-listings-empty">No listings yet.</p>
          ) : (
            <div className="vendor-listings-wrapper">
              <button
                type="button"
                className="vendor-listings-nav vendor-listings-nav-left"
                onClick={() => scrollListings('left')}
                aria-label="Scroll listings left"
              >
                ‹
              </button>
              <div className="vendor-listings-scroll" ref={listingsScrollRef}>
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="vendor-listing-card"
                    onClick={() => navigate(`/services/${service.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/services/${service.id}`);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="vendor-listing-image">
                      {service.photos && service.photos.length > 0 ? (
                        <img src={service.photos[0]} alt={service.listingTitle} />
                      ) : (
                        <div className="vendor-listing-placeholder">📸</div>
                      )}
                    </div>
                    <div className="vendor-listing-content">
                      <h3 className="vendor-listing-title">{service.listingTitle}</h3>
                      <p className="vendor-listing-price">
                        {formatPrice(service)}
                        {service.listingType === 'hourly' && (
                          <span className="vendor-listing-price-note"> (+ taxes & fees)</span>
                        )}
                      </p>
                      <p className="vendor-listing-desc">
                        {service.listingDescription || service.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="vendor-listings-nav vendor-listings-nav-right"
                onClick={() => scrollListings('right')}
                aria-label="Scroll listings right"
              >
                ›
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
