import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppointments, useCancelAppointment } from '@services/api';
import { useAuth } from '@contexts/AuthContext';
import './Appointments.css';

// Sample appointment data
const SAMPLE_APPOINTMENTS = [
  {
    id: 1,
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    date: '2026-02-10',
    time: '10:00 AM',
    type: 'In-person',
    location: 'City Medical Center, Room 305',
    status: 'upcoming',
    reason: 'Regular checkup',
    consultationFee: 150
  },
  {
    id: 2,
    doctorName: 'Dr. Michael Chen',
    specialty: 'Dermatology',
    date: '2026-02-15',
    time: '2:30 PM',
    type: 'Video Call',
    location: 'Virtual Consultation',
    status: 'upcoming',
    reason: 'Skin treatment follow-up',
    consultationFee: 120
  },
  {
    id: 3,
    doctorName: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrics',
    date: '2026-02-20',
    time: '11:00 AM',
    type: 'In-person',
    location: 'Children\'s Health Clinic, Suite 201',
    status: 'upcoming',
    reason: 'Child vaccination',
    consultationFee: 100
  },
  {
    id: 4,
    doctorName: 'Dr. James Wilson',
    specialty: 'Orthopedics',
    date: '2026-01-28',
    time: '9:00 AM',
    type: 'In-person',
    location: 'Sports Medicine Center',
    status: 'completed',
    reason: 'Knee pain consultation',
    consultationFee: 180
  },
  {
    id: 5,
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    date: '2026-01-15',
    time: '3:00 PM',
    type: 'In-person',
    location: 'City Medical Center, Room 305',
    status: 'completed',
    reason: 'Annual physical examination',
    consultationFee: 150
  },
  {
    id: 6,
    doctorName: 'Dr. Robert Martinez',
    specialty: 'General Medicine',
    date: '2025-12-20',
    time: '1:00 PM',
    type: 'Video Call',
    location: 'Virtual Consultation',
    status: 'completed',
    reason: 'Cold and flu symptoms',
    consultationFee: 80
  }
];

function Appointments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: apiAppointments, isLoading } = useAppointments(user?.id);
  const cancelMutation = useCancelAppointment();
  const [cancellingId, setCancellingId] = useState(null);

  // Use API data or empty array
  const appointments = apiAppointments || [];

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setCancellingId(appointmentId);
      try {
        await cancelMutation.mutateAsync(appointmentId);
        alert('Appointment cancelled successfully');
      } catch (error) {
        alert('Failed to cancel appointment');
      } finally {
        setCancellingId(null);
      }
    }
  };

  const handleReschedule = (appointment) => {
    // Navigate to booking page with pre-filled data
    navigate('/book', { state: { reschedule: true, appointment } });
  };

  // Separate and sort appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments
    ?.filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate >= today && apt.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)) || [];

  const pastAppointments = appointments
    ?.filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate < today || apt.status === 'completed';
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)) || [];

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <div>
          <h1>My Appointments</h1>
          <p>Manage your scheduled and past appointments</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/book')}>
          + Book New Appointment
        </button>
      </div>

      <div className="appointments-stats">
        <div className="stat-card">
          <div className="stat-number">{upcomingAppointments.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{pastAppointments.length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{appointments.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      <div className="appointments-sections">
        {/* Upcoming Appointments */}
        <section className="appointments-section">
          <div className="section-header">
            <h2>📅 Upcoming Appointments</h2>
            <span className="count-badge">{upcomingAppointments.length}</span>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="appointments-grid">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="appointment-card upcoming">
                  <div className="appointment-header-card">
                    <div className="doctor-info">
                      <div className="doctor-avatar">
                        {apt.doctorName.split(' ')[1]?.[0] || apt.doctorName[0]}
                      </div>
                      <div>
                        <h3>{apt.doctorName}</h3>
                        <p className="specialty">{apt.specialty}</p>
                      </div>
                    </div>
                    <span className="status-badge status-upcoming">
                      Confirmed
                    </span>
                  </div>
                  
                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <div>
                        <strong>{new Date(apt.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}</strong>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🕒</span>
                      <span>{apt.time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>{apt.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">💼</span>
                      <span>{apt.type}</span>
                    </div>
                  </div>

                  {apt.reason && (
                    <div className="appointment-reason">
                      <strong>Reason:</strong> {apt.reason}
                    </div>
                  )}

                  <div className="appointment-footer">
                    <div className="consultation-fee">
                      Fee: <strong>${apt.consultationFee}</strong>
                    </div>
                  </div>

                  <div className="appointment-actions">
                    <button 
                      className="btn-reschedule"
                      onClick={() => handleReschedule(apt)}
                    >
                      🔄 Reschedule
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => handleCancel(apt.id)}
                      disabled={cancellingId === apt.id}
                    >
                      {cancellingId === apt.id ? 'Cancelling...' : '❌ Cancel'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No Upcoming Appointments</h3>
              <p>You don't have any scheduled appointments at the moment.</p>
              <button className="btn-primary" onClick={() => navigate('/book')}>
                Book an Appointment
              </button>
            </div>
          )}
        </section>

        {/* Past Appointments */}
        <section className="appointments-section">
          <div className="section-header">
            <h2>✅ Past Appointments</h2>
            <span className="count-badge">{pastAppointments.length}</span>
          </div>
          
          {pastAppointments.length > 0 ? (
            <div className="past-appointments-list">
              {pastAppointments.map((apt) => (
                <div key={apt.id} className="past-appointment-item">
                  <div className="past-appointment-content">
                    <div className="appointment-summary">
                      <div className="doctor-info-compact">
                        <div className="doctor-avatar-sm">
                          {apt.doctorName.split(' ')[1]?.[0] || apt.doctorName[0]}
                        </div>
                        <div>
                          <h4>{apt.doctorName}</h4>
                          <p className="specialty">{apt.specialty}</p>
                        </div>
                      </div>
                      <div className="past-details">
                        <div className="past-date">
                          <span className="detail-icon-sm">📅</span>
                          <span>{new Date(apt.date).toLocaleDateString('en-US', { 
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </div>
                        <div className="past-time">
                          <span className="detail-icon-sm">🕒</span>
                          <span>{apt.time}</span>
                        </div>
                      </div>
                    </div>
                    {apt.reason && (
                      <div className="past-reason">
                        <strong>Reason:</strong> {apt.reason}
                      </div>
                    )}
                  </div>
                  <div className="past-actions">
                    <button className="btn-view-records">
                      📄 View Records
                    </button>
                    <button 
                      className="btn-book-again"
                      onClick={() => handleReschedule(apt)}
                    >
                      🔄 Book Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <h3>No Past Appointments</h3>
              <p>Your appointment history will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Appointments;
