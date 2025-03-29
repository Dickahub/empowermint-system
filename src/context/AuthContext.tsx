
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

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
    department: 'General Management',
    position: 'System Administrator',
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@secel.cm',
    role: 'manager',
    department: 'Marketing',
    position: 'Marketing Manager',
  },
  {
    id: '3',
    name: 'Employee User',
    email: 'employee@secel.cm',
    role: 'employee',
    department: 'Financial',
    position: 'Accountant',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check for saved user on initial load
  useEffect(() => {
    const checkAuth = async () => {
      // First try to get session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // If we have a session, get user data from supabase
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userData && !error) {
          setUser(userData as User);
          return;
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
      // Try Supabase auth first if it's set up
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!authError && authData.user) {
        // Get user data from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (userData && !userError) {
          setUser(userData as User);
          localStorage.setItem('ems-user', JSON.stringify(userData));
          toast.success(`Welcome back, ${userData.name}!`);
          return true;
        }
      }
      
      // Fallback to mock users
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser && password === 'password') {
        setUser(foundUser);
        localStorage.setItem('ems-user', JSON.stringify(foundUser));
        toast.success(`Welcome back, ${foundUser.name}!`);
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
