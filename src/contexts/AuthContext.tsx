import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, AuthResponse, OfficerLoginCredentials } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  officerLogin: (credentials: OfficerLoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  // programmatically set auth state (token + user)
  setAuth: (auth: AuthResponse) => void;
  // update user data without affecting token
  updateUser: (userData: Partial<User>) => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authService.login(credentials);
      
      setToken(response.token);
      setUser(response.user);
      
      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const officerLogin = async (credentials: OfficerLoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.officerLogin(credentials);
      
      if (response.success && response.data.token) {
        // Create a User object from officer data
        const officerUser: User = {
          id: response.data.officerId || '',
          email: response.data.email || '',
          name: response.data.name || '',
          role: response.data.role as any || 'OFFICER',
          employeeId: response.data.employeeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setToken(response.data.token);
        setUser(officerUser);
        
        // Store in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(officerUser));
      } else {
        throw new Error(response.message || 'Officer login failed');
      }
    } catch (error) {
      console.error('Officer login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setAuth = (auth: AuthResponse) => {
    setToken(auth.token);
    setUser(auth.user);
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth.user));
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    officerLogin,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
    setAuth,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
