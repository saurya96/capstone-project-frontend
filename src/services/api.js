import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// JSON Server API base URL - Use environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://capstone-project-backend-yki8.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('healthcare_user');
  if (user) {
    const { token } = JSON.parse(user);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Mock data for development
const mockDoctors = [
  { 
    id: '1', 
    name: 'Dr. Sarah Johnson', 
    specialty: 'Cardiology', 
    rating: 4.8, 
    experience: 15,
    location: 'New York, NY',
    hospital: 'Mount Sinai Hospital',
    education: 'Harvard Medical School',
    availableToday: true,
    nextAvailable: '2026-02-04',
    consultationFee: 150,
    languages: ['English', 'Spanish'],
    about: 'Specialized in cardiovascular diseases with focus on preventive cardiology.',
  },
  { 
    id: '2', 
    name: 'Dr. Michael Chen', 
    specialty: 'Pediatrics', 
    rating: 4.9, 
    experience: 12,
    location: 'Los Angeles, CA',
    hospital: 'UCLA Medical Center',
    education: 'Stanford Medical School',
    availableToday: false,
    nextAvailable: '2026-02-05',
    consultationFee: 120,
    languages: ['English', 'Mandarin'],
    about: 'Compassionate pediatrician specializing in child development and vaccinations.',
  },
  { 
    id: '3', 
    name: 'Dr. Emily Williams', 
    specialty: 'Dermatology', 
    rating: 4.7, 
    experience: 10,
    location: 'Chicago, IL',
    hospital: 'Northwestern Memorial Hospital',
    education: 'Johns Hopkins University',
    availableToday: true,
    nextAvailable: '2026-02-04',
    consultationFee: 180,
    languages: ['English'],
    about: 'Expert in cosmetic and medical dermatology, including skin cancer screening.',
  },
  { 
    id: '4', 
    name: 'Dr. David Martinez', 
    specialty: 'Orthopedics', 
    rating: 4.6, 
    experience: 18,
    location: 'Houston, TX',
    hospital: 'Texas Medical Center',
    education: 'Mayo Clinic',
    availableToday: true,
    nextAvailable: '2026-02-04',
    consultationFee: 200,
    languages: ['English', 'Spanish'],
    about: 'Sports medicine specialist focusing on joint replacement and arthroscopy.',
  },
  { 
    id: '5', 
    name: 'Dr. Jennifer Lee', 
    specialty: 'Psychiatry', 
    rating: 4.9, 
    experience: 14,
    location: 'New York, NY',
    hospital: 'NYU Langone Health',
    education: 'Columbia University',
    availableToday: false,
    nextAvailable: '2026-02-06',
    consultationFee: 160,
    languages: ['English', 'Korean'],
    about: 'Focused on anxiety, depression, and trauma-informed care with holistic approach.',
  },
  { 
    id: '6', 
    name: 'Dr. Robert Brown', 
    specialty: 'Neurology', 
    rating: 4.8, 
    experience: 20,
    location: 'Boston, MA',
    hospital: 'Massachusetts General Hospital',
    education: 'Harvard Medical School',
    availableToday: true,
    nextAvailable: '2026-02-04',
    consultationFee: 220,
    languages: ['English'],
    about: 'Leading neurologist specializing in stroke treatment and headache disorders.',
  },
  { 
    id: '7', 
    name: 'Dr. Lisa Anderson', 
    specialty: 'Cardiology', 
    rating: 4.7, 
    experience: 16,
    location: 'Los Angeles, CA',
    hospital: 'Cedars-Sinai Medical Center',
    education: 'Yale School of Medicine',
    availableToday: false,
    nextAvailable: '2026-02-05',
    consultationFee: 170,
    languages: ['English', 'French'],
    about: 'Interventional cardiologist with expertise in heart disease prevention.',
  },
  { 
    id: '8', 
    name: 'Dr. James Wilson', 
    specialty: 'Pediatrics', 
    rating: 4.8, 
    experience: 11,
    location: 'Chicago, IL',
    hospital: 'Lurie Children\'s Hospital',
    education: 'University of Chicago',
    availableToday: true,
    nextAvailable: '2026-02-04',
    consultationFee: 110,
    languages: ['English'],
    about: 'Pediatrician dedicated to newborn care and childhood illness management.',
  },
];

const mockAppointments = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    date: '2026-02-15',
    time: '10:00 AM',
    status: 'upcoming',
    type: 'In-person',
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Pediatrics',
    date: '2026-01-28',
    time: '2:30 PM',
    status: 'completed',
    type: 'Telemedicine',
  },
];

// Custom hooks for data fetching
export const useAppointments = (userId) => {
  return useQuery({
    queryKey: ['appointments', userId],
    queryFn: async () => {
      try {
        let url = '/appointments';
        // Filter by userId if provided
        if (userId) {
          url += `?userId=${userId}`;
        }
        const response = await api.get(url);
        return response.data;
      } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
    },
  });
};

export const useDoctors = (filters = {}) => {
  return useQuery({
    queryKey: ['doctors', filters],
    queryFn: async () => {
      try {
        const response = await api.get('/doctors');
        let results = response.data;
        
        // Filter by search term (name or specialty)
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          results = results.filter(doc => 
            doc.name.toLowerCase().includes(searchLower) ||
            doc.specialty.toLowerCase().includes(searchLower) ||
            doc.hospital?.toLowerCase().includes(searchLower)
          );
        }
        
        // Filter by specialty
        if (filters.specialty && filters.specialty !== '') {
          results = results.filter(doc => 
            doc.specialty.toLowerCase() === filters.specialty.toLowerCase()
          );
        }
        
        // Filter by location
        if (filters.location) {
          const locationLower = filters.location.toLowerCase();
          results = results.filter(doc => 
            doc.location?.toLowerCase().includes(locationLower)
          );
        }
        
        // Filter by availability
        if (filters.availableToday) {
          results = results.filter(doc => doc.availability === true);
        }
        
        // Sort by rating (default)
        if (filters.sortBy === 'rating') {
          results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (filters.sortBy === 'experience') {
          results.sort((a, b) => (b.experience || 0) - (a.experience || 0));
        } else if (filters.sortBy === 'fee') {
          results.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
        }
        
        return results;
      } catch (error) {
        console.error('Error fetching doctors:', error);
        // Fallback to mock data if backend fails
        return mockDoctors;
      }
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache persists for 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Get single doctor details
export const useDoctor = (doctorId) => {
  return useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      try {
        const response = await api.get(`/doctors/${doctorId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching doctor:', error);
        // Fallback to mock data
        return mockDoctors.find(doc => doc.id === doctorId);
      }
    },
    enabled: !!doctorId, // Only run query if doctorId exists
    staleTime: 10 * 60 * 1000,
  });
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointmentData) => {
      try {
        // Store appointment in backend
        const newAppointment = {
          ...appointmentData,
          id: Date.now().toString(),
          status: 'upcoming',
          createdAt: new Date().toISOString(),
        };
        
        const response = await api.post('/appointments', newAppointment);
        return response.data;
      } catch (error) {
        console.error('Error booking appointment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointmentId) => {
      try {
        // Update appointment status in backend
        const response = await api.patch(`/appointments/${appointmentId}`, {
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
        });
        return response.data;
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// Medical Records API functions
export const useVitals = (userId) => {
  return useQuery({
    queryKey: ['vitals', userId],
    queryFn: async () => {
      try {
        const response = await api.get('/vitals', {
          params: { userId }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching vitals:', error);
        return [];
      }
    },
    enabled: !!userId,
  });
};

export const useAddVital = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vitalData) => {
      const newVital = {
        ...vitalData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const response = await api.post('/vitals', newVital);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'] });
    },
  });
};

export const useLabTests = (userId) => {
  return useQuery({
    queryKey: ['labTests', userId],
    queryFn: async () => {
      try {
        const response = await api.get('/labTests', {
          params: { userId }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching lab tests:', error);
        return [];
      }
    },
    enabled: !!userId,
  });
};

export const useAddLabTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (labTestData) => {
      const newLabTest = {
        ...labTestData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const response = await api.post('/labTests', newLabTest);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labTests'] });
    },
  });
};

export const usePrescriptions = (userId) => {
  return useQuery({
    queryKey: ['prescriptions', userId],
    queryFn: async () => {
      try {
        const response = await api.get('/prescriptions', {
          params: { userId }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        return [];
      }
    },
    enabled: !!userId,
  });
};

export const useAddPrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prescriptionData) => {
      const newPrescription = {
        ...prescriptionData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const response = await api.post('/prescriptions', newPrescription);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });
};

export default api;
