import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { connectApiService } from '../services/connectApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isPatient: boolean;
  isCaregiver: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
  canBookAppointments: boolean;
  canPostJobs: boolean;
  canManageUsers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // For now, we'll need to get the user ID from the token or store it separately
          // This is a simplified approach - in production you might decode the JWT to get user ID
          const userId = localStorage.getItem('user_id');
          if (userId) {
            const userProfile = await connectApiService.getProfile(userId);
            setUser(userProfile);
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_id');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await connectApiService.login(email, password);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_id', response.user.id);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await connectApiService.register(userData);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_id', response.user.id);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await connectApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      setUser(null);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User ID not found');
      
      const updatedUser = await connectApiService.updateProfile(userId, userData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  // Role-based helper functions
  const isPatient = user?.role === 'patient';
  const isCaregiver = user?.role === 'caregiver';
  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';
  
  // Permission helpers
  const canBookAppointments = isPatient || isCaregiver;
  const canPostJobs = isDoctor || isCaregiver || user?.role === 'facility';
  const canManageUsers = isAdmin;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    isPatient,
    isCaregiver,
    isDoctor,
    isAdmin,
    canBookAppointments,
    canPostJobs,
    canManageUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 