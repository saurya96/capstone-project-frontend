import { useState, useMemo } from 'react';
import { useDoctors } from '@services/api';
import { Link } from 'react-router-dom';
import './Search.css';

function Search() {
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [availableToday, setAvailableToday] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Build filters object for React Query
  const filters = useMemo(() => ({
    search: searchTerm,
    specialty: specialty,
    location: location,
    availableToday: availableToday,
    sortBy: sortBy,
  }), [searchTerm, specialty, location, availableToday, sortBy]);

  // Fetch doctors with React Query (with caching)
  const { data: doctors, isLoading, isFetching, error } = useDoctors(filters);

  const specialties = [
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Neurology',
  ];

  const locations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Boston, MA',
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setSpecialty('');
    setLocation('');
    setAvailableToday(false);
    setSortBy('rating');
  };

  const hasActiveFilters = searchTerm || specialty || location || availableToday;

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Find a Doctor</h1>
        <p>Search healthcare specialists by name, specialty, or location</p>
        {doctors && !isLoading && (
          <div className="results-count">
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
            {isFetching && <span className="fetching-indicator"> • Updating...</span>}
          </div>
        )}
      </div>

      <div className="search-filters-container">
        {/* Main Search Bar */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search doctors by name, specialty, or hospital"
              autoComplete="off"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
          <button 
            className="btn btn-secondary filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="advanced-filters"
            type="button"
          >
            <span>Filters</span>
            {hasActiveFilters && <span className="filter-badge" aria-label={`${[
              specialty, location, availableToday
            ].filter(Boolean).length} active filters`}>{
              [specialty, location, availableToday].filter(Boolean).length
            }</span>}
          </button>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {showFilters && (
          <div className="advanced-filters" id="advanced-filters" role="region" aria-label="Advanced search filters">
            <div className="filter-group">
              <label htmlFor="specialty-filter">Specialty</label>
              <select 
                id="specialty-filter"
                value={specialty} 
                onChange={(e) => setSpecialty(e.target.value)}
                className="filter-select"
                aria-label="Filter by specialty"
              >
                <option value="">All Specialties</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="location-filter">Location</label>
              <select 
                id="location-filter"
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="filter-select"
                aria-label="Filter by location"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-filter">Sort By</label>
              <select 
                id="sort-filter"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
                aria-label="Sort results by"
              >
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experience</option>
                <option value="fee">Lowest Fee</option>
              </select>
            </div>

            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={availableToday}
                  onChange={(e) => setAvailableToday(e.target.checked)}
                  aria-label="Show only doctors available today"
                />
                <span>Available Today</span>
              </label>
            </div>

            {hasActiveFilters && (
              <button 
                className="btn-clear-filters"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Quick Specialty Filters */}
        <div className="specialty-filters">
          <button
            className={`specialty-chip ${specialty === '' ? 'active' : ''}`}
            onClick={() => setSpecialty('')}
          >
            All
          </button>
          {specialties.map((spec) => (
            <button
              key={spec}
              className={`specialty-chip ${specialty === spec ? 'active' : ''}`}
              onClick={() => setSpecialty(spec)}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="search-results">
        {error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>Unable to fetch doctors. Please try again.</p>
          </div>
        ) : isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Searching doctors...</p>
          </div>
        ) : doctors && doctors.length > 0 ? (
          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-card-header">
                  <div className="doctor-avatar">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {doctor.availableToday && (
                    <span className="availability-badge available">
                      ✓ Available Today
                    </span>
                  )}
                </div>

                <div className="doctor-info">
                  <h3>{doctor.name}</h3>
                  <p className="doctor-specialty">{doctor.specialty}</p>
                  
                  <div className="doctor-meta">
                    <span className="rating">⭐ {doctor.rating}</span>
                    <span className="experience">{doctor.experience} years</span>
                  </div>

                  <div className="doctor-details">
                    <div className="detail-row">
                      <span className="detail-icon">🏥</span>
                      <span className="detail-text">{doctor.hospital}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{doctor.location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">💰</span>
                      <span className="detail-text">${doctor.consultationFee} consultation</span>
                    </div>
                  </div>

                  {!doctor.availableToday && (
                    <div className="next-available">
                      Next available: {new Date(doctor.nextAvailable).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>

                <div className="doctor-actions">
                  <Link 
                    to="/book" 
                    state={{ doctor }} 
                    className="btn btn-primary btn-block"
                  >
                    Book Appointment
                  </Link>
                  <button className="btn-view-profile">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <div className="empty-icon">🔍</div>
            <h3>No doctors found</h3>
            <p>Try adjusting your search criteria or filters</p>
            {hasActiveFilters && (
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
