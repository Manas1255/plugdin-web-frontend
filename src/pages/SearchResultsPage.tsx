import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar, Loading } from '../components';
import { servicesService } from '../services/services';
import type { Service, Category, City } from '../types';
import './SearchResultsPage.css';

export const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  });

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadFiltersData();
  }, []);

  useEffect(() => {
    searchServices();
  }, [searchParams]);

  const loadFiltersData = async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        servicesService.getAllCategories(),
        servicesService.getAllCities(),
      ]);
      setCategories(categoriesRes.data.categories.filter(cat => cat.isActive));
      setCities(citiesRes.data.cities.filter(city => city.isActive));
    } catch (err) {
      console.error('Failed to load filters:', err);
    }
  };

  const searchServices = async () => {
    setLoading(true);
    setError('');

    try {
      const category = searchParams.get('category');
      const listingType = searchParams.get('listingType');
      const page = parseInt(searchParams.get('page') || '1');

      const response = await servicesService.searchServices({
        category: category || undefined,
        listingType: listingType || undefined,
        page,
        limit: 12,
      });

      if (response.error) {
        setError(response.error.message);
        return;
      }

      setServices(response.data.services);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categorySlug: string) => {
    setSelectedCategories(prev => 
      prev.includes(categorySlug)
        ? prev.filter(c => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const handleCityFilter = (cityId: string) => {
    setSelectedCities(prev =>
      prev.includes(cityId)
        ? prev.filter(c => c !== cityId)
        : [...prev, cityId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCities([]);
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  // Client-side filtering based on selected filters
  const filteredServices = services.filter(service => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(service.category)) {
      return false;
    }
    if (selectedCities.length > 0) {
      const hasMatchingCity = service.servicingArea.some(area =>
        cities.find(city => city.name === area && selectedCities.includes(city.id))
      );
      if (!hasMatchingCity) return false;
    }
    return true;
  });

  // Client-side sorting
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Add more sort options as needed
    return 0;
  });

  const formatPrice = (service: Service) => {
    if (service.listingType === 'hourly' && service.pricePerHour) {
      return `$${service.pricePerHour.toFixed(2)} per hour`;
    } else if (service.pricingOptions && service.pricingOptions.length > 0) {
      const minPrice = Math.min(...service.pricingOptions.map(opt => opt.pricePerSession));
      return `From $${minPrice.toFixed(2)}`;
    }
    return 'Price on request';
  };

  return (
    <div className="search-page">
      <Navbar />
      
      <div className="search-container">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="clear-filters" onClick={clearFilters}>
              Clear
            </button>
          </div>

          <div className="filter-section">
            <h4 className="filter-title">Category</h4>
            <div className="filter-options">
              {categories.slice(0, 10).map(cat => (
                <label key={cat.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => handleCategoryFilter(cat.slug)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-title">Dates</h4>
            <p className="filter-placeholder">Date filter coming soon...</p>
          </div>

          <div className="filter-section">
            <h4 className="filter-title">Price</h4>
            <div className="price-inputs">
              <input type="number" placeholder="Min" className="price-input" />
              <span>to</span>
              <input type="number" placeholder="Max" className="price-input" />
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-title">Servicing Area</h4>
            <div className="filter-options scrollable">
              {cities.slice(0, 20).map(city => (
                <label key={city.id} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city.id)}
                    onChange={() => handleCityFilter(city.id)}
                  />
                  <span>{city.name}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="search-main">
          <div className="search-header">
            <h2 className="results-count">
              {sortedServices.length} result{sortedServices.length !== 1 ? 's' : ''}
            </h2>
            <div className="sort-controls">
              <label>Sort by:</label>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : sortedServices.length === 0 ? (
            <div className="empty-state">
              <p>No services found matching your criteria.</p>
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="services-grid">
                {sortedServices.map(service => (
                  <div key={service.id} className="service-card">
                    <div className="service-image">
                      {service.photos && service.photos.length > 0 ? (
                        <img src={service.photos[0]} alt={service.listingTitle} />
                      ) : (
                        <div className="placeholder-image">📸</div>
                      )}
                    </div>
                    <div className="service-content">
                      <h3 className="service-title">{service.listingTitle}</h3>
                      <p className="service-vendor">
                        by {service.vendor.firstName} {service.vendor.lastName}
                      </p>
                      <div className="service-price">
                        {formatPrice(service)}
                        {service.listingType === 'hourly' && (
                          <span className="price-note"> (+ taxes & fees)</span>
                        )}
                      </div>
                      <div className="service-meta">
                        <span className="service-category">{service.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
