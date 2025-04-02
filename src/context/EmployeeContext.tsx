import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

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
}

interface EmployeeContextProps {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
  getEmployeeByEmail: (email: string) => Employee | undefined;
  loading: boolean;
}

// Create the context
const EmployeeContext = createContext<EmployeeContextProps | undefined>(undefined);

// Mock data
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+237 123 456 789',
    department: 'Administrative Department',
    position: 'Administrator',
    joinDate: '2022-01-15',
    status: 'active',
    salary: 1500000,
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    phone: '+237 123 456 790',
    department: 'Marketing Department',
    position: 'Marketing Manager',
    joinDate: '2022-02-01',
    status: 'active',
    salary: 1200000,
  },
  {
    id: '3',
    name: 'Employee User',
    email: 'employee@example.com',
    phone: '+237 123 456 791',
    department: 'Financial Department',
    position: 'Accountant',
    joinDate: '2022-03-10',
    status: 'active',
    salary: 800000,
  },
  {
    id: '4',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+237 123 456 792',
    department: 'Marketing Department',
    position: 'Marketing Specialist',
    joinDate: '2022-04-15',
    status: 'active',
    salary: 750000,
  },
  {
    id: '5',
    name: 'Michael Smith',
    email: 'michael@example.com',
    phone: '+237 123 456 793',
    department: 'Service Center Department',
    position: 'Customer Service Rep',
    joinDate: '2022-05-20',
    status: 'on_leave',
    salary: 650000,
  },
];

// Helper function to get unique departments
export const getDepartments = (): string[] => {
  // Get all departments from localStorage or mock data
  const storedEmployees = localStorage.getItem('ems-employees');
  const employees = storedEmployees ? JSON.parse(storedEmployees) : mockEmployees;
  
  // Extract unique departments
  const departments = Array.from(
    new Set(employees.map((emp: Employee) => emp.department))
  ).sort();
  
  return departments;
};

// Create the provider component
export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Load mock data or from localStorage on initial render
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
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
        setEmployees(mockEmployees);
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
    try {
      const newEmployee: Employee = {
        ...employee,
        id: Date.now().toString(),
      };
      
      setEmployees(prevEmployees => [...prevEmployees, newEmployee]);
      toast.success('Employee added successfully');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };

  const updateEmployee = (id: string, updatedData: Partial<Employee>) => {
    try {
      const updatedEmployees = employees.map(employee => 
        employee.id === id ? { ...employee, ...updatedData } : employee
      );
      
      setEmployees(updatedEmployees);
      toast.success('Employee updated successfully');
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    }
  };

  const deleteEmployee = (id: string) => {
    try {
      const filteredEmployees = employees.filter(employee => employee.id !== id);
      setEmployees(filteredEmployees);
      toast.success('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const getEmployee = (id: string) => {
    return employees.find(employee => employee.id === id);
  };

  const getEmployeeByEmail = (email: string) => {
    return employees.find(employee => employee.email.toLowerCase() === email.toLowerCase());
  };

  // Provide the context value
  return (
    <EmployeeContext.Provider
      value={{
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployee,
        getEmployeeByEmail,
        loading,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

// Create a custom hook to use the context
export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
