
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
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
  loading: boolean;
}

const EmployeeContext = createContext<EmployeeContextProps | undefined>(undefined);

// Cameroon departments
const DEPARTMENTS = [
  'General Management',
  'Administrative',
  'Financial',
  'Logistics',
  'Consulting',
  'Marketing',
  'Service Center',
  'Training Center'
];

// Mock data with Cameroonian phone numbers and FCFA currency
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@secel.cm',
    phone: '+237 699 123 456',
    department: 'General Management',
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
    department: 'Marketing',
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
    department: 'Financial',
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
    department: 'Administrative',
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
    department: 'Service Center',
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
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('employees')
          .select('*');
        
        if (error) {
          console.error('Error fetching from Supabase:', error);
          // Fall back to localStorage
          const storedEmployees = localStorage.getItem('ems-employees');
          
          if (storedEmployees) {
            setEmployees(JSON.parse(storedEmployees));
          } else {
            // Use mock data for initial setup
            setEmployees(mockEmployees);
            localStorage.setItem('ems-employees', JSON.stringify(mockEmployees));
          }
        } else if (data && data.length > 0) {
          setEmployees(data as Employee[]);
        } else {
          // No data in Supabase, use mock data
          setEmployees(mockEmployees);
          // Store in Supabase
          const { error: insertError } = await supabase
            .from('employees')
            .insert(mockEmployees);
            
          if (insertError) {
            console.error('Error inserting mock data to Supabase:', insertError);
          }
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

  // Save to localStorage and Supabase whenever employees change
  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem('ems-employees', JSON.stringify(employees));
      
      // Update in Supabase - in a real app, you'd handle this differently for updates
      // This is simplified for the example
      const updateSupabase = async () => {
        try {
          // Clear and reinsert for simplicity
          await supabase.from('employees').delete().neq('id', '0');
          const { error } = await supabase.from('employees').insert(employees);
          if (error) console.error('Error updating Supabase:', error);
        } catch (error) {
          console.error('Error saving to Supabase:', error);
        }
      };
      
      updateSupabase();
    }
  }, [employees]);

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString(), // Generate a simple unique ID
    };
    
    try {
      const { error } = await supabase
        .from('employees')
        .insert([newEmployee]);
        
      if (error) throw error;
      
      setEmployees(prev => [...prev, newEmployee as Employee]);
      toast.success(`${employee.name} has been added`);
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
      
      // Fallback to local state if Supabase fails
      setEmployees(prev => [...prev, newEmployee as Employee]);
    }
  };

  const updateEmployee = async (id: string, updatedFields: Partial<Employee>) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(updatedFields)
        .eq('id', id);
        
      if (error) throw error;
      
      setEmployees(prev => 
        prev.map(employee => 
          employee.id === id ? { ...employee, ...updatedFields } : employee
        )
      );
      toast.success(`Employee information updated`);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
      
      // Fallback to local state if Supabase fails
      setEmployees(prev => 
        prev.map(employee => 
          employee.id === id ? { ...employee, ...updatedFields } : employee
        )
      );
    }
  };

  const deleteEmployee = async (id: string) => {
    const employeeName = employees.find(e => e.id === id)?.name || 'Employee';
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setEmployees(prev => prev.filter(employee => employee.id !== id));
      toast.success(`${employeeName} has been removed`);
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
      
      // Fallback to local state if Supabase fails
      setEmployees(prev => prev.filter(employee => employee.id !== id));
    }
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
