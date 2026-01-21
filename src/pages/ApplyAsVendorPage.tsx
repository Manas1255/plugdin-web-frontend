import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components';
import { vendorApplicationsService } from '../services/vendorApplications';
import type { VendorApplicationPayload } from '../services/vendorApplications';
import './ApplyAsVendorPage.css';

type FormData = VendorApplicationPayload & {
  serviceTypeOther?: string;
  showPassword?: boolean;
};

export const ApplyAsVendorPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    bio: '',
    serviceType: '',
    serviceTypeOther: '',
    typicalResponseTimeToInquiries: '',
    bookingAdvanceAndComfortWithWindow: '',
    hasBackupEquipment: false,
    hasStandardServiceAgreement: false,
    instagramHandle: '',
    websiteOrPortfolioLink: '',
    additionalBusinessNotes: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'radio') {
      const boolValue = value === 'true';
      setFormData({ ...formData, [name]: boolValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getFieldError = (field: keyof FormData): string => {
    if (!touched[field]) return '';

    switch (field) {
      case 'firstName':
      case 'lastName':
      case 'companyName':
      case 'bio':
        return !formData[field] ? 'This field is required' : '';
      case 'email':
        if (!formData.email) return 'Email is required';
        if (!validateEmail(formData.email)) return 'Please enter a valid email';
        return '';
      case 'password':
        if (!formData.password) return 'Password is required';
        if (formData.password.length < 8) return 'Password must be at least 8 characters';
        return '';
      case 'serviceType':
        return !formData.serviceType ? 'Please select a service type' : '';
      case 'serviceTypeOther':
        return formData.serviceType === 'Other' && !formData.serviceTypeOther
          ? 'Please specify your service type'
          : '';
      case 'typicalResponseTimeToInquiries':
      case 'bookingAdvanceAndComfortWithWindow':
        return !formData[field] ? 'This field is required' : '';
      case 'websiteOrPortfolioLink':
        return formData.websiteOrPortfolioLink && !validateUrl(formData.websiteOrPortfolioLink)
          ? 'Please enter a valid URL'
          : '';
      default:
        return '';
    }
  };

  const isFormValid = (): boolean => {
    const requiredFields: (keyof FormData)[] = [
      'firstName',
      'lastName',
      'email',
      'password',
      'companyName',
      'bio',
      'serviceType',
      'typicalResponseTimeToInquiries',
      'bookingAdvanceAndComfortWithWindow',
    ];

    // Check if service type is "Other" and serviceTypeOther is required
    if (formData.serviceType === 'Other' && !formData.serviceTypeOther) {
      return false;
    }

    // Check required fields
    for (const field of requiredFields) {
      if (!formData[field]) return false;
    }

    // Validate email format
    if (!validateEmail(formData.email)) return false;

    // Validate password length
    if (formData.password.length < 8) return false;

    // Validate URL if provided
    if (formData.websiteOrPortfolioLink && !validateUrl(formData.websiteOrPortfolioLink)) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!isFormValid()) {
      setError('Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload
      const payload: VendorApplicationPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        bio: formData.bio,
        serviceType:
          formData.serviceType === 'Other' ? formData.serviceTypeOther || 'Other' : formData.serviceType,
        typicalResponseTimeToInquiries: formData.typicalResponseTimeToInquiries,
        bookingAdvanceAndComfortWithWindow: formData.bookingAdvanceAndComfortWithWindow,
        hasBackupEquipment: formData.hasBackupEquipment,
        hasStandardServiceAgreement: formData.hasStandardServiceAgreement,
      };

      // Add optional fields
      if (formData.instagramHandle) {
        payload.instagramHandle = formData.instagramHandle;
      }
      if (formData.websiteOrPortfolioLink) {
        payload.websiteOrPortfolioLink = formData.websiteOrPortfolioLink;
      }
      if (formData.additionalBusinessNotes) {
        payload.additionalBusinessNotes = formData.additionalBusinessNotes;
      }

      const response = await vendorApplicationsService.applyAsVendor(payload);

      if (response.error) {
        setError(response.error.message);
        return;
      }

      // Success!
      setSubmitted(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Submission failed. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes('already exists') || err.response?.status === 409) {
        setError('An application with this email already exists.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      companyName: '',
      bio: '',
      serviceType: '',
      serviceTypeOther: '',
      typicalResponseTimeToInquiries: '',
      bookingAdvanceAndComfortWithWindow: '',
      hasBackupEquipment: false,
      hasStandardServiceAgreement: false,
      instagramHandle: '',
      websiteOrPortfolioLink: '',
      additionalBusinessNotes: '',
    });
    setTouched({});
    setError('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="apply-vendor-page">
        <Navbar />
        <div className="apply-vendor-container">
          <div className="success-state">
            <div className="success-icon">✅</div>
            <h1 className="success-title">Application submitted</h1>
            <p className="success-message">
              Thanks! We'll review your application and get back within 2–3 business days.
            </p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                Go Home
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Apply Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-vendor-page">
      <Navbar />

      <div className="apply-vendor-container">
        <div className="apply-vendor-header">
          <h1 className="page-title">Apply as a Vendor</h1>
          <p className="page-subtitle">
            Join our network of professional service providers. We'll review your application and get back
            within 2–3 business days.
          </p>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="vendor-form">
          {/* Section 1: Basic Info */}
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="input"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('firstName')}
                  required
                />
                {getFieldError('firstName') && <p className="error-text">{getFieldError('firstName')}</p>}
              </div>

              <div className="form-group">
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="input"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('lastName')}
                  required
                />
                {getFieldError('lastName') && <p className="error-text">{getFieldError('lastName')}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                required
              />
              {getFieldError('email') && <p className="error-text">{getFieldError('email')}</p>}
            </div>

            <div className="form-group">
              <label className="label">Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="input"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="form-hint">Minimum 8 characters</p>
              {getFieldError('password') && <p className="error-text">{getFieldError('password')}</p>}
            </div>

            <div className="form-group">
              <label className="label">Company Name *</label>
              <input
                type="text"
                name="companyName"
                className="input"
                value={formData.companyName}
                onChange={handleChange}
                onBlur={() => handleBlur('companyName')}
                required
              />
              {getFieldError('companyName') && <p className="error-text">{getFieldError('companyName')}</p>}
            </div>

            <div className="form-group">
              <label className="label">Bio *</label>
              <textarea
                name="bio"
                className="input textarea"
                rows={4}
                placeholder="Tell us about yourself and your experience..."
                value={formData.bio}
                onChange={handleChange}
                onBlur={() => handleBlur('bio')}
                required
              />
              {getFieldError('bio') && <p className="error-text">{getFieldError('bio')}</p>}
            </div>
          </div>

          {/* Section 2: Links (Optional) */}
          <div className="form-section">
            <h2 className="section-title">Links (Optional)</h2>

            <div className="form-group">
              <label className="label">Instagram Handle</label>
              <input
                type="text"
                name="instagramHandle"
                className="input"
                placeholder="@yourhandle"
                value={formData.instagramHandle}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="label">Website / Portfolio Link</label>
              <input
                type="url"
                name="websiteOrPortfolioLink"
                className="input"
                placeholder="https://yourwebsite.com"
                value={formData.websiteOrPortfolioLink}
                onChange={handleChange}
                onBlur={() => handleBlur('websiteOrPortfolioLink')}
              />
              {getFieldError('websiteOrPortfolioLink') && (
                <p className="error-text">{getFieldError('websiteOrPortfolioLink')}</p>
              )}
            </div>
          </div>

          {/* Section 3: Service & Operations */}
          <div className="form-section">
            <h2 className="section-title">Service & Operations</h2>

            <div className="form-group">
              <label className="label">Service Type *</label>
              <select
                name="serviceType"
                className="input"
                value={formData.serviceType}
                onChange={handleChange}
                onBlur={() => handleBlur('serviceType')}
                required
              >
                <option value="">Select a service type</option>
                <option value="Photographer">Photographer</option>
                <option value="Photo Booth">Photo Booth</option>
                <option value="Videographer">Videographer</option>
                <option value="DJ">DJ</option>
                <option value="Makeup Artist">Makeup Artist</option>
                <option value="Decorator">Decorator</option>
                <option value="Other">Other</option>
              </select>
              {getFieldError('serviceType') && <p className="error-text">{getFieldError('serviceType')}</p>}
            </div>

            {formData.serviceType === 'Other' && (
              <div className="form-group">
                <label className="label">Please specify your service type *</label>
                <input
                  type="text"
                  name="serviceTypeOther"
                  className="input"
                  placeholder="e.g., Event Planner, Florist"
                  value={formData.serviceTypeOther}
                  onChange={handleChange}
                  onBlur={() => handleBlur('serviceTypeOther')}
                  required
                />
                {getFieldError('serviceTypeOther') && (
                  <p className="error-text">{getFieldError('serviceTypeOther')}</p>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="label">Typical response time to booking inquiries? *</label>
              <select
                name="typicalResponseTimeToInquiries"
                className="input"
                value={formData.typicalResponseTimeToInquiries}
                onChange={handleChange}
                onBlur={() => handleBlur('typicalResponseTimeToInquiries')}
                required
              >
                <option value="">Select response time</option>
                <option value="Under 1 hour">Under 1 hour</option>
                <option value="1–4 hours">1–4 hours</option>
                <option value="Same day">Same day</option>
                <option value="Within 24 hours">Within 24 hours</option>
                <option value="1–2 days">1–2 days</option>
                <option value="2–3 days">2–3 days</option>
              </select>
              {getFieldError('typicalResponseTimeToInquiries') && (
                <p className="error-text">{getFieldError('typicalResponseTimeToInquiries')}</p>
              )}
            </div>

            <div className="form-group">
              <label className="label">
                How far in advance do you typically book out, and are you comfortable with TENSANO's 1–88 day
                booking window? *
              </label>
              <textarea
                name="bookingAdvanceAndComfortWithWindow"
                className="input textarea"
                rows={3}
                placeholder="e.g., I typically book 2-4 weeks out and am comfortable with short-notice bookings..."
                value={formData.bookingAdvanceAndComfortWithWindow}
                onChange={handleChange}
                onBlur={() => handleBlur('bookingAdvanceAndComfortWithWindow')}
                required
              />
              {getFieldError('bookingAdvanceAndComfortWithWindow') && (
                <p className="error-text">{getFieldError('bookingAdvanceAndComfortWithWindow')}</p>
              )}
            </div>

            <div className="form-group">
              <label className="label">Do you have backup equipment in case of technical issues? *</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="hasBackupEquipment"
                    value="true"
                    checked={formData.hasBackupEquipment === true}
                    onChange={handleChange}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="hasBackupEquipment"
                    value="false"
                    checked={formData.hasBackupEquipment === false}
                    onChange={handleChange}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="label">
                Do you have a standard service agreement or contract that you use with clients? *
              </label>
              <div className="radio-group">
                <label className="radio-item">
                  <input
                    type="radio"
                    name="hasStandardServiceAgreement"
                    value="true"
                    checked={formData.hasStandardServiceAgreement === true}
                    onChange={handleChange}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-item">
                  <input
                    type="radio"
                    name="hasStandardServiceAgreement"
                    value="false"
                    checked={formData.hasStandardServiceAgreement === false}
                    onChange={handleChange}
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Is there anything else we should know about your business?</label>
              <textarea
                name="additionalBusinessNotes"
                className="input textarea"
                rows={3}
                placeholder="Any additional information you'd like to share..."
                value={formData.additionalBusinessNotes}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Section */}
          <div className="form-submit-section">
            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
            <p className="submit-note">
              We'll review your application and get back within 2–3 business days.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
