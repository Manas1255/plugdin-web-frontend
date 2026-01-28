import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar, Loading } from '../components';
import { servicesService } from '../services/services';
import { mapApiServiceToService } from '../utils/mappers';
import type { Service, PricingOption } from '../types';
import './ServiceDetailsPage.css';

interface ServiceImageGalleryProps {
  photos: string[];
}

const ServiceImageGallery = ({ photos }: ServiceImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="service-image-gallery">
        <div className="gallery-main-image">
          <div className="placeholder">📸</div>
        </div>
        <p className="gallery-photo-count">No photos available</p>
      </div>
    );
  }

  return (
    <div className="service-image-gallery">
      <div className="gallery-main-image">
        <img src={photos[currentIndex]} alt={`Service photo ${currentIndex + 1}`} />
        {photos.length > 1 && (
          <>
            <button className="gallery-nav-btn prev" onClick={handlePrevious} aria-label="Previous photo">
              ←
            </button>
            <button className="gallery-nav-btn next" onClick={handleNext} aria-label="Next photo">
              →
            </button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbnails">
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`gallery-thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              <img src={photo} alt={`Thumbnail ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
      <p className="gallery-photo-count">View large photos ({photos.length})</p>
    </div>
  );
};

interface VendorMiniCardProps {
  vendor: Service['vendor'];
}

const VendorMiniCard = ({ vendor }: VendorMiniCardProps) => {
  const initials = `${vendor.firstName.charAt(0)}${vendor.lastName.charAt(0)}`;

  return (
    <div className="vendor-mini-card">
      <div className="vendor-avatar">
        {vendor.profilePicture ? (
          <img src={vendor.profilePicture} alt={`${vendor.firstName} ${vendor.lastName}`} />
        ) : (
          initials
        )}
      </div>
      <div className="vendor-info">
        <h4>{vendor.firstName} {vendor.lastName}</h4>
        <p>Service Provider</p>
      </div>
    </div>
  );
};

interface PackageSpecificationsSectionProps {
  specifications: string[];
}

const PackageSpecificationsSection = ({ specifications }: PackageSpecificationsSectionProps) => {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <div className="service-info-section">
      <h3>Package Specifications</h3>
      <ul>
        {specifications.map((spec, index) => (
          <li key={index}>{spec}</li>
        ))}
      </ul>
    </div>
  );
};

interface ServicingAreaSectionProps {
  areas: string[];
}

const ServicingAreaSection = ({ areas }: ServicingAreaSectionProps) => {
  if (!areas || areas.length === 0) {
    return null;
  }

  return (
    <div className="service-info-section">
      <h3>Servicing Area</h3>
      <ul>
        {areas.map((area, index) => (
          <li key={index}>{area}</li>
        ))}
      </ul>
    </div>
  );
};

interface BookingSidebarProps {
  service: Service;
}

const BookingSidebar = ({ service }: BookingSidebarProps) => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<PricingOption | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Initialize with first package if available
  useEffect(() => {
    if (service.pricingOptions && service.pricingOptions.length > 0) {
      setSelectedPackage(service.pricingOptions[0]);
    }
  }, [service]);

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeStr);
    }
    return slots;
  };

  // Get selected package identifier (id or name)
  const getPackageIdentifier = (pkg: PricingOption | null) => {
    if (!pkg) return 'Standard package';
    return pkg.id || pkg.name;
  };

  // Calculate booking end time
  const calculateEndTime = () => {
    if (!selectedTime) return 'TBD';
    
    const [startHour, startMinute] = selectedTime.split(':').map(Number);
    
    if (selectedPackage && selectedPackage.sessionLength) {
      const endHour = startHour + selectedPackage.sessionLength.hours;
      const endMinute = startMinute + selectedPackage.sessionLength.minutes;
      return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    } else if (service.listingType === 'hourly') {
      // Default to 1 hour for hourly listings
      const endHour = startHour + 1;
      return `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    }
    
    return 'TBD';
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (selectedPackage) {
      return selectedPackage.pricePerSession;
    } else if (service.listingType === 'hourly' && service.pricePerHour) {
      return service.pricePerHour;
    }
    return 0;
  };

  const subtotal = calculateSubtotal();
  const platformFee = 0; // Static for now
  const total = subtotal + platformFee;

  // Price display
  const getPriceDisplay = () => {
    if (service.listingType === 'hourly' && service.pricePerHour) {
      return `$${service.pricePerHour.toFixed(2)} per hour`;
    } else if (service.pricingOptions && service.pricingOptions.length > 0) {
      const minPrice = Math.min(...service.pricingOptions.map(opt => opt.pricePerSession));
      return `From $${minPrice.toFixed(2)}`;
    }
    return 'Price on request';
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Handle checkout navigation
  const handleSelectAndRequest = () => {
    // Validate required fields
    if (!selectedDate) {
      alert('Please select a date for your booking');
      return;
    }

    if (!selectedTime) {
      alert('Please select a start time for your booking');
      return;
    }

    // Create ISO 8601 datetime strings
    const bookingStart = `${selectedDate}T${selectedTime}:00`;
    
    // Calculate end time
    const endTime = calculateEndTime();
    const bookingEnd = `${selectedDate}T${endTime}:00`;

    // Get vendor name
    const vendorName = `${service.vendor.firstName} ${service.vendor.lastName}`;

    // Navigate to checkout with booking data
    navigate('/booking/checkout', {
      state: {
        serviceId: service.id,
        serviceTitle: service.listingTitle,
        vendorName: vendorName,
        bookingStart: bookingStart,
        bookingEnd: bookingEnd,
        pricingOptionId: selectedPackage?.id,
        subtotal: calculateSubtotal(),
      },
    });
  };

  return (
    <div className="booking-sidebar">
      <h2>{service.listingTitle}</h2>
      <p className="booking-taxes-note">Taxes & Fees not included</p>
      
      <div className="booking-price">{getPriceDisplay()}</div>
      <p className="booking-price-detail">(+ taxes & fees)</p>
      
      <VendorMiniCard vendor={service.vendor} />
      
      {/* Package selector */}
      <div className="booking-form-section">
        <label>Package</label>
        <select
          value={getPackageIdentifier(selectedPackage)}
          onChange={(e) => {
            const pkg = service.pricingOptions?.find(p => 
              (p.id && p.id === e.target.value) || p.name === e.target.value
            );
            setSelectedPackage(pkg || null);
          }}
        >
          {service.pricingOptions && service.pricingOptions.length > 0 ? (
            service.pricingOptions.map((option, index) => (
              <option key={option.id || index} value={option.id || option.name}>
                {option.name}
              </option>
            ))
          ) : (
            <option value="Standard package">Standard package</option>
          )}
        </select>
      </div>
      
      {/* Date picker */}
      <div className="booking-form-section">
        <label>Pick a date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={getMinDate()}
        />
      </div>
      
      {/* Time picker */}
      <div className="booking-form-section">
        <label>Start time</label>
        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
          <option value="">Select time</option>
          {generateTimeSlots().map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>
      
      {/* Booking breakdown */}
      <div className="booking-breakdown">
        <h4>Booking Details</h4>
        
        <div className="breakdown-row">
          <span className="breakdown-label">Booking start</span>
          <span className="breakdown-value">
            {selectedDate && selectedTime ? `${selectedDate} ${selectedTime}` : 'Not selected'}
          </span>
        </div>
        
        <div className="breakdown-row">
          <span className="breakdown-label">Booking end</span>
          <span className="breakdown-value">
            {selectedDate && selectedTime ? `${selectedDate} ${calculateEndTime()}` : 'Not selected'}
          </span>
        </div>
        
        <div className="breakdown-divider"></div>
        
        <div className="breakdown-row">
          <span className="breakdown-label">Subtotal</span>
          <span className="breakdown-value">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="breakdown-row">
          <span className="breakdown-label">Platform fee</span>
          <span className="breakdown-value">${platformFee.toFixed(2)}</span>
        </div>
        
        <div className="breakdown-divider"></div>
        
        <div className="breakdown-row breakdown-total">
          <span className="breakdown-label">Total</span>
          <span className="breakdown-value">${total.toFixed(2)}</span>
        </div>
      </div>
      
      <button className="booking-submit-btn" onClick={handleSelectAndRequest}>
        Select & Request
      </button>
    </div>
  );
};

export const ServiceDetailsPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadServiceDetails();
  }, [serviceId]);

  const loadServiceDetails = async () => {
    if (!serviceId) {
      setError('Invalid service ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await servicesService.getServiceById(serviceId);

      if (response.error) {
        setError(response.error.message);
        return;
      }

      // Map API response to frontend Service type
      const mappedService = mapApiServiceToService(response);
      setService(mappedService);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="service-details-page">
        <Navbar />
        <div className="service-details-loading">
          <Loading />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-details-page">
        <Navbar />
        <div className="service-details-error">
          <h2>Service not found</h2>
          <p>{error || 'The service you are looking for does not exist.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/search')}>
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="service-details-page">
      <Navbar />
      
      <div className="service-details-container">
        <div className="service-details-content">
          {/* Left Column */}
          <div className="service-details-left">
            <ServiceImageGallery photos={service.photos} />
            
            <div className="service-info-section">
              <h2>Description</h2>
              <p>{service.listingDescription}</p>
            </div>
            
            <div className="service-info-section">
              <h3>You get:</h3>
              <ul>
                <li>Professional service tailored to your needs</li>
                <li>Direct communication with the vendor</li>
                <li>Flexible booking options</li>
                <li>Quality guarantee</li>
              </ul>
            </div>
            
            <PackageSpecificationsSection specifications={service.packageSpecifications} />
            <ServicingAreaSection areas={service.servicingArea} />
          </div>
          
          {/* Right Column */}
          <div className="service-details-right">
            <BookingSidebar service={service} />
          </div>
        </div>
      </div>
    </div>
  );
};
