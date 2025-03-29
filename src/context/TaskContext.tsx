
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { Task } from '@/components/TaskSlip';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';

interface TaskContextProps {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getEmployeeTasks: (employeeId: string) => Task[];
  getAssignedTasks: (assignedById: string) => Task[];
  loading: boolean;
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

// Mock tasks for development
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete quarterly report",
    description: "Prepare and submit the Q3 financial analysis report",
    assignedTo: "3", // Employee ID
    assignedBy: "2", // Manager ID
    dueDate: "2023-10-15",
    priority: "high",
    status: "in_progress",
    createdAt: "2023-09-28T10:00:00Z",
    updatedAt: "2023-10-01T14:30:00Z"
  },
  {
    id: "2",
    title: "Update client database",
    description: "Ensure all client information is current and accurate",
    assignedTo: "3", // Employee ID
    assignedBy: "1", // Admin ID
    dueDate: "2023-10-10",
    priority: "medium",
    status: "pending",
    createdAt: "2023-09-30T09:15:00Z",
    updatedAt: "2023-09-30T09:15:00Z"
  },
  {
    id: "3",
    title: "Prepare training materials",
    description: "Create materials for the new employee onboarding next month",
    assignedTo: "2", // Manager ID
    assignedBy: "1", // Admin ID
    dueDate: "2023-10-25",
    priority: "low",
    status: "pending",
    createdAt: "2023-10-01T11:00:00Z",
    updatedAt: "2023-10-01T11:00:00Z"
  }
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load initial data
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('tasks')
          .select('*');
        
        if (error) {
          console.error('Error fetching from Supabase:', error);
          // Fall back to localStorage
          const storedTasks = localStorage.getItem('ems-tasks');
          
          if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
          } else {
            // Use mock data for initial setup
            setTasks(mockTasks);
            localStorage.setItem('ems-tasks', JSON.stringify(mockTasks));
          }
        } else if (data && data.length > 0) {
          setTasks(data as Task[]);
        } else {
          // No data in Supabase, use mock data
          setTasks(mockTasks);
          // Store in Supabase
          const { error: insertError } = await supabase
            .from('tasks')
            .insert(mockTasks);
            
          if (insertError) {
            console.error('Error inserting mock data to Supabase:', insertError);
          }
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load task data');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Save to localStorage and Supabase whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('ems-tasks', JSON.stringify(tasks));
      
      // Update in Supabase - in a real app, you'd handle this differently for updates
      // This is simplified for the example
      const updateSupabase = async () => {
        try {
          // Clear and reinsert for simplicity
          await supabase.from('tasks').delete().neq('id', '0');
          const { error } = await supabase.from('tasks').insert(tasks);
          if (error) console.error('Error updating Supabase:', error);
        } catch (error) {
          console.error('Error saving to Supabase:', error);
        }
      };
      
      updateSupabase();
    }
  }, [tasks]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast.error('You must be logged in to add tasks');
      return;
    }
    
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([newTask]);
        
      if (error) throw error;
      
      setTasks(prev => [...prev, newTask]);
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
      
      // Fallback to local state if Supabase fails
      setTasks(prev => [...prev, newTask]);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        )
      );
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      
      // Fallback to local state if Supabase fails
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        )
      );
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      
      // Fallback to local state if Supabase fails
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  };

  const getEmployeeTasks = (employeeId: string) => {
    return tasks.filter(task => task.assignedTo === employeeId);
  };

  const getAssignedTasks = (assignedById: string) => {
    return tasks.filter(task => task.assignedBy === assignedById);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        getEmployeeTasks,
        getAssignedTasks,
        loading,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
