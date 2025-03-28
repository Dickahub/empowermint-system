
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  salary: number;
  manager?: string;
  avatar?: string;
}

interface EmployeeContextProps {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
  loading: boolean;
}

const EmployeeContext = createContext<EmployeeContextProps | undefined>(undefined);

// Mock data for development
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    department: 'Engineering',
    position: 'Senior Developer',
    joinDate: '2020-01-15',
    status: 'active',
    salary: 85000,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    department: 'Marketing',
    position: 'Marketing Director',
    joinDate: '2019-03-10',
    status: 'active',
    salary: 92000,
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    phone: '(555) 456-7890',
    department: 'Finance',
    position: 'Financial Analyst',
    joinDate: '2021-05-22',
    status: 'active',
    salary: 78000,
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '(555) 234-5678',
    department: 'Human Resources',
    position: 'HR Manager',
    joinDate: '2018-11-05',
    status: 'on_leave',
    salary: 88000,
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: '5',
    name: 'Michael Wilson',
    email: 'michael.wilson@example.com',
    phone: '(555) 876-5432',
    department: 'Sales',
    position: 'Sales Representative',
    joinDate: '2021-02-18',
    status: 'active',
    salary: 72000,
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
  }
];

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const fetchEmployees = () => {
      // In a real app, this would be an API call
      setLoading(true);
      try {
        // Check if we have stored employees in localStorage
        const storedEmployees = localStorage.getItem('ems-employees');
        
        if (storedEmployees) {
          setEmployees(JSON.parse(storedEmployees));
        } else {
          // Use mock data for initial setup
          setEmployees(mockEmployees);
          localStorage.setItem('ems-employees', JSON.stringify(mockEmployees));
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Save to localStorage whenever employees change
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem('ems-employees', JSON.stringify(employees));
    }
  }, [employees]);

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString(), // Generate a simple unique ID
    };
    
    setEmployees(prev => [...prev, newEmployee as Employee]);
    toast.success(`${employee.name} has been added`);
  };

  const updateEmployee = (id: string, updatedFields: Partial<Employee>) => {
    setEmployees(prev => 
      prev.map(employee => 
        employee.id === id ? { ...employee, ...updatedFields } : employee
      )
    );
    toast.success(`Employee information updated`);
  };

  const deleteEmployee = (id: string) => {
    const employeeName = employees.find(e => e.id === id)?.name || 'Employee';
    setEmployees(prev => prev.filter(employee => employee.id !== id));
    toast.success(`${employeeName} has been removed`);
  };

  const getEmployee = (id: string) => {
    return employees.find(employee => employee.id === id);
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployee,
        loading,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
