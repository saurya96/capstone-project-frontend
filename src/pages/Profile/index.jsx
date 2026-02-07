import { useReducer, useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import './Profile.css';

// Sample medical history data
const SAMPLE_MEDICAL_HISTORY = [
  {
    id: 1,
    condition: 'Hypertension',
    diagnosedDate: '2024-03-15',
    status: 'Ongoing',
    notes: 'Blood pressure monitoring required'
  },
  {
    id: 2,
    condition: 'Type 2 Diabetes',
    diagnosedDate: '2023-11-20',
    status: 'Managed',
    notes: 'Diet control and medication'
  },
  {
    id: 3,
    condition: 'Seasonal Allergies',
    diagnosedDate: '2020-05-10',
    status: 'Recurring',
    notes: 'Spring allergies to pollen'
  }
];

const ALLERGIES = ['Penicillin', 'Peanuts', 'Latex'];
const MEDICATIONS = ['Lisinopril 10mg', 'Metformin 500mg'];

// Form reducer for complex state management
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value
      };
    case 'UPDATE_MULTIPLE':
      return {
        ...state,
        ...action.fields
      };
    case 'RESET':
      return action.initialData;
    case 'CALCULATE_AGE':
      if (state.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(state.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return {
          ...state,
          age: age >= 0 ? age : ''
        };
      }
      return state;
    default:
      return state;
  }
};

function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form state with useReducer
  const getInitialFormState = () => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '(555) 123-4567',
    dateOfBirth: user?.dateOfBirth || '1990-05-15',
    age: user?.age || 35,
    address: typeof user?.address === 'string' 
      ? user.address 
      : user?.address?.street 
        ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}`
        : '123 Main Street, New York, NY 10001',
    emergencyContact: typeof user?.emergencyContact === 'string'
      ? user.emergencyContact
      : user?.emergencyContact?.name
        ? `${user.emergencyContact.name} - ${user.emergencyContact.phone}`
        : 'Jane Doe - (555) 987-6543',
    bloodType: user?.bloodGroup || user?.bloodType || 'A+',
    insurance: user?.insurance || 'Blue Cross Blue Shield',
    insuranceId: user?.insuranceId || 'BCBS-123456789'
  });

  const [formData, dispatch] = useReducer(formReducer, getInitialFormState());

  // Calculate age when date of birth changes
  useEffect(() => {
    if (isEditing && formData.dateOfBirth) {
      dispatch({ type: 'CALCULATE_AGE' });
    }
  }, [formData.dateOfBirth, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_FIELD', field: name, value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Parse address string into structured format
      const addressParts = formData.address.split(',').map(s => s.trim());
      const structuredAddress = addressParts.length >= 3 ? {
        street: addressParts[0],
        city: addressParts[1],
        state: addressParts[2].split(' ')[0],
        zipCode: addressParts[2].split(' ')[1] || ''
      } : user?.address || { street: '', city: '', state: '', zipCode: '' };
      
      // Parse emergency contact string into structured format
      const emergencyParts = formData.emergencyContact.split(' - ');
      const structuredEmergency = emergencyParts.length >= 2 ? {
        name: emergencyParts[0],
        phone: emergencyParts[1],
        relationship: user?.emergencyContact?.relationship || 'Emergency Contact'
      } : user?.emergencyContact || { name: '', phone: '', relationship: '' };
      
      // Prepare data with structured fields
      const updatedData = {
        ...formData,
        address: structuredAddress,
        emergencyContact: structuredEmergency,
        bloodGroup: formData.bloodType
      };
      
      // Update profile using auth context (which now handles backend update)
      const result = await updateProfile(updatedData);
      
      if (result.success) {
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    dispatch({ type: 'RESET', initialData: getInitialFormState() });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Calculate member duration
  const getMemberDuration = () => {
    const memberSince = new Date('2025-01-15');
    const now = new Date();
    const months = (now.getFullYear() - memberSince.getFullYear()) * 12 + 
                   (now.getMonth() - memberSince.getMonth());
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''}`;
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your personal information and medical history</p>
        </div>
        {showSuccess && (
          <div className="success-message">
            ✅ Profile updated successfully!
          </div>
        )}
      </div>

      <div className="profile-layout">
        {/* Main Profile Section */}
        <div className="profile-main">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {formData.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="profile-basic-info">
                <h2>{formData.name}</h2>
                <p>{formData.email}</p>
                <div className="profile-badges">
                  <span className="user-role">Patient</span>
                  <span className="member-badge">Member for {getMemberDuration()}</span>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="btn-edit-profile"
                  aria-label="Edit profile"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
              <button
                className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                👤 Personal Info
              </button>
              <button
                className={`tab-btn ${activeTab === 'medical' ? 'active' : ''}`}
                onClick={() => setActiveTab('medical')}
              >
                🏥 Medical History
              </button>
            </div>

            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dateOfBirth">Date of Birth *</label>
                      <input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="age">Age</label>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        readOnly
                        disabled
                        className="computed-field"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address *</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows="3"
                      placeholder="Enter your full address"
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Emergency Contact</h3>
                  
                  <div className="form-group">
                    <label htmlFor="emergencyContact">Emergency Contact *</label>
                    <input
                      id="emergencyContact"
                      name="emergencyContact"
                      type="text"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Name and phone number"
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Insurance Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="insurance">Insurance Provider</label>
                      <input
                        id="insurance"
                        name="insurance"
                        type="text"
                        value={formData.insurance}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Insurance company name"
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
                        disabled={!isEditing}
                        placeholder="Policy number"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bloodType">Blood Type</label>
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                {isEditing && (
                  <div className="profile-actions">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Medical History Tab */}
            {activeTab === 'medical' && (
              <div className="medical-history-content">
                <div className="medical-section">
                  <div className="section-header-med">
                    <h3>🩺 Medical Conditions</h3>
                    <button className="btn-add-small">+ Add Condition</button>
                  </div>
                  <div className="medical-list">
                    {SAMPLE_MEDICAL_HISTORY.map(condition => (
                      <div key={condition.id} className="medical-item">
                        <div className="medical-item-header">
                          <h4>{condition.condition}</h4>
                          <span className={`status-badge-med status-${condition.status.toLowerCase()}`}>
                            {condition.status}
                          </span>
                        </div>
                        <div className="medical-item-details">
                          <p className="diagnosed-date">
                            📅 Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="medical-notes">{condition.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="medical-section">
                  <div className="section-header-med">
                    <h3>💊 Current Medications</h3>
                    <button className="btn-add-small">+ Add Medication</button>
                  </div>
                  <div className="medications-grid">
                    {MEDICATIONS.map((med, index) => (
                      <div key={index} className="medication-badge">
                        <span>💊</span> {med}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="medical-section">
                  <div className="section-header-med">
                    <h3>⚠️ Allergies</h3>
                    <button className="btn-add-small">+ Add Allergy</button>
                  </div>
                  <div className="allergies-grid">
                    {ALLERGIES.map((allergy, index) => (
                      <div key={index} className="allergy-badge">
                        <span>⚠️</span> {allergy}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="medical-note">
                  <p>
                    <strong>Note:</strong> Keep your medical history up to date to help healthcare 
                    providers make informed decisions about your care.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="sidebar-card">
            <h3>📊 Account Statistics</h3>
            <div className="stat-item">
              <span className="stat-label">Member Since</span>
              <span className="stat-value">January 2025</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Appointments</span>
              <span className="stat-value">12</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Upcoming</span>
              <span className="stat-value">3</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Lab Reports</span>
              <span className="stat-value">5</span>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>🔐 Security & Privacy</h3>
            <button className="btn-link">🔑 Change Password</button>
            <button className="btn-link">🛡️ Two-Factor Auth</button>
            <button className="btn-link">📥 Download My Data</button>
            <button className="btn-link">🗑️ Delete Account</button>
          </div>

          <div className="sidebar-card quick-actions-sidebar">
            <h3>⚡ Quick Actions</h3>
            <button className="btn-link">📅 Book Appointment</button>
            <button className="btn-link">📄 View Records</button>
            <button className="btn-link">💊 Refill Prescription</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
