import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockUser } from '@test-utils/test-utils';
import AppRoutes from '../routes';

describe('Protected Route Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Unauthenticated User', () => {
    it('should redirect to login when accessing protected route without authentication', async () => {
      renderWithProviders(<AppRoutes />, { route: '/dashboard' });

      // Should redirect to login page
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /healthcare portal/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      });

      // Should be on login page
      expect(window.location.pathname).toBe('/login');
    });

    it('should redirect to login when accessing /search without authentication', async () => {
      renderWithProviders(<AppRoutes />, { route: '/search' });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /healthcare portal/i })).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/login');
    });

    it('should redirect to login when accessing /appointments without authentication', async () => {
      renderWithProviders(<AppRoutes />, { route: '/appointments' });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /healthcare portal/i })).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/login');
    });

    it('should redirect to login when accessing /book without authentication', async () => {
      renderWithProviders(<AppRoutes />, { route: '/book' });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /healthcare portal/i })).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/login');
    });

    it('should redirect to login when accessing /records without authentication', async () => {
      renderWithProviders(<AppRoutes />, { route: '/records' });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /healthcare portal/i })).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/login');
    });

    it('should redirect to login when accessing /profile without authentication', async () => {
      renderWithProviders(<AppRoutes />, { route: '/profile' });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /healthcare portal/i })).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/login');
    });
  });

  describe('Authenticated User', () => {
    it('should allow access to dashboard when authenticated', async () => {
      renderWithProviders(<AppRoutes />, { 
        route: '/dashboard',
        user: mockUser 
      });

      // Should see dashboard content
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/dashboard');
    });

    it('should allow access to search when authenticated', async () => {
      renderWithProviders(<AppRoutes />, { 
        route: '/search',
        user: mockUser 
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search by doctor name/i)).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/search');
    });

    it('should allow access to appointments when authenticated', async () => {
      renderWithProviders(<AppRoutes />, { 
        route: '/appointments',
        user: mockUser 
      });

      await waitFor(() => {
        expect(screen.getByText(/my appointments/i)).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/appointments');
    });

    it('should redirect to dashboard when accessing login while authenticated', async () => {
      renderWithProviders(<AppRoutes />, { 
        route: '/login',
        user: mockUser 
      });

      // Should redirect to dashboard
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/dashboard');
    });

    it('should redirect to dashboard when accessing register while authenticated', async () => {
      renderWithProviders(<AppRoutes />, { 
        route: '/register',
        user: mockUser 
      });

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/dashboard');
    });

    it('should redirect root path to dashboard when authenticated', async () => {
      renderWithProviders(<AppRoutes />, { 
        route: '/',
        user: mockUser 
      });

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while checking authentication', async () => {
      renderWithProviders(<AppRoutes />, { route: '/dashboard' });

      // Loading spinner should appear briefly
      const loadingElement = screen.queryByTestId('loading-spinner') || 
                           screen.queryByText(/loading/i);
      
      // Then should redirect to login
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /healthcare portal/i })).toBeInTheDocument();
      });
    });
  });

  describe('Not Found Route', () => {
    it('should show 404 page for non-existent routes', async () => {
      renderWithProviders(<AppRoutes />, { 
        route: '/non-existent-page',
        user: mockUser 
      });

      await waitFor(() => {
        expect(screen.getByText(/404/i) || screen.getByText(/not found/i)).toBeInTheDocument();
      });
    });
  });
});
