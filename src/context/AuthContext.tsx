
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { useEmployees } from './EmployeeContext';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  login: (email: string, password: string) => boolean; // Changed return type to boolean
  logout: () => void;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Mock users for development
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'password',
    role: 'manager' as const,
  },
  {
    id: '3',
    name: 'Employee User',
    email: 'employee@example.com',
    password: 'password',
    role: 'employee' as const,
  },
];

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { getEmployeeByEmail } = useEmployees();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('ems-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Check permissions
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'admin' || user?.role === 'manager';
  const isAuthenticated = !!user;

  // Login function
  const login = (email: string, password: string): boolean => {
    // In a real app, this would be an API call
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('ems-user', JSON.stringify(userWithoutPassword));
      toast.success('Login successful');
      
      // Verify if employee exists in the system
      const employeeExists = getEmployeeByEmail(email);
      if (!employeeExists && userWithoutPassword.role === 'employee') {
        toast.warning('Your employee profile is incomplete. Please contact HR.');
      }
      
      return true;
    } else {
      toast.error('Invalid email or password');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('ems-user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isManager,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
