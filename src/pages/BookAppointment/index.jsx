import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBookAppointment } from '@services/api';
import { useDoctorSearch } from '@hooks/useDoctors';
import { useAuth } from '@contexts/AuthContext';
import { announce } from '@utils/a11yHelpers';
import './BookAppointment.css';

function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const preSelectedDoctor = location.state?.doctor;
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Doctor Selection
    doctorId: preSelectedDoctor?.id || '',
    doctorName: preSelectedDoctor?.name || '',
    specialty: preSelectedDoctor?.specialty || '',
    doctorLocation: preSelectedDoctor?.location || '',
    hospital: preSelectedDoctor?.hospital || '',
    consultationFee: preSelectedDoctor?.consultationFee || 0,
    
    // Step 2: Date & Time
    date: '',
    time: '',
    type: 'in-person',
    
    // Step 3: Patient Info
    patientName: user?.name || '',
    patientEmail: user?.email || '',
    patientPhone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    insuranceProvider: '',
    insuranceId: '',
    reason: '',
    symptoms: '',
    medications: '',
    
    // Step 4: Confirmation (read-only)
  });

  // Refs for focus management
  const stepRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
    4: useRef(null),
  };

  const bookAppointmentMutation = useBookAppointment();
  const { doctors } = useDoctorSearch({});

  // Focus on step change
  useEffect(() => {
    if (stepRefs[currentStep]?.current) {
      stepRefs[currentStep].current.focus();
    }
  }, [currentStep]);

  // Available time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.doctorId) newErrors.doctorId = 'Please select a doctor';
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    
    // Validate date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = 'Date cannot be in the past';
    }
    
    return newErrors;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.patientName?.trim()) newErrors.patientName = 'Name is required';
    if (!formData.patientEmail?.trim()) newErrors.patientEmail = 'Email is required';
    if (formData.patientEmail && !/\S+@\S+\.\S+/.test(formData.patientEmail)) {
      newErrors.patientEmail = 'Invalid email format';
    }
    if (!formData.patientPhone?.trim()) newErrors.patientPhone = 'Phone is required';
    if (!formData.reason?.trim()) newErrors.reason = 'Please provide reason for visit';
    
    return newErrors;
  };

  const validateCurrentStep = () => {
    let newErrors = {};
    
    switch (currentStep) {
      case 1:
        newErrors = validateStep1();
        break;
      case 2:
        newErrors = validateStep2();
        break;
      case 3:
        newErrors = validateStep3();
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleDoctorSelect = (doctor) => {
    setFormData(prev => ({
      ...prev,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      doctorLocation: doctor.location,
      hospital: doctor.hospital,
      consultationFee: doctor.consultationFee,
    }));
    setErrors(prev => ({ ...prev, doctorId: '' }));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      const newStep = Math.min(currentStep + 1, 4);
      setCurrentStep(newStep);
      announce(`Moving to step ${newStep} of 4`, 'polite');
    } else {
      announce('Please fix errors before continuing', 'assertive');
    }
  };

  const prevStep = () => {
    const newStep = Math.max(currentStep - 1, 1);
    setCurrentStep(newStep);
    announce(`Returned to step ${newStep} of 4`, 'polite');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    try {
      const appointmentData = {
        userId: user?.id,
        doctorId: formData.doctorId,
        doctorName: formData.doctorName,
        specialty: formData.specialty,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        reason: formData.reason,
        symptoms: formData.symptoms,
        medications: formData.medications,
        insuranceProvider: formData.insuranceProvider,
        insuranceId: formData.insuranceId,
        consultationFee: formData.consultationFee,
        hospital: formData.hospital,
        location: formData.doctorLocation,
      };

      await bookAppointmentMutation.mutateAsync(appointmentData);
      
      // Success - show confirmation and redirect
      alert('✅ Appointment booked successfully!');
      navigate('/appointments');
    } catch (error) {
      alert('❌ Failed to book appointment. Please try again.');
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content" ref={stepRefs[1]} tabIndex="-1" role="region" aria-label="Step 1: Select a doctor">
            <h2 id="step-1-title">Select a Doctor</h2>
            <p className="step-description">Choose your healthcare provider</p>

            {formData.doctorId && (
              <div className="selected-doctor-card" role="status" aria-live="polite">
                <div className="doctor-avatar-lg" aria-hidden="true">
                  {formData.doctorName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="selected-doctor-info">
                  <h3>{formData.doctorName}</h3>
                  <p className="specialty">{formData.specialty}</p>
                  <p className="hospital"><span aria-hidden="true">🏥</span> {formData.hospital}</p>
                  <p className="location"><span aria-hidden="true">📍</span> {formData.doctorLocation}</p>
                  <p className="fee"><span aria-hidden="true">💰</span> ${formData.consultationFee} consultation</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, doctorId: '' }))}
                  className="btn-change"
                  aria-label="Change selected doctor"
                >
                  Change Doctor
                </button>
              </div>
            )}

            {!formData.doctorId && (
              <div className="doctor-selection-grid" role="list" aria-label="Available doctors">
                {doctors && doctors.slice(0, 6).map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    className="doctor-select-card"
                    onClick={() => handleDoctorSelect(doctor)}
                    role="listitem"
                    aria-label={`Select ${doctor.name}, ${doctor.specialty}, rated ${doctor.rating} stars, consultation fee $${doctor.consultationFee}${doctor.availableToday ? ', available today' : ''}`}
                  >
                    <div className="doctor-avatar-md" aria-hidden="true">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h4>{doctor.name}</h4>
                    <p className="specialty">{doctor.specialty}</p>
                    <div className="doctor-quick-info">
                      <span><span aria-hidden="true">⭐</span> <span className="sr-only">Rating:</span>{doctor.rating}</span>
                      <span><span className="sr-only">Fee:</span>${doctor.consultationFee}</span>
                    </div>
                    {doctor.availableToday && (
                      <span className="available-badge">Available Today</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {errors.doctorId && (
              <div className="error-message" role="alert" aria-live="assertive">{errors.doctorId}</div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="step-content" ref={stepRefs[2]} tabIndex="-1" role="region" aria-label="Step 2: Select date and time">
            <h2 id="step-2-title">Select Date & Time</h2>
            <p className="step-description">Choose when you'd like your appointment</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Appointment Date *</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.date ? 'input-error' : ''}
                  aria-invalid={errors.date ? 'true' : 'false'}
                  aria-describedby={errors.date ? 'date-error' : undefined}
                  aria-required="true"
                />
                {errors.date && (
                  <span id="date-error" className="error-text" role="alert" aria-live="assertive">
                    {errors.date}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="type">Appointment Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  aria-label="Select appointment type"
                  aria-required="true"
                >
                  <option value="in-person">In-Person Visit</option>
                  <option value="telemedicine">Telemedicine</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label id="time-slots-label">Select Time Slot *</label>
              <div className="time-slots-grid" role="radiogroup" aria-labelledby="time-slots-label" aria-required="true">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot ${formData.time === slot ? 'selected' : ''}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, time: slot }));
                      setErrors(prev => ({ ...prev, time: '' }));
                      announce(`Selected time ${slot}`, 'polite');
                    }}
                    role="radio"
                    aria-checked={formData.time === slot}
                    aria-label={`${slot} time slot`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {errors.time && (
                <span className="error-text" role="alert" aria-live="assertive">{errors.time}</span>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content" ref={stepRefs[3]} tabIndex="-1" role="region" aria-label="Step 3: Patient information">
            <h2 id="step-3-title">Patient Information</h2>
            <p className="step-description">Provide your details for the appointment</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="patientName">Full Name *</label>
                <input
                  id="patientName"
                  name="patientName"
                  type="text"
                  value={formData.patientName}
                  onChange={handleChange}
                  className={errors.patientName ? 'input-error' : ''}
                  aria-invalid={errors.patientName ? 'true' : 'false'}
                  aria-describedby={errors.patientName ? 'name-error' : undefined}
                  aria-required="true"
                  autoComplete="name"
                />
                {errors.patientName && (
                  <span id="name-error" className="error-text" role="alert" aria-live="assertive">
                    {errors.patientName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  aria-label="Date of birth"
                  autoComplete="bday"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="patientEmail">Email *</label>
                <input
                  id="patientEmail"
                  name="patientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={handleChange}
                  className={errors.patientEmail ? 'input-error' : ''}
                  aria-invalid={errors.patientEmail ? 'true' : 'false'}
                  aria-describedby={errors.patientEmail ? 'email-error' : undefined}
                  aria-required="true"
                  autoComplete="email"
                />
                {errors.patientEmail && (
                  <span id="email-error" className="error-text" role="alert" aria-live="assertive">{errors.patientEmail}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="patientPhone">Phone *</label>
                <input
                  id="patientPhone"
                  name="patientPhone"
                  type="tel"
                  value={formData.patientPhone}
                  onChange={handleChange}
                  className={errors.patientPhone ? 'input-error' : ''}
                  aria-invalid={errors.patientPhone ? 'true' : 'false'}
                  aria-describedby={errors.patientPhone ? 'phone-error' : undefined}
                  aria-required="true"
                  autoComplete="tel"
                />
                {errors.patientPhone && (
                  <span id="phone-error" className="error-text" role="alert" aria-live="assertive">{errors.patientPhone}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="insuranceProvider">Insurance Provider</label>
                <input
                  id="insuranceProvider"
                  name="insuranceProvider"
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  placeholder="e.g., Blue Cross Blue Shield"
                  aria-label="Insurance provider"
                />
              </div>

              <div className="form-group">
                <label htmlFor="insuranceId">Insurance ID</label>
                <input
                  id="insuranceId"
                  name="insuranceId"
                  type="text"
                  value={formData.insuranceId}
                  onChange={handleChange}
                  aria-label="Insurance ID number"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for Visit *</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="3"
                placeholder="Brief description of your symptoms or reason..."
                className={errors.reason ? 'input-error' : ''}
                aria-invalid={errors.reason ? 'true' : 'false'}
                aria-describedby={errors.reason ? 'reason-error' : undefined}
                aria-required="true"
              />
              {errors.reason && (
                <span id="reason-error" className="error-text" role="alert" aria-live="assertive">{errors.reason}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="symptoms">Current Symptoms</label>
              <textarea
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows="2"
                placeholder="Any specific symptoms you're experiencing..."
                aria-label="Current symptoms"
              />
            </div>

            <div className="form-group">
              <label htmlFor="medications">Current Medications</label>
              <textarea
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                rows="2"
                placeholder="List any medications you're currently taking..."
                aria-label="Current medications"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content confirmation-step" ref={stepRefs[4]} tabIndex="-1" role="region" aria-label="Step 4: Confirmation">
            <h2 id="step-4-title">Confirm Your Appointment</h2>
            <p className="step-description">Please review your appointment details</p>

            <div className="confirmation-card" role="article" aria-labelledby="step-4-title">
              <div className="confirmation-section">
                <h3>👨‍⚕️ Doctor Information</h3>
                <div className="confirmation-details">
                  <div className="detail-item">
                    <span className="label">Doctor:</span>
                    <span className="value">{formData.doctorName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Specialty:</span>
                    <span className="value">{formData.specialty}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Hospital:</span>
                    <span className="value">{formData.hospital}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">{formData.doctorLocation}</span>
                  </div>
                </div>
              </div>

              <div className="confirmation-section">
                <h3>📅 Appointment Details</h3>
                <div className="confirmation-details">
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">
                      {new Date(formData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Time:</span>
                    <span className="value">{formData.time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Type:</span>
                    <span className="value">
                      {formData.type === 'in-person' ? 'In-Person Visit' : 'Telemedicine'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Consultation Fee:</span>
                    <span className="value">${formData.consultationFee}</span>
                  </div>
                </div>
              </div>

              <div className="confirmation-section">
                <h3>👤 Patient Information</h3>
                <div className="confirmation-details">
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{formData.patientName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{formData.patientEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{formData.patientPhone}</span>
                  </div>
                  {formData.insuranceProvider && (
                    <div className="detail-item">
                      <span className="label">Insurance:</span>
                      <span className="value">{formData.insuranceProvider}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Reason:</span>
                    <span className="value">{formData.reason}</span>
                  </div>
                </div>
              </div>

              <div className="confirmation-notice">
                <p>
                  <strong>📋 Please Note:</strong> You will receive a confirmation email
                  at {formData.patientEmail} with appointment details and any pre-visit
                  instructions.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="book-page">
      <div className="book-header">
        <h1>Book an Appointment</h1>
        <p>Complete the steps below to schedule your visit</p>
      </div>

      {/* Step Progress Indicator */}
      <div className="steps-progress" role="navigation" aria-label="Appointment booking progress">
        <div className="steps-container">
          {[
            { num: 1, label: 'Select Doctor' },
            { num: 2, label: 'Date & Time' },
            { num: 3, label: 'Patient Info' },
            { num: 4, label: 'Confirm' },
          ].map((step) => (
            <div
              key={step.num}
              className={`step-item ${currentStep === step.num ? 'active' : ''} ${
                currentStep > step.num ? 'completed' : ''
              }`}
              aria-current={currentStep === step.num ? 'step' : undefined}
            >
              <div className="step-number" aria-hidden="true">
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <div className="step-label">
                <span className="sr-only">
                  {currentStep === step.num ? 'Current step: ' : ''}
                  {currentStep > step.num ? 'Completed step: ' : ''}
                  Step {step.num} of 4,
                </span>
                {step.label}
              </div>
            </div>
          ))}
        </div>
        <div 
          className="progress-bar" 
          role="progressbar"
          aria-label="Form completion progress"
          aria-valuenow={currentStep}
          aria-valuemin="1"
          aria-valuemax="4"
          aria-valuetext={`Step ${currentStep} of 4`}
        >
          <div
            className="progress-fill"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Container */}
      <div className="booking-form-container">
        <form onSubmit={handleSubmit} className="multi-step-form" aria-label="Multi-step appointment booking form">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="form-navigation" role="group" aria-label="Form navigation">
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-secondary"
              disabled={currentStep === 1}
              aria-label="Go to previous step"
              aria-disabled={currentStep === 1}
            >
              <span aria-hidden="true">←</span> Previous
            </button>

            <div className="step-indicator-text" aria-live="polite" aria-atomic="true">
              <span className="sr-only">Currently on </span>Step {currentStep} of 4
            </div>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
                aria-label="Go to next step"
              >
                Next <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={bookAppointmentMutation.isPending}
                aria-busy={bookAppointmentMutation.isPending}
                aria-label="Confirm and book appointment"
              >
                {bookAppointmentMutation.isPending ? 'Booking...' : '✓ Confirm Booking'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookAppointment;
