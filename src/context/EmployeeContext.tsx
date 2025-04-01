import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

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
}

interface EmployeeContextProps {
  employees: Employee[];
  loading: boolean;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updatedEmployee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
  getEmployeeByEmail: (email: string) => Employee | undefined;
}

const EmployeeContext = createContext<EmployeeContextProps | undefined>(undefined);

// Cameroon departments
const DEPARTMENTS = [
  'General Management Department',
  'Administrative Department',
  'Financial Department',
  'Logistics Department',
  'Consulting Department',
  'Marketing Department',
  'Service Center Department',
  'Training Center Department'
];

// Mock data with Cameroonian phone numbers and FCFA currency
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@secel.cm',
    phone: '+237 699 123 456',
    department: 'General Management Department',
    position: 'General Manager',
    joinDate: '2020-01-15',
    status: 'active',
    salary: 1500000, // In FCFA
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@secel.cm',
    phone: '+237 677 987 654',
    department: 'Marketing Department',
    position: 'Marketing Director',
    joinDate: '2019-03-10',
    status: 'active',
    salary: 1200000,
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@secel.cm',
    phone: '+237 698 456 789',
    department: 'Financial Department',
    position: 'Financial Analyst',
    joinDate: '2021-05-22',
    status: 'active',
    salary: 800000,
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@secel.cm',
    phone: '+237 652 234 567',
    department: 'Administrative Department',
    position: 'HR Manager',
    joinDate: '2018-11-05',
    status: 'on_leave',
    salary: 950000,
  },
  {
    id: '5',
    name: 'Michael Wilson',
    email: 'michael.wilson@secel.cm',
    phone: '+237 671 876 543',
    department: 'Service Center Department',
    position: 'Service Representative',
    joinDate: '2021-02-18',
    status: 'active',
    salary: 750000,
  }
];

export const getDepartments = () => DEPARTMENTS;

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        // For now, just use mock data since the Supabase tables might not be ready
        const storedEmployees = localStorage.getItem('ems-employees');
        if (storedEmployees) {
          setEmployees(JSON.parse(storedEmployees));
        } else {
          setEmployees(mockEmployees);
          localStorage.setItem('ems-employees', JSON.stringify(mockEmployees));
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employee data');
        
        // Fall back to mock data if needed
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

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString(), // Generate a simple unique ID
    };
    
    try {
      setEmployees(prev => [...prev, newEmployee as Employee]);
      localStorage.setItem('ems-employees', JSON.stringify([...employees, newEmployee]));
      toast.success(`${employee.name} has been added`);
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };

  const updateEmployee = async (id: string, updatedEmployee: Partial<Employee>) => {
    try {
      const updatedEmployees = employees.map(employee => 
        employee.id === id ? { ...employee, ...updatedEmployee } : employee
      );
      
      setEmployees(updatedEmployees);
      localStorage.setItem('ems-employees', JSON.stringify(updatedEmployees));
      toast.success(`Employee information updated`);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    }
  };

  const deleteEmployee = async (id: string) => {
    const employeeName = employees.find(e => e.id === id)?.name || 'Employee';
    
    try {
      const filteredEmployees = employees.filter(employee => employee.id !== id);
      setEmployees(filteredEmployees);
      localStorage.setItem('ems-employees', JSON.stringify(filteredEmployees));
      toast.success(`${employeeName} has been removed`);
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const getEmployee = (id: string) => {
    return employees.find(emp => emp.id === id);
  };
  
  const getEmployeeByEmail = (email: string) => {
    return employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loading,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployee,
        getEmployeeByEmail,
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
