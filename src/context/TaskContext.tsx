
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { Task } from '@/components/TaskSlip';
import { useAuth } from './AuthContext';
import { supabase } from "@/integrations/supabase/client";

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

// Helper function to convert database task to our Task type
const convertDbTaskToTask = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    assignedTo: dbTask.assigned_to || '',
    assignedBy: dbTask.assigned_by || '',
    dueDate: dbTask.due_date || '',
    priority: dbTask.priority as "low" | "medium" | "high",
    status: dbTask.status as "pending" | "in_progress" | "completed" | "cancelled",
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at
  };
};

// Helper function to convert our Task type to database format
const convertTaskToDbTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  return {
    title: task.title,
    description: task.description,
    assigned_to: task.assignedTo,
    assigned_by: task.assignedBy,
    due_date: task.dueDate,
    priority: task.priority,
    status: task.status
  };
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load initial data
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // First try to get tasks from Supabase
        const { data: dbTasks, error } = await supabase
          .from('tasks')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (dbTasks && dbTasks.length > 0) {
          // Convert DB tasks to our Task format
          const formattedTasks = dbTasks.map(convertDbTaskToTask);
          setTasks(formattedTasks);
        } else {
          // Fall back to localStorage if no data in Supabase
          const storedTasks = localStorage.getItem('ems-tasks');
          
          if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
          } else {
            // Use mock data for initial setup
            setTasks(mockTasks);
            localStorage.setItem('ems-tasks', JSON.stringify(mockTasks));
          }
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load task data');
        
        // Fall back to localStorage
        const storedTasks = localStorage.getItem('ems-tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          // Fall back to mock data if needed
          setTasks(mockTasks);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('ems-tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast.error('You must be logged in to add tasks');
      return;
    }
    
    try {
      // Try to add to Supabase first
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert(convertTaskToDbTask(task))
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (newTask) {
        // Add the new task to our state
        const formattedTask = convertDbTaskToTask(newTask);
        setTasks(prevTasks => [...prevTasks, formattedTask]);
        toast.success('Task added successfully');
      }
    } catch (error) {
      console.error('Error adding task to Supabase:', error);
      
      // Fall back to local state only
      const now = new Date().toISOString();
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now
      };
      
      setTasks(prevTasks => [...prevTasks, newTask]);
      toast.success('Task added to local storage');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // First try to update in Supabase
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
      if (updates.assignedBy) dbUpdates.assigned_by = updates.assignedBy;
      if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.status) dbUpdates.status = updates.status;
      
      dbUpdates.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
      );
      
      setTasks(updatedTasks);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      
      // Update local state anyway
      const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
      );
      
      setTasks(updatedTasks);
      toast.success('Task updated in local storage');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Try to delete from Supabase first
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const filteredTasks = tasks.filter(task => task.id !== id);
      setTasks(filteredTasks);
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // Update local state anyway
      const filteredTasks = tasks.filter(task => task.id !== id);
      setTasks(filteredTasks);
      toast.success('Task removed from local storage');
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
