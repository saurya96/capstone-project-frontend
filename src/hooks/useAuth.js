// Custom hook to check authentication status
import { useAuth } from '@contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to ensure user is authenticated
 * Redirects to login if not authenticated
 */
export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return { isAuthenticated, loading };
};

/**
 * Hook to redirect authenticated users
 * Useful for login/register pages
 */
export const useRedirectIfAuthenticated = (redirectTo = '/dashboard') => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo]);

  return { isAuthenticated, loading };
};

/**
 * Hook to get user role
 */
export const useUserRole = () => {
  const { user } = useAuth();
  return user?.role || null;
};

/**
 * Hook to check if user has specific role
 */
export const useHasRole = (requiredRole) => {
  const { user } = useAuth();
  return user?.role === requiredRole;
};
