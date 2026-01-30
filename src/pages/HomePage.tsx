import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components';
import { servicesService } from '../services/services';
import { vendorsService } from '../services/vendors';
import type { Category, Vendor } from '../types';
import './HomePage.css';

const PLACEHOLDER_AVATAR = 'https://via.placeholder.com/400x400/e2e8f0/64748b?text=Photo';

export const HomePage = () => {
  const navigate = useNavigate();
  const vendorsScrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [listingType, setListingType] = useState<string>('');

  useEffect(() => {
    loadCategories();
    loadVendors();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await servicesService.getAllCategories();
      setCategories(response.data.categories.filter(cat => cat.isActive));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await vendorsService.getVendors({ page: 1, limit: 10 });
      setVendors(response.data.vendors);
    } catch (error) {
      console.error('Failed to load vendors:', error);
    }
  };

  const scrollVendors = (direction: 'left' | 'right') => {
    const el = vendorsScrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (listingType) params.set('listingType', listingType);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home-page">
      <Navbar />
      
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Find the Perfect Service for Your Event</h1>
          <p className="hero-subtitle">
            Connect with professional vendors for photography, videography, catering, and more
          </p>

          <div className="search-box">
            <div className="search-fields">
              <div className="search-field">
                <label className="search-label">Category</label>
                <select
                  className="search-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label className="search-label">Listing Type</label>
                <select
                  className="search-select"
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                >
                  <option value="">Any Type</option>
                  <option value="hourly">Hourly</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary search-button" onClick={handleSearch}>
              Search Services
            </button>
          </div>
        </div>
      </div>

      {vendors.length > 0 && (
        <div className="featured-vendors-section">
          <div className="container featured-vendors-container">
            <h2 className="featured-vendors-title">Featured Vendors</h2>
            <div className="featured-vendors-wrapper">
              <button
                type="button"
                className="featured-vendors-nav featured-vendors-nav-left"
                onClick={() => scrollVendors('left')}
                aria-label="Scroll left"
              >
                ‹
              </button>
              <div className="featured-vendors-carousel" ref={vendorsScrollRef}>
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="vendor-card">
                    <div className="vendor-card-image-wrap">
                      <img
                        src={vendor.profilePicture || PLACEHOLDER_AVATAR}
                        alt={`${vendor.firstName} ${vendor.lastName}`}
                        className="vendor-card-image"
                      />
                    </div>
                    <p className="vendor-card-name">
                      {vendor.firstName} {vendor.lastName}
                    </p>
                    <button
                      type="button"
                      className="vendor-card-book-btn"
                      onClick={() => navigate(`/vendor/${vendor.id}`)}
                    >
                      Book with {vendor.firstName}
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="featured-vendors-nav featured-vendors-nav-right"
                onClick={() => scrollVendors('right')}
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="features-section">
        <div className="container">
          <h2 className="features-title">Why Choose Plugdin?</h2>
          <div className="features-grid">
            {[
              { icon: '🔍', title: 'Easy Search', text: 'Find the perfect vendor for your needs with our powerful search' },
              { icon: '✅', title: 'Verified Vendors', text: 'All vendors are verified professionals with proven track records' },
              { icon: '💰', title: 'Transparent Pricing', text: 'Clear, upfront pricing with no hidden fees' },
              { icon: '📅', title: 'Easy Booking', text: 'Book services quickly with our streamlined booking process' },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card"
                style={{ '--stagger-index': index } as React.CSSProperties}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
