import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  startOfDay,
} from 'date-fns';
import { Navbar } from '../components';
import { servicesService } from '../services/services';
import { vendorsService } from '../services/vendors';
import type { Category, Vendor } from '../types';
import './HomePage.css';

const PLACEHOLDER_AVATAR = 'https://via.placeholder.com/400x400/e2e8f0/64748b?text=Photo';

function DateRangeCalendar({
  startDate,
  endDate,
  onRangeChange,
  onClose,
  anchorRef,
}: {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(() => {
    if (startDate) return startOfMonth(new Date(startDate));
    return startOfMonth(today);
  });
  const [selectingEnd, setSelectingEnd] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const start = startDate ? startOfDay(new Date(startDate)) : null;
  const end = endDate ? startOfDay(new Date(endDate)) : null;

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const padStart = monthStart.getDay();

  const handleDayClick = (d: Date) => {
    const dateStr = format(d, 'yyyy-MM-dd');
    if (!selectingEnd) {
      onRangeChange(dateStr, dateStr);
      setSelectingEnd(true);
    } else {
      if (start && isBefore(d, start)) {
        onRangeChange(dateStr, format(start, 'yyyy-MM-dd'));
      } else {
        onRangeChange(start ? format(start, 'yyyy-MM-dd') : dateStr, dateStr);
      }
      setSelectingEnd(false);
      onClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current && !calendarRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorRef]);

  return (
    <div className="home-date-range-calendar" ref={calendarRef}>
      <div className="home-date-range-calendar-header">
        <button type="button" className="home-date-range-nav" onClick={() => setViewMonth(m => subMonths(m, 1))} aria-label="Previous month">‹</button>
        <span className="home-date-range-month-title">{format(viewMonth, 'MMMM yyyy')}</span>
        <button type="button" className="home-date-range-nav" onClick={() => setViewMonth(m => addMonths(m, 1))} aria-label="Next month">›</button>
      </div>
      <div className="home-date-range-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <span key={day} className="home-date-range-weekday">{day}</span>
        ))}
      </div>
      <div className="home-date-range-days">
        {Array.from({ length: padStart }, (_, i) => (
          <span key={`pad-${i}`} className="home-date-range-day home-date-range-day-pad" />
        ))}
        {days.map(day => {
          const inRange = start && end && isWithinInterval(day, { start, end });
          const isStart = start && isSameDay(day, start);
          const isEnd = end && isSameDay(day, end);
          const isCurrentMonth = isSameMonth(day, viewMonth);
          const isPast = isBefore(day, today);
          return (
            <button
              key={day.getTime()}
              type="button"
              className={`home-date-range-day ${!isCurrentMonth ? 'home-date-range-day-other' : ''} ${inRange ? 'home-date-range-day-in-range' : ''} ${isStart || isEnd ? 'home-date-range-day-selected' : ''} ${isPast ? 'home-date-range-day-past' : ''}`}
              disabled={isPast}
              onClick={() => !isPast && handleDayClick(day)}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
      <p className="home-date-range-hint">{selectingEnd ? 'Select end date' : 'Select start date'}</p>
    </div>
  );
}

export const HomePage = () => {
  const navigate = useNavigate();
  const vendorsScrollRef = useRef<HTMLDivElement>(null);
  const dateRangeAnchorRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showDateCalendar, setShowDateCalendar] = useState(false);

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
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    navigate(`/search?${params.toString()}`);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const dateRangeLabel = startDate && endDate
    ? `${format(new Date(startDate), 'MMM d')} – ${format(new Date(endDate), 'MMM d')}`
    : startDate
      ? `${format(new Date(startDate), 'MMM d')} – …`
      : 'Select date range';

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

              <div className="search-field search-field-date" ref={dateRangeAnchorRef}>
                <label className="search-label">Date range</label>
                <button
                  type="button"
                  className="search-date-trigger"
                  onClick={() => setShowDateCalendar((v) => !v)}
                  aria-expanded={showDateCalendar}
                  aria-haspopup="dialog"
                >
                  <span className="search-date-trigger-text">{dateRangeLabel}</span>
                  <span className="search-date-trigger-icon" aria-hidden>▾</span>
                </button>
                {showDateCalendar && (
                  <DateRangeCalendar
                    startDate={startDate}
                    endDate={endDate}
                    onRangeChange={handleDateRangeChange}
                    onClose={() => setShowDateCalendar(false)}
                    anchorRef={dateRangeAnchorRef}
                  />
                )}
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
