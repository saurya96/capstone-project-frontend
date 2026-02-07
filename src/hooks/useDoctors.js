import { useDoctors, useDoctor } from '@services/api';

/**
 * Custom hook for searching doctors with filters
 * Provides automatic caching and loading states via React Query
 * 
 * @param {Object} filters - Search filters
 * @param {string} filters.search - Search term for name/specialty/hospital
 * @param {string} filters.specialty - Filter by specialty
 * @param {string} filters.location - Filter by location
 * @param {boolean} filters.availableToday - Filter by today's availability
 * @param {string} filters.sortBy - Sort by: 'rating', 'experience', 'fee'
 * 
 * @returns {Object} - { doctors, isLoading, isFetching, error, refetch }
 * 
 * @example
 * const { doctors, isLoading } = useDoctorSearch({
 *   specialty: 'Cardiology',
 *   location: 'New York, NY',
 *   availableToday: true,
 *   sortBy: 'rating'
 * });
 */
export const useDoctorSearch = (filters = {}) => {
  const { 
    data: doctors, 
    isLoading, 
    isFetching, 
    error,
    refetch 
  } = useDoctors(filters);

  return {
    doctors: doctors || [],
    isLoading,
    isFetching, // True when background refetch is happening
    error,
    refetch,
    hasResults: doctors && doctors.length > 0,
  };
};

/**
 * Custom hook for fetching single doctor details
 * 
 * @param {string} doctorId - The ID of the doctor to fetch
 * 
 * @returns {Object} - { doctor, isLoading, error }
 * 
 * @example
 * const { doctor, isLoading } = useDoctorDetails('123');
 */
export const useDoctorDetails = (doctorId) => {
  const { data: doctor, isLoading, error } = useDoctor(doctorId);

  return {
    doctor,
    isLoading,
    error,
  };
};

/**
 * Get unique locations from doctors list
 * Useful for location filter dropdowns
 */
export const useAvailableLocations = () => {
  const { doctors } = useDoctorSearch({});
  
  const locations = doctors
    ? [...new Set(doctors.map(doc => doc.location))].sort()
    : [];

  return locations;
};

/**
 * Get unique specialties from doctors list
 * Useful for specialty filter dropdowns
 */
export const useAvailableSpecialties = () => {
  const { doctors } = useDoctorSearch({});
  
  const specialties = doctors
    ? [...new Set(doctors.map(doc => doc.specialty))].sort()
    : [];

  return specialties;
};

/**
 * Get doctors available today
 */
export const useAvailableTodayDoctors = () => {
  return useDoctorSearch({ availableToday: true });
};

/**
 * Get top rated doctors
 */
export const useTopRatedDoctors = (limit = 5) => {
  const { doctors, isLoading } = useDoctorSearch({ sortBy: 'rating' });
  
  return {
    doctors: doctors ? doctors.slice(0, limit) : [],
    isLoading,
  };
};

export default {
  useDoctorSearch,
  useDoctorDetails,
  useAvailableLocations,
  useAvailableSpecialties,
  useAvailableTodayDoctors,
  useTopRatedDoctors,
};
