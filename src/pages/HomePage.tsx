import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components';
import { servicesService } from '../services/services';
import type { Category } from '../types';
import './HomePage.css';

export const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [listingType, setListingType] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await servicesService.getAllCategories();
      setCategories(response.data.categories.filter(cat => cat.isActive));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
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

      <div className="features-section">
        <div className="container">
          <h2 className="features-title">Why Choose Plugdin?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Easy Search</h3>
              <p>Find the perfect vendor for your needs with our powerful search</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Verified Vendors</h3>
              <p>All vendors are verified professionals with proven track records</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Transparent Pricing</h3>
              <p>Clear, upfront pricing with no hidden fees</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Easy Booking</h3>
              <p>Book services quickly with our streamlined booking process</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
