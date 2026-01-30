import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Navbar, Loading } from '../components';
import { bookingRequestsService } from '../services';
import type { BillingDetails, BookingRequestResponse } from '../types';
import './CheckoutPage.css';

// Initialize Stripe with publishable key from environment
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_key'
);

interface CheckoutState {
  serviceId: string;
  serviceTitle: string;
  vendorName: string;
  bookingStart: string;
  bookingEnd: string;
  pricingOptionId?: string;
  notes?: string;
  subtotal: number;
}

interface CheckoutFormProps {
  bookingData: BookingRequestResponse['data'];
  onSuccess: () => void;
  /** Fallbacks when API does not return service (e.g. serviceTitle, vendorName from navigation state) */
  serviceTitleFallback?: string;
  vendorNameFallback?: string;
}

const CheckoutForm = ({ bookingData, onSuccess, serviceTitleFallback, vendorNameFallback }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    name: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'CA',
    },
  });
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate billing details
    if (!billingDetails.name.trim()) {
      setError('Cardholder name is required');
      return;
    }
    if (!billingDetails.address.line1.trim()) {
      setError('Address is required');
      return;
    }
    if (!billingDetails.address.city.trim()) {
      setError('City is required');
      return;
    }
    if (!billingDetails.address.postalCode.trim()) {
      setError('Postal code is required');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Confirm the SetupIntent
      const { error: stripeError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/booking/success',
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment setup failed');
        setProcessing(false);
        return;
      }

      if (setupIntent && setupIntent.status === 'succeeded') {
        // Complete the payment method on the backend
        const response = await bookingRequestsService.completePaymentMethod(
          bookingData.bookingRequestId,
          { setupIntentId: setupIntent.id }
        );

        if (response.error) {
          setError(response.error.message);
          setProcessing(false);
          return;
        }

        // Success!
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setProcessing(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-container">
        {/* Left Column - Payment & Billing Details */}
        <div className="checkout-left">
          {/* Payment Card Details */}
          <div className="checkout-section">
            <h2>Payment Card Details</h2>
            <p className="checkout-note">
              Your card will not be charged now. We only save your card details securely.
            </p>
            <div className="payment-element-container">
              <PaymentElement />
            </div>
          </div>

          {/* Billing Details */}
          <div className="checkout-section">
            <h2>Billing Details</h2>
            
            <div className="form-group">
              <label htmlFor="cardholderName">Cardholder Name *</label>
              <input
                type="text"
                id="cardholderName"
                value={billingDetails.name}
                onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="addressLine1">Address Line 1 *</label>
              <input
                type="text"
                id="addressLine1"
                value={billingDetails.address.line1}
                onChange={(e) =>
                  setBillingDetails({
                    ...billingDetails,
                    address: { ...billingDetails.address, line1: e.target.value },
                  })
                }
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="addressLine2">Address Line 2</label>
              <input
                type="text"
                id="addressLine2"
                value={billingDetails.address.line2}
                onChange={(e) =>
                  setBillingDetails({
                    ...billingDetails,
                    address: { ...billingDetails.address, line2: e.target.value },
                  })
                }
                placeholder="Apt 4B (optional)"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  value={billingDetails.address.city}
                  onChange={(e) =>
                    setBillingDetails({
                      ...billingDetails,
                      address: { ...billingDetails.address, city: e.target.value },
                    })
                  }
                  placeholder="Toronto"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State/Province</label>
                <input
                  type="text"
                  id="state"
                  value={billingDetails.address.state}
                  onChange={(e) =>
                    setBillingDetails({
                      ...billingDetails,
                      address: { ...billingDetails.address, state: e.target.value },
                    })
                  }
                  placeholder="ON"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code *</label>
                <input
                  type="text"
                  id="postalCode"
                  value={billingDetails.address.postalCode}
                  onChange={(e) =>
                    setBillingDetails({
                      ...billingDetails,
                      address: { ...billingDetails.address, postalCode: e.target.value },
                    })
                  }
                  placeholder="M5H 2N2"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <select
                  id="country"
                  value={billingDetails.address.country}
                  onChange={(e) =>
                    setBillingDetails({
                      ...billingDetails,
                      address: { ...billingDetails.address, country: e.target.value },
                    })
                  }
                  required
                >
                  <option value="CA">Canada</option>
                  <option value="US">United States</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="checkout-section">
            <h2>Additional Details</h2>
            <div className="form-group">
              <label htmlFor="additionalNotes">Notes (Optional)</label>
              <textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Add any special requests or notes for the vendor..."
                rows={4}
              />
            </div>
          </div>

          {error && (
            <div className="checkout-error">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Right Column - Booking Summary */}
        <div className="checkout-right">
          <div className="checkout-summary">
            <h2>Booking Summary</h2>

            {/* Service Info */}
            <div className="summary-section">
              <h3>{bookingData.service?.title ?? serviceTitleFallback ?? 'Service'}</h3>
              <p className="vendor-name">
                by {bookingData.service?.vendor
                  ? `${bookingData.service.vendor.firstName} ${bookingData.service.vendor.lastName}`
                  : (vendorNameFallback ?? 'Vendor')}
              </p>
            </div>

            <div className="summary-divider"></div>

            {/* Booking Details */}
            <div className="summary-section">
              <h4>Booking Details</h4>
              
              <div className="summary-row">
                <span className="summary-label">Date</span>
                <span className="summary-value">{formatDate(bookingData.bookingStart)}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Start time</span>
                <span className="summary-value">{formatTime(bookingData.bookingStart)}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">End time</span>
                <span className="summary-value">{formatTime(bookingData.bookingEnd)}</span>
              </div>
            </div>

            <div className="summary-divider"></div>

            {/* Pricing Breakdown */}
            <div className="summary-section">
              <h4>Price Breakdown</h4>
              
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">${bookingData.pricing.subtotal.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Platform fee</span>
                <span className="summary-value">${bookingData.pricing.platformFee.toFixed(2)}</span>
              </div>

              {bookingData.pricing.tax > 0 && (
                <div className="summary-row">
                  <span className="summary-label">Tax</span>
                  <span className="summary-value">${bookingData.pricing.tax.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="summary-divider"></div>

            {/* Total */}
            <div className="summary-row summary-total">
              <span className="summary-label">Total</span>
              <span className="summary-value">${bookingData.pricing.total.toFixed(2)}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="checkout-submit-btn"
              disabled={!stripe || processing}
              onClick={handleSubmit}
            >
              {processing ? 'Processing...' : 'Submit Availability Request'}
            </button>

            <p className="checkout-disclaimer">
              No charge will be made until the vendor confirms your request.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState<BookingRequestResponse['data'] | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initializeCheckout();
  }, []);

  const initializeCheckout = async () => {
    // Get checkout state from location
    const state = location.state as CheckoutState | null;

    if (!state || !state.serviceId) {
      setError('Invalid checkout data. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // Create booking request
      const response = await bookingRequestsService.createBookingRequest({
        serviceId: state.serviceId,
        pricingOptionId: state.pricingOptionId,
        bookingStart: state.bookingStart,
        bookingEnd: state.bookingEnd,
        notes: state.notes,
      });

      if (response.error) {
        setError(response.error.message);
        setLoading(false);
        return;
      }

      setBookingData(response.data);
      setClientSecret(response.data.stripe.clientSecret);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="checkout-loading">
          <Loading />
          <p>Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="checkout-error-page">
          <h2>Checkout Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="checkout-success">
          <div className="success-icon">✓</div>
          <h2>Request Submitted Successfully!</h2>
          <p>Your availability request has been sent to the vendor.</p>
          <p className="success-note">
            No charge has been made to your card. You will only be charged once the vendor
            confirms your booking request.
          </p>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/search')}>
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData || !clientSecret) {
    return null;
  }

  const checkoutState = location.state as CheckoutState | null;
  const serviceTitleFallback = checkoutState?.serviceTitle;
  const vendorNameFallback = checkoutState?.vendorName;

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-content">
        <h1>Complete Your Booking Request</h1>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            bookingData={bookingData}
            onSuccess={handleSuccess}
            serviceTitleFallback={serviceTitleFallback}
            vendorNameFallback={vendorNameFallback}
          />
        </Elements>
      </div>
    </div>
  );
};
