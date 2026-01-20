import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Stepper, Loading, VendorGuard } from '../components';
import { useAddServiceDraft } from '../context/AddServiceDraftContext';
import { servicesService } from '../services/services';
import type { Category, City } from '../types';
import './AddServiceLayout.css';

export const AddServiceDetailsPage = () => {
  const navigate = useNavigate();
  const { draft, updateDraft, isDetailsComplete } = useAddServiceDraft();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [specifications, setSpecifications] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (draft.categorySlug) {
      loadSpecifications(draft.categorySlug);
    }
  }, [draft.categorySlug]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        servicesService.getAllCategories(),
        servicesService.getAllCities(),
      ]);

      setCategories(categoriesRes.data.categories.filter(cat => cat.isActive));
      setCities(citiesRes.data.cities.filter(city => city.isActive));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecifications = async (categorySlug: string) => {
    setLoadingSpecs(true);
    try {
      const response = await servicesService.getCategorySpecifications(categorySlug);
      setSpecifications(response.data.packageSpecifications);
    } catch (err: any) {
      console.error('Failed to load specifications:', err);
      setSpecifications([]);
    } finally {
      setLoadingSpecs(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      updateDraft({
        categoryId: category.id,
        categorySlug: category.slug,
        categoryName: category.name,
        selectedSpecifications: [], // Reset specifications
      });
    }
  };

  const handleSpecificationToggle = (spec: string) => {
    const isSelected = draft.selectedSpecifications.includes(spec);
    const newSpecs = isSelected
      ? draft.selectedSpecifications.filter(s => s !== spec)
      : [...draft.selectedSpecifications, spec];
    updateDraft({ selectedSpecifications: newSpecs });
  };

  const handleCityToggle = (cityId: string) => {
    const isSelected = draft.selectedCityIds.includes(cityId);
    const newCities = isSelected
      ? draft.selectedCityIds.filter(id => id !== cityId)
      : [...draft.selectedCityIds, cityId];
    updateDraft({ selectedCityIds: newCities });
  };

  const handleNext = () => {
    if (!isDetailsComplete()) {
      alert('Please fill in all required fields');
      return;
    }
    navigate('/add-service/pricing');
  };

  const steps = [
    { id: 'details', label: 'Details', path: '/add-service/details', disabled: false },
    { id: 'pricing', label: 'Pricing', path: '/add-service/pricing', disabled: !isDetailsComplete() },
    { id: 'availability', label: 'Availability', path: '/add-service/availability', disabled: true },
    { id: 'photos', label: 'Photos', path: '/add-service/photos', disabled: true },
  ];

  if (loading) {
    return (
      <VendorGuard>
        <div><Navbar /><Loading /></div>
      </VendorGuard>
    );
  }

  return (
    <VendorGuard>
      <div className="add-service-page">
        <Navbar />
        
        <div className="add-service-container">
          <Stepper steps={steps} />
          
          <div className="add-service-content">
            <h1 className="page-title">Service Details</h1>
            
            {error && <div className="error-message">{error}</div>}

            <div className="form-section">
              <h2 className="section-title">Basic Information</h2>
              
              <div className="form-group">
                <label className="label">Listing Type *</label>
                <select
                  className="input"
                  value={draft.listingType || ''}
                  onChange={(e) => updateDraft({ listingType: e.target.value as any })}
                >
                  <option value="">Select type</option>
                  <option value="hourly">Hourly</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Category *</label>
                <select
                  className="input"
                  value={draft.categoryId || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Listing Title *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Professional Wedding Photography"
                  value={draft.title}
                  onChange={(e) => updateDraft({ title: e.target.value })}
                />
                {draft.title.trim() === '' && (
                  <p className="error-text">You need to add a title.</p>
                )}
              </div>

              <div className="form-group">
                <label className="label">Listing Description *</label>
                <textarea
                  className="input textarea"
                  rows={5}
                  placeholder="Describe your service in detail..."
                  value={draft.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                />
                {draft.description.trim() === '' && (
                  <p className="error-text">You need to add a description.</p>
                )}
              </div>
            </div>

            {draft.categorySlug && (
              <div className="form-section">
                <h2 className="section-title">Package Specifications</h2>
                {loadingSpecs ? (
                  <Loading message="Loading specifications..." />
                ) : specifications.length > 0 ? (
                  <div className="checkbox-list">
                    {specifications.map((spec) => (
                      <label key={spec} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={draft.selectedSpecifications.includes(spec)}
                          onChange={() => handleSpecificationToggle(spec)}
                        />
                        <span>{spec}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No specifications available for this category.</p>
                )}
              </div>
            )}

            <div className="form-section">
              <h2 className="section-title">Servicing Area / Cities *</h2>
              <p className="section-description">Select all cities where you can provide this service</p>
              {cities.length > 0 ? (
                <div className="checkbox-list scrollable">
                  {cities.map((city) => (
                    <label key={city.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={draft.selectedCityIds.includes(city.id)}
                        onChange={() => handleCityToggle(city.id)}
                      />
                      <span>{city.name}, {city.province}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <Loading message="Loading cities..." />
              )}
              {draft.selectedCityIds.length === 0 && (
                <p className="error-text">Please select at least one city.</p>
              )}
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!isDetailsComplete()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </VendorGuard>
  );
};
