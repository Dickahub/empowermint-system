import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useEmployees } from './EmployeeContext';

export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Mock users for development purposes - updated for SECEL Sarl
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@secel.cm',
    role: 'admin',
    department: 'General Management Department',
    position: 'System Administrator',
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@secel.cm',
    role: 'manager',
    department: 'Marketing Department',
    position: 'Marketing Manager',
  },
  {
    id: '3',
    name: 'Employee User',
    email: 'employee@secel.cm',
    role: 'employee',
    department: 'Financial Department',
    position: 'Accountant',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { employees, getEmployeeByEmail } = useEmployees();
  
  // Check for saved user on initial load
  useEffect(() => {
    const checkAuth = async () => {
      // First try to get session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          // We're using local data instead of Supabase for now
          const savedUser = localStorage.getItem('ems-user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            return;
          }
        } catch (error) {
          console.error('Error getting user data:', error);
        }
      }
      
      // If no session or error, fall back to local storage
      const savedUser = localStorage.getItem('ems-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // First check for admin/manager/employee from mock users
      const foundMockUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundMockUser && password === 'password') {
        setUser(foundMockUser);
        localStorage.setItem('ems-user', JSON.stringify(foundMockUser));
        toast.success(`Welcome back, ${foundMockUser.name}!`);
        return true;
      }
      
      // If not found in mock users, check for employees created by admin
      const foundEmployee = getEmployeeByEmail(email);
      
      if (foundEmployee && password === 'password') {
        // Determine role based on position (this is simplistic; you might want more robust logic)
        let role: UserRole = 'employee';
        if (foundEmployee.position.toLowerCase().includes('manager')) {
          role = 'manager';
        } else if (foundEmployee.position.toLowerCase().includes('admin')) {
          role = 'admin';
        }
        
        const userObj: User = {
          id: foundEmployee.id,
          name: foundEmployee.name,
          email: foundEmployee.email,
          role: role,
          department: foundEmployee.department,
          position: foundEmployee.position
        };
        
        setUser(userObj);
        localStorage.setItem('ems-user', JSON.stringify(userObj));
        toast.success(`Welcome, ${foundEmployee.name}!`);
        return true;
      }
      
      toast.error('Invalid email or password');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    }
  };

  const logout = async () => {
    try {
      // Try to sign out of Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out of Supabase:', error);
    }
    
    // Always clear local state
    setUser(null);
    localStorage.removeItem('ems-user');
    toast.success('You have been logged out');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager' || user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
