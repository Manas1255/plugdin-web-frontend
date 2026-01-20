import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Stepper, VendorGuard, Loading } from '../components';
import { useAddServiceDraft } from '../context/AddServiceDraftContext';
import { servicesService } from '../services/services';
import { mapDraftToCreateServicePayload } from '../utils/mappers';
import type { City } from '../types';
import './AddServiceLayout.css';
import './AddServicePhotosPage.css';

const MAX_PHOTOS = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const AddServicePhotosPage = () => {
  const navigate = useNavigate();
  const { draft, updateDraft, clearDraft, isDetailsComplete, isPricingComplete } = useAddServiceDraft();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState<City[]>([]);

  useState(() => {
    // Load cities for mapping
    servicesService.getAllCities().then(res => {
      setCities(res.data.cities);
    });
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).slice(0, MAX_PHOTOS - draft.photos.length);
    
    for (const file of newPhotos) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`File ${file.name} is not a valid image type. Only JPG and PNG are allowed.`);
        continue;
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 20MB.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      updateDraft({
        photos: [...draft.photos, { file, previewUrl }],
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    const photo = draft.photos[index];
    URL.revokeObjectURL(photo.previewUrl); // Clean up object URL
    
    updateDraft({
      photos: draft.photos.filter((_, i) => i !== index),
    });
  };

  const handleCreateService = async () => {
    setError('');
    
    if (draft.photos.length === 0) {
      const confirm = window.confirm('You have not added any photos. Do you want to proceed without photos?');
      if (!confirm) return;
    }

    setSubmitting(true);

    try {
      // For now, we'll create the service without photos upload
      // In a real implementation, you'd upload photos first and get URLs
      // Or use multipart/form-data to send everything at once
      
      const payload = mapDraftToCreateServicePayload(draft, cities);
      
      // If there are photos, we should upload them first
      // For this MVP, we'll skip the upload and just create the service
      // You can implement photo upload endpoint separately
      
      const response = await servicesService.createService(payload);
      
      if (response.error) {
        setError(response.error.message);
        return;
      }

      // Success!
      alert('Service created successfully!');
      clearDraft();
      navigate('/');
      
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 'details', label: 'Details', path: '/add-service/details', disabled: false },
    { id: 'pricing', label: 'Pricing', path: '/add-service/pricing', disabled: !isDetailsComplete() },
    { id: 'availability', label: 'Availability', path: '/add-service/availability', disabled: !isPricingComplete() },
    { id: 'photos', label: 'Photos', path: '/add-service/photos', disabled: false },
  ];

  return (
    <VendorGuard>
      <div className="add-service-page">
        <Navbar />
        
        <div className="add-service-container">
          <Stepper steps={steps} />
          
          <div className="add-service-content">
            <h1 className="page-title">Photos</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="form-section">
              <h2 className="section-title">Service Photos</h2>
              <p className="section-description">
                Upload 2–3 high-quality photos to showcase your service. You can add up to {MAX_PHOTOS} photos.
              </p>

              <div
                className="upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">📸</div>
                <p className="upload-text">Click to upload photos</p>
                <p className="upload-hint">JPG or PNG, max 20MB each</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {draft.photos.length > 0 && (
                <div className="photos-grid">
                  {draft.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={photo.previewUrl} alt={`Preview ${index + 1}`} />
                      <button
                        className="photo-remove"
                        onClick={() => handleRemovePhoto(index)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="photo-count">
                {draft.photos.length} / {MAX_PHOTOS} photos uploaded
              </p>
            </div>

            <div className="form-section">
              <h2 className="section-title">Review</h2>
              <div className="review-card">
                <div className="review-item">
                  <span className="review-label">Listing Type:</span>
                  <span className="review-value">{draft.listingType}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Category:</span>
                  <span className="review-value">{draft.categoryName}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Title:</span>
                  <span className="review-value">{draft.title}</span>
                </div>
                {draft.pricePerHour && (
                  <div className="review-item">
                    <span className="review-label">Price per Hour:</span>
                    <span className="review-value">${draft.pricePerHour}</span>
                  </div>
                )}
                {draft.pricingOptions.length > 0 && (
                  <div className="review-item">
                    <span className="review-label">Pricing Options:</span>
                    <span className="review-value">{draft.pricingOptions.length} package(s)</span>
                  </div>
                )}
                <div className="review-item">
                  <span className="review-label">Cities:</span>
                  <span className="review-value">{draft.selectedCityIds.length} selected</span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/add-service/availability')}
                disabled={submitting}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateService}
                disabled={submitting}
              >
                {submitting ? 'Creating Service...' : 'Create Service'}
              </button>
            </div>

            {submitting && <Loading message="Creating your service..." />}
          </div>
        </div>
      </div>
    </VendorGuard>
  );
};
