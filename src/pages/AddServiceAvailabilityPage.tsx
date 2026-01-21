import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Stepper, Modal, VendorGuard } from '../components';
import { useAddServiceDraft } from '../context/AddServiceDraftContext';
import type { TimeSlot, Availability } from '../types';
import { generateTimeOptions, formatTime, isTimeBefore, COMMON_TIMEZONES, DAYS_OF_WEEK } from '../utils/timeUtils';
import './AddServiceLayout.css';
import './AddServiceAvailabilityPage.css';

export const AddServiceAvailabilityPage = () => {
  const navigate = useNavigate();
  const { draft, updateDraft, isDetailsComplete, isPricingComplete } = useAddServiceDraft();
  
  const [showModal, setShowModal] = useState(false);
  const [modalSchedule, setModalSchedule] = useState<Availability>(
    draft.availability || {
      timezone: 'America/Toronto',
      weeklySchedule: [],
    }
  );

  const timeOptions = generateTimeOptions(30);

  const handleSaveSchedule = () => {
    updateDraft({ availability: modalSchedule });
    setShowModal(false);
  };

  const handleDayToggle = (day: typeof DAYS_OF_WEEK[number]) => {
    const existingDay = modalSchedule.weeklySchedule.find(d => d.day === day);
    
    if (existingDay) {
      // Remove day
      setModalSchedule({
        ...modalSchedule,
        weeklySchedule: modalSchedule.weeklySchedule.filter(d => d.day !== day),
      });
    } else {
      // Add day with default slot
      setModalSchedule({
        ...modalSchedule,
        weeklySchedule: [
          ...modalSchedule.weeklySchedule,
          { day, slots: [{ start: '09:00', end: '17:00' }] },
        ],
      });
    }
  };

  const handleAddSlot = (day: typeof DAYS_OF_WEEK[number]) => {
    setModalSchedule({
      ...modalSchedule,
      weeklySchedule: modalSchedule.weeklySchedule.map(d => 
        d.day === day
          ? { ...d, slots: [...d.slots, { start: '09:00', end: '17:00' }] }
          : d
      ),
    });
  };

  const handleRemoveSlot = (day: typeof DAYS_OF_WEEK[number], slotIndex: number) => {
    setModalSchedule({
      ...modalSchedule,
      weeklySchedule: modalSchedule.weeklySchedule.map(d =>
        d.day === day
          ? { ...d, slots: d.slots.filter((_, i) => i !== slotIndex) }
          : d
      ),
    });
  };

  const handleSlotChange = (
    day: typeof DAYS_OF_WEEK[number],
    slotIndex: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setModalSchedule({
      ...modalSchedule,
      weeklySchedule: modalSchedule.weeklySchedule.map(d =>
        d.day === day
          ? {
              ...d,
              slots: d.slots.map((slot, i) =>
                i === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : d
      ),
    });
  };

  const getDaySchedule = (day: typeof DAYS_OF_WEEK[number]) => {
    return draft.availability?.weeklySchedule.find(d => d.day === day);
  };

  const isSlotValid = (slot: TimeSlot) => {
    return isTimeBefore(slot.start, slot.end);
  };

  const handleNext = () => {
    if (!draft.availability || draft.availability.weeklySchedule.length === 0) {
      const confirm = window.confirm('You have not set a schedule. Do you want to proceed without availability?');
      if (!confirm) return;
    }
    navigate('/add-service/photos');
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
            <h1 className="page-title">Availability</h1>

            <div className="form-section">
              <h2 className="section-title">Default Schedule</h2>
              <p className="section-description">
                Set your default weekly schedule. Clients will see when you're available to book your services.
              </p>

              <button
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                {draft.availability ? 'Edit Default Schedule' : 'Set Default Schedule'}
              </button>
            </div>

            {draft.availability && draft.availability.weeklySchedule.length > 0 && (
              <div className="form-section">
                <h2 className="section-title">Weekly Schedule Preview</h2>
                <p className="section-description">
                  Timezone: <strong>{draft.availability.timezone}</strong>
                </p>

                <div className="week-view">
                  {DAYS_OF_WEEK.map(day => {
                    const daySchedule = getDaySchedule(day);
                    const hasSlots = daySchedule && daySchedule.slots.length > 0;

                    return (
                      <div key={day} className="day-card">
                        <div className="day-header">
                          <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                          <div className={`status-dot ${hasSlots ? 'available' : 'unavailable'}`} />
                        </div>
                        <div className="day-slots">
                          {hasSlots ? (
                            daySchedule.slots.map((slot, i) => (
                              <div key={i} className="time-slot">
                                {formatTime(slot.start)} - {formatTime(slot.end)}
                              </div>
                            ))
                          ) : (
                            <p className="unavailable-text">Not available</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => navigate('/add-service/pricing')}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleNext}>
                Next
              </button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Edit default schedule for ${draft.title || 'your service'}`}
          maxWidth="800px"
        >
          <div className="schedule-modal">
            <div className="form-group">
              <label className="label">Timezone</label>
              <select
                className="input"
                value={modalSchedule.timezone}
                onChange={(e) => setModalSchedule({ ...modalSchedule, timezone: e.target.value })}
              >
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <h3 className="modal-section-title">Weekly Schedule</h3>
            
            <div className="days-list">
              {DAYS_OF_WEEK.map(day => {
                const daySchedule = modalSchedule.weeklySchedule.find(d => d.day === day);
                const isEnabled = !!daySchedule;

                return (
                  <div key={day} className="day-item">
                    <label className="day-checkbox">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleDayToggle(day)}
                      />
                      <span className="day-name">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </span>
                    </label>

                    {isEnabled && daySchedule && (
                      <div className="slots-editor">
                        {daySchedule.slots.map((slot, i) => (
                          <div key={i} className="slot-row">
                            <select
                              className="input slot-input"
                              value={slot.start}
                              onChange={(e) => handleSlotChange(day, i, 'start', e.target.value)}
                            >
                              {timeOptions.map(time => (
                                <option key={time} value={time}>{formatTime(time)}</option>
                              ))}
                            </select>
                            
                            <span>to</span>
                            
                            <select
                              className="input slot-input"
                              value={slot.end}
                              onChange={(e) => handleSlotChange(day, i, 'end', e.target.value)}
                            >
                              {timeOptions.map(time => (
                                <option key={time} value={time}>{formatTime(time)}</option>
                              ))}
                            </select>

                            {daySchedule.slots.length > 1 && (
                              <button
                                className="btn-icon"
                                onClick={() => handleRemoveSlot(day, i)}
                                type="button"
                              >
                                ×
                              </button>
                            )}

                            {!isSlotValid(slot) && (
                              <span className="error-text">Invalid time range</span>
                            )}
                          </div>
                        ))}
                        
                        <button
                          className="btn-link"
                          onClick={() => handleAddSlot(day)}
                          type="button"
                        >
                          + Add another time slot
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveSchedule}>
                Save Schedule
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </VendorGuard>
  );
};
