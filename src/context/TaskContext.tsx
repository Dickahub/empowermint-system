
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { Task } from '@/components/TaskSlip';
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
        // Using localStorage for now until we set up the Supabase table
        const storedTasks = localStorage.getItem('ems-tasks');
        
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          // Use mock data for initial setup
          setTasks(mockTasks);
          localStorage.setItem('ems-tasks', JSON.stringify(mockTasks));
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load task data');
        
        // Fall back to mock data if needed
        setTasks(mockTasks);
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
    
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    try {
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('ems-tasks', JSON.stringify(updatedTasks));
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
      );
      
      setTasks(updatedTasks);
      localStorage.setItem('ems-tasks', JSON.stringify(updatedTasks));
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const filteredTasks = tasks.filter(task => task.id !== id);
      setTasks(filteredTasks);
      localStorage.setItem('ems-tasks', JSON.stringify(filteredTasks));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
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
