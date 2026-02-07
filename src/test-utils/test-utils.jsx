import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@contexts/AuthContext';

// Create a custom render function that includes providers
export function renderWithProviders(
  ui,
  {
    route = '/',
    user = null,
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
    ...renderOptions
  } = {}
) {
  // Set initial route
  window.history.pushState({}, 'Test page', route);

  // Mock localStorage for auth
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', 'mock-token');
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Custom matchers and utilities
export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-0123',
  dateOfBirth: '1990-01-01',
  role: 'patient',
};

export const mockDoctor = {
  id: '1',
  name: 'Dr. Sarah Smith',
  specialty: 'Cardiology',
  hospital: 'City Hospital',
  location: 'New York, NY',
  rating: 4.8,
  experience: 15,
  consultationFee: 150,
  availableToday: true,
  about: 'Experienced cardiologist specializing in heart disease.',
  education: 'MD from Harvard Medical School',
  languages: ['English', 'Spanish'],
};

export const mockAppointment = {
  id: '1',
  doctorId: '1',
  doctorName: 'Dr. Sarah Smith',
  specialty: 'Cardiology',
  date: '2026-02-15',
  time: '10:00 AM',
  type: 'in-person',
  status: 'upcoming',
  patientName: 'John Doe',
  reason: 'Regular checkup',
};

// Wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));
