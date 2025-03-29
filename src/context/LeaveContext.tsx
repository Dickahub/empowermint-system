
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { Leave } from '@/components/LeaveManagement';
import { useAuth } from './AuthContext';
import { supabase } from "@/integrations/supabase/client";

interface LeaveContextProps {
  leaves: Leave[];
  addLeave: (leave: Omit<Leave, 'id' | 'createdAt'>) => Promise<void>;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  getEmployeeLeaves: (employeeId: string) => Leave[];
  getAllLeaves: () => Leave[];
  loading: boolean;
}

const LeaveContext = createContext<LeaveContextProps | undefined>(undefined);

// Mock leaves for development
const mockLeaves: Leave[] = [
  {
    id: "1",
    employeeId: "3",
    type: "annual",
    startDate: "2023-12-20",
    endDate: "2023-12-27",
    reason: "End of year vacation",
    status: "approved",
    createdAt: "2023-11-25T10:00:00Z"
  },
  {
    id: "2",
    employeeId: "2",
    type: "sick",
    startDate: "2023-11-10",
    endDate: "2023-11-12",
    reason: "Flu recovery",
    status: "approved",
    createdAt: "2023-11-09T09:15:00Z"
  },
  {
    id: "3",
    employeeId: "3",
    type: "personal",
    startDate: "2024-01-15",
    endDate: "2024-01-16",
    reason: "Family matters",
    status: "pending",
    createdAt: "2024-01-05T11:00:00Z"
  }
];

// Helper function to convert database leave to our Leave type
const convertDbLeaveToLeave = (dbLeave: any): Leave => {
  return {
    id: dbLeave.id,
    employeeId: dbLeave.employee_id || '',
    type: dbLeave.type as 'annual' | 'sick' | 'personal' | 'bereavement' | 'unpaid',
    startDate: dbLeave.start_date || '',
    endDate: dbLeave.end_date || '',
    reason: dbLeave.reason || '',
    status: dbLeave.status as 'pending' | 'approved' | 'rejected',
    createdAt: dbLeave.created_at
  };
};

// Helper function to convert our Leave type to database format
const convertLeaveToDbLeave = (leave: Omit<Leave, 'id' | 'createdAt'>) => {
  return {
    employee_id: leave.employeeId,
    type: leave.type,
    start_date: leave.startDate,
    end_date: leave.endDate,
    reason: leave.reason,
    status: leave.status
  };
};

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load initial data
  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true);
      try {
        // First try to get leaves from Supabase
        const { data: dbLeaves, error } = await supabase
          .from('leaves')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (dbLeaves && dbLeaves.length > 0) {
          // Convert DB leaves to our Leave format
          const formattedLeaves = dbLeaves.map(convertDbLeaveToLeave);
          setLeaves(formattedLeaves);
        } else {
          // Fall back to localStorage if no data in Supabase
          const storedLeaves = localStorage.getItem('ems-leaves');
          
          if (storedLeaves) {
            setLeaves(JSON.parse(storedLeaves));
          } else {
            // Use mock data for initial setup
            setLeaves(mockLeaves);
            localStorage.setItem('ems-leaves', JSON.stringify(mockLeaves));
          }
        }
      } catch (error) {
        console.error('Error fetching leaves:', error);
        toast.error('Failed to load leave data');
        
        // Fall back to localStorage
        const storedLeaves = localStorage.getItem('ems-leaves');
        if (storedLeaves) {
          setLeaves(JSON.parse(storedLeaves));
        } else {
          // Fall back to mock data if needed
          setLeaves(mockLeaves);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  // Save to localStorage whenever leaves change
  useEffect(() => {
    if (leaves.length > 0) {
      localStorage.setItem('ems-leaves', JSON.stringify(leaves));
    }
  }, [leaves]);

  const addLeave = async (leave: Omit<Leave, 'id' | 'createdAt'>) => {
    if (!user) {
      toast.error('You must be logged in to request leave');
      return;
    }
    
    try {
      // Try to add to Supabase first
      const { data: newLeave, error } = await supabase
        .from('leaves')
        .insert(convertLeaveToDbLeave(leave))
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (newLeave) {
        // Add the new leave to our state
        const formattedLeave = convertDbLeaveToLeave(newLeave);
        setLeaves(prevLeaves => [...prevLeaves, formattedLeave]);
        toast.success('Leave request submitted successfully');
      }
    } catch (error) {
      console.error('Error adding leave to Supabase:', error);
      
      // Fall back to local state only
      const now = new Date().toISOString();
      const newLeave: Leave = {
        ...leave,
        id: Date.now().toString(),
        createdAt: now
      };
      
      setLeaves(prevLeaves => [...prevLeaves, newLeave]);
      toast.success('Leave request submitted to local storage');
    }
  };

  const updateLeaveStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      // First try to update in Supabase
      const { error } = await supabase
        .from('leaves')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedLeaves = leaves.map(leave => 
        leave.id === id ? { ...leave, status } : leave
      );
      
      setLeaves(updatedLeaves);
      toast.success(`Leave request ${status}`);
    } catch (error) {
      console.error('Error updating leave:', error);
      
      // Update local state anyway
      const updatedLeaves = leaves.map(leave => 
        leave.id === id ? { ...leave, status } : leave
      );
      
      setLeaves(updatedLeaves);
      toast.success(`Leave request ${status} in local storage`);
    }
  };

  const getEmployeeLeaves = (employeeId: string) => {
    return leaves.filter(leave => leave.employeeId === employeeId);
  };

  const getAllLeaves = () => {
    return leaves;
  };

  return (
    <LeaveContext.Provider
      value={{
        leaves,
        addLeave,
        updateLeaveStatus,
        getEmployeeLeaves,
        getAllLeaves,
        loading,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeaves = () => {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeaves must be used within a LeaveProvider');
  }
  return context;
};
