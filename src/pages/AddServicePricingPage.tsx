import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Stepper, VendorGuard } from '../components';
import { useAddServiceDraft } from '../context/AddServiceDraftContext';
import type { PricingOption } from '../types';
import './AddServiceLayout.css';
import './AddServicePricingPage.css';

export const AddServicePricingPage = () => {
  const navigate = useNavigate();
  const { draft, updateDraft, isDetailsComplete, isPricingComplete } = useAddServiceDraft();
  
  const [newOption, setNewOption] = useState<PricingOption>({
    name: '',
    pricePerSession: 0,
    sessionLength: { hours: 0, minutes: 0 },
  });

  const handleAddOption = () => {
    if (!newOption.name.trim() || newOption.pricePerSession <= 0) {
      alert('Please fill in option name and price');
      return;
    }
    if (newOption.sessionLength.hours === 0 && newOption.sessionLength.minutes === 0) {
      alert('Please set session length');
      return;
    }

    updateDraft({
      pricingOptions: [...draft.pricingOptions, newOption],
    });

    // Reset form
    setNewOption({
      name: '',
      pricePerSession: 0,
      sessionLength: { hours: 0, minutes: 0 },
    });
  };

  const handleRemoveOption = (index: number) => {
    updateDraft({
      pricingOptions: draft.pricingOptions.filter((_, i) => i !== index),
    });
  };

  const handleNext = () => {
    if (!isPricingComplete()) {
      alert('Please complete all required pricing fields');
      return;
    }
    navigate('/add-service/availability');
  };

  const steps = [
    { id: 'details', label: 'Details', path: '/add-service/details', disabled: false },
    { id: 'pricing', label: 'Pricing', path: '/add-service/pricing', disabled: !isDetailsComplete() },
    { id: 'availability', label: 'Availability', path: '/add-service/availability', disabled: !isPricingComplete() },
    { id: 'photos', label: 'Photos', path: '/add-service/photos', disabled: true },
  ];

  return (
    <VendorGuard>
      <div className="add-service-page">
        <Navbar />
        
        <div className="add-service-container">
          <Stepper steps={steps} />
          
          <div className="add-service-content">
            <h1 className="page-title">Pricing</h1>

            {draft.listingType === 'hourly' && (
              <div className="form-section">
                <h2 className="section-title">Hourly Rate</h2>
                
                <div className="form-group">
                  <label className="label">Price per Hour * ($)</label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={draft.pricePerHour || ''}
                    onChange={(e) => updateDraft({ pricePerHour: parseFloat(e.target.value) || null })}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Booking Start Interval</label>
                  <select
                    className="input"
                    value={draft.bookingStartInterval}
                    onChange={(e) => updateDraft({ bookingStartInterval: e.target.value as any })}
                  >
                    <option value="every_hour">Every Hour</option>
                    <option value="every_30_minutes">Every 30 Minutes</option>
                    <option value="every_15_minutes">Every 15 Minutes</option>
                  </select>
                </div>
              </div>
            )}

            {draft.listingType === 'fixed' && (
              <div className="form-section">
                <h2 className="section-title">Fixed Price Packages</h2>
                <p className="section-description">
                  Add at least one pricing package for your service
                </p>
              </div>
            )}

            <div className="form-section">
              <h2 className="section-title">Pricing Options (Optional for Hourly, Required for Fixed)</h2>
              <p className="section-description">
                Add package options with different session lengths and prices
              </p>

              {draft.pricingOptions.length > 0 && (
                <div className="pricing-options-list">
                  {draft.pricingOptions.map((option, index) => (
                    <div key={index} className="pricing-option-item">
                      <div className="pricing-option-info">
                        <h4>{option.name}</h4>
                        <p>
                          ${option.pricePerSession.toFixed(2)} - 
                          {option.sessionLength.hours > 0 && ` ${option.sessionLength.hours}h`}
                          {option.sessionLength.minutes > 0 && ` ${option.sessionLength.minutes}m`}
                        </p>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveOption(index)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-option-form">
                <h3>Add Package Option</h3>
                
                <div className="form-group">
                  <label className="label">Package Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Basic Package, Premium Package"
                    value={newOption.name}
                    onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Price per Session ($)</label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newOption.pricePerSession || ''}
                    onChange={(e) => setNewOption({ 
                      ...newOption, 
                      pricePerSession: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Session Hours</label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      placeholder="0"
                      value={newOption.sessionLength.hours || ''}
                      onChange={(e) => setNewOption({
                        ...newOption,
                        sessionLength: {
                          ...newOption.sessionLength,
                          hours: parseInt(e.target.value) || 0,
                        },
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Session Minutes</label>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={newOption.sessionLength.minutes || ''}
                      onChange={(e) => setNewOption({
                        ...newOption,
                        sessionLength: {
                          ...newOption.sessionLength,
                          minutes: parseInt(e.target.value) || 0,
                        },
                      })}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddOption}
                >
                  Add Package Option
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => navigate('/add-service/details')}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!isPricingComplete()}
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
