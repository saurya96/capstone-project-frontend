// Query key factory for consistent key management
export const queryKeys = {
  // Appointments
  appointments: {
    all: ['appointments'],
    lists: () => [...queryKeys.appointments.all, 'list'],
    list: (filters) => [...queryKeys.appointments.lists(), filters],
    details: () => [...queryKeys.appointments.all, 'detail'],
    detail: (id) => [...queryKeys.appointments.details(), id],
  },
  // Doctors
  doctors: {
    all: ['doctors'],
    lists: () => [...queryKeys.doctors.all, 'list'],
    list: (filters) => [...queryKeys.doctors.lists(), filters],
    details: () => [...queryKeys.doctors.all, 'detail'],
    detail: (id) => [...queryKeys.doctors.details(), id],
  },
  // Medical Records
  records: {
    all: ['medicalRecords'],
    vitals: () => [...queryKeys.records.all, 'vitals'],
    labs: () => [...queryKeys.records.all, 'labs'],
    prescriptions: () => [...queryKeys.records.all, 'prescriptions'],
  },
};

// Prefetch utilities for better UX
export const prefetchUtils = {
  prefetchDoctorDetails: (queryClient, doctorId) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.doctors.detail(doctorId),
      queryFn: async () => {
        // Your API call here
        const response = await fetch(`/api/doctors/${doctorId}`);
        return response.json();
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },
  
  prefetchAppointments: (queryClient) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.appointments.all,
      queryFn: async () => {
        // Your API call here
        const response = await fetch('/api/appointments');
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },
};

// Optimistic update utilities
export const optimisticUtils = {
  updateAppointmentStatus: (queryClient, appointmentId, newStatus) => {
    queryClient.setQueryData(
      queryKeys.appointments.all,
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        );
      }
    );
  },
};

// Cache invalidation utilities
export const cacheUtils = {
  invalidateAppointments: (queryClient) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.appointments.all,
    });
  },
  
  invalidateDoctors: (queryClient) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.doctors.all,
    });
  },
  
  invalidateAllMedicalData: (queryClient) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.records.all,
    });
  },
};
