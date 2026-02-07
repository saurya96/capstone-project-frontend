import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://capstone-project-backend-fl18.vercel.app';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('healthcare_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('healthcare_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Normalize email (trim and lowercase)
      const normalizedEmail = email?.trim().toLowerCase();
      const normalizedPassword = password?.trim();
      
      console.log('🔵 Attempting login for:', normalizedEmail);
      console.log('🔑 Password length:', normalizedPassword?.length);
      
      // Fetch users from backend
      const response = await axios.get(`${API_BASE_URL}/users`);
      const users = response.data;
      
      console.log('📊 Total users in backend:', users.length);
      console.log('📧 All registered emails:', users.map(u => u.email));

      // First check if email exists (case-insensitive)
      const userWithEmail = users.find(u => u.email.toLowerCase() === normalizedEmail);
      
      if (!userWithEmail) {
        console.log('❌ Email not found:', email);
        throw new Error('Email not found. Please check your email or register.');
      }

      console.log('✓ Email found:', normalizedEmail);
      console.log('🔐 Stored password:', userWithEmail.password);
      console.log('🔐 Entered password:', normalizedPassword);
      
      // Check password match
      if (userWithEmail.password !== normalizedPassword) {
        console.log('❌ Password does not match');
        throw new Error('Invalid password. Please try again.');
      }

      console.log('✅ Login successful');
      const { password: _, ...userWithoutPassword } = userWithEmail;
      setUser(userWithoutPassword);
      localStorage.setItem('healthcare_user', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials and try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔵 Starting registration for:', userData.email);
      
      // Fetch existing users from backend
      const response = await axios.get(`${API_BASE_URL}/users`);
      const users = response.data;
      console.log('📊 Current users count:', users.length);
      
      // Check if email already exists
      if (users.some(u => u.email === userData.email)) {
        throw new Error('Email already registered');
      }

      // Create new user object
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        bloodGroup: '',
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        },
        createdAt: new Date().toISOString(),
      };

      console.log('📤 Sending new user to backend:', newUser.email, 'ID:', newUser.id);

      // Save to backend
      const createResponse = await axios.post(`${API_BASE_URL}/users`, newUser);
      const createdUser = createResponse.data;
      
      console.log('✅ User created successfully in backend:', createdUser.id);

      // Auto-login after registration
      const { password: _, ...userWithoutPassword } = createdUser;
      setUser(userWithoutPassword);
      localStorage.setItem('healthcare_user', JSON.stringify(userWithoutPassword));

      console.log('✅ Registration complete, user logged in');
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthcare_user');
  };

  const updateProfile = async (updatedData) => {
    try {
      // Update user in backend
      const updatedUser = { ...user, ...updatedData };
      await axios.put(`${API_BASE_URL}/users/${user.id}`, updatedUser);
      
      setUser(updatedUser);
      localStorage.setItem('healthcare_user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
