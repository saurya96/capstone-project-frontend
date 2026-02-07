import { useAuth } from '@contexts/AuthContext';
import { useAppointments } from '@services/api';
import { Link } from 'react-router-dom';
import './Dashboard.css';

// Sample health tips
const HEALTH_TIPS = [
  {
    id: 1,
    icon: '💧',
    title: 'Stay Hydrated',
    description: 'Drink at least 8 glasses of water daily to maintain optimal health.',
    category: 'Wellness'
  },
  {
    id: 2,
    icon: '🏃',
    title: 'Regular Exercise',
    description: 'Aim for 30 minutes of moderate exercise most days of the week.',
    category: 'Fitness'
  },
  {
    id: 3,
    icon: '😴',
    title: 'Quality Sleep',
    description: 'Get 7-9 hours of quality sleep each night for better health.',
    category: 'Lifestyle'
  },
  {
    id: 4,
    icon: '🥗',
    title: 'Balanced Diet',
    description: 'Include fruits, vegetables, and whole grains in your daily meals.',
    category: 'Nutrition'
  }
];

function Dashboard() {
  const { user } = useAuth();
  const { data: appointments, isLoading } = useAppointments(user?.id);

  // Calculate upcoming appointments from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status !== 'cancelled';
  }).sort((a, b) => new Date(a.date) - new Date(b.date)) || [];

  const nextAppointment = upcomingAppointments[0];
  const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate days until next appointment
  const getDaysUntil = (dateString) => {
    const aptDate = new Date(dateString);
    const today = new Date();
    const diffTime = aptDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `in ${diffDays} days`;
    return `on ${aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="dashboard">
      {/* Welcome Section with Profile Summary */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>{getGreeting()}, {user?.name}! 👋</h1>
          <p className="welcome-subtitle">Here's your health dashboard overview for today</p>
        </div>
        <div className="profile-summary">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <Link to="/profile" className="edit-profile-link">Edit Profile →</Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon-circle">📅</div>
          <div className="stat-content">
            <h3>{upcomingAppointments.length}</h3>
            <p>Upcoming Appointments</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon-circle">✅</div>
          <div className="stat-content">
            <h3>{completedAppointments}</h3>
            <p>Completed Visits</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon-circle">💊</div>
          <div className="stat-content">
            <h3>2</h3>
            <p>Active Prescriptions</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon-circle">📄</div>
          <div className="stat-content">
            <h3>5</h3>
            <p>Lab Reports</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-main-grid">
        {/* Next Appointment Card */}
        <div className="dashboard-card next-appointment-card">
          <div className="card-header">
            <h2>📅 Next Appointment</h2>
            <Link to="/appointments" className="card-link">View All</Link>
          </div>

          {nextAppointment ? (
            <div className="next-appointment-content">
              <div className="appointment-badge">
                {getDaysUntil(nextAppointment.date)}
              </div>
              <div className="appointment-main">
                <div className="doctor-avatar-dash">
                  {nextAppointment.doctorName.split(' ')[1]?.[0] || nextAppointment.doctorName[0]}
                </div>
                <div className="appointment-details-dash">
                  <h3>{nextAppointment.doctorName}</h3>
                  <p className="specialty-badge">{nextAppointment.specialty}</p>
                  <div className="appointment-meta">
                    <span>📅 {new Date(nextAppointment.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                    <span>🕒 {nextAppointment.time}</span>
                    <span>📍 {nextAppointment.type || 'In-person'}</span>
                  </div>
                </div>
              </div>
              <div className="appointment-actions-dash">
                <Link to="/appointments" className="btn-view-details">View Details</Link>
                <button className="btn-reschedule-dash">Reschedule</button>
              </div>
            </div>
          ) : (
            <div className="empty-appointment">
              <div className="empty-icon">📅</div>
              <p>No upcoming appointments</p>
              <Link to="/book" className="btn-book-now">Book Appointment</Link>
            </div>
          )}
        </div>

        {/* Quick Navigation Cards */}
        <div className="dashboard-card quick-nav-card">
          <h2>🚀 Quick Actions</h2>
          <div className="quick-nav-grid">
            <Link to="/search" className="nav-action-card" aria-label="Find a doctor">
              <div className="nav-icon">🔍</div>
              <h3>Find Doctors</h3>
              <p>Search specialists</p>
            </Link>

            <Link to="/book" className="nav-action-card" aria-label="Book an appointment">
              <div className="nav-icon">📅</div>
              <h3>Book Visit</h3>
              <p>Schedule appointment</p>
            </Link>

            <Link to="/records" className="nav-action-card" aria-label="View medical records">
              <div className="nav-icon">📄</div>
              <h3>Records</h3>
              <p>View health data</p>
            </Link>

            <Link to="/appointments" className="nav-action-card" aria-label="My appointments">
              <div className="nav-icon">📋</div>
              <h3>Appointments</h3>
              <p>Manage visits</p>
            </Link>
          </div>
        </div>

        {/* Health Tips Section */}
        <div className="dashboard-card health-tips-card">
          <div className="card-header">
            <h2>💡 Health Tips</h2>
            <span className="tips-badge">Daily Wellness</span>
          </div>
          <div className="health-tips-grid">
            {HEALTH_TIPS.map(tip => (
              <div key={tip.id} className="health-tip-item" role="article">
                <div className="tip-icon">{tip.icon}</div>
                <div className="tip-content">
                  <span className="tip-category">{tip.category}</span>
                  <h3>{tip.title}</h3>
                  <p>{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card recent-activity-card">
          <h2>📊 Recent Activity</h2>
          
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <p>Loading appointments...</p>
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="activity-list">
              {upcomingAppointments.slice(0, 4).map((apt) => (
                <div key={apt.id} className="activity-item">
                  <div className="activity-icon">📅</div>
                  <div className="activity-content">
                    <h4>{apt.doctorName}</h4>
                    <p className="activity-specialty">{apt.specialty}</p>
                    <p className="activity-time">
                      {new Date(apt.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })} at {apt.time}
                    </p>
                  </div>
                  <span className="activity-badge status-upcoming">Upcoming</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent activity</p>
              <Link to="/book" className="btn-secondary">Schedule Your First Visit</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
