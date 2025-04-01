
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { Employee } from './EmployeeContext';
import { useAuth } from './AuthContext';

export interface PerformanceRating {
  id: string;
  employeeId: string;
  managerId: string;
  rating: number; // 1-5 scale
  feedback: string;
  improvementSuggestions: string;
  createdAt: string;
  period: string; // e.g., "Q1 2023", "April 2023"
}

interface PerformanceContextProps {
  ratings: PerformanceRating[];
  loading: boolean;
  addRating: (rating: Omit<PerformanceRating, 'id' | 'createdAt' | 'managerId'>) => void;
  updateRating: (id: string, updatedRating: Partial<PerformanceRating>) => void;
  deleteRating: (id: string) => void;
  getEmployeeRatings: (employeeId: string) => PerformanceRating[];
  getLatestEmployeeRating: (employeeId: string) => PerformanceRating | undefined;
  getAverageRating: (employeeId: string) => number;
  getRatingsByPeriod: (period: string) => PerformanceRating[];
  getPeriods: () => string[];
  getDepartmentAverages: () => { department: string; average: number }[];
}

const PerformanceContext = createContext<PerformanceContextProps | undefined>(undefined);

// Mock data
const mockRatings: PerformanceRating[] = [
  {
    id: '1',
    employeeId: '3',
    managerId: '2',
    rating: 4,
    feedback: 'Robert is performing very well in the Financial Department.',
    improvementSuggestions: 'Could improve communication with other departments.',
    createdAt: '2023-07-15',
    period: 'Q2 2023',
  },
  {
    id: '2',
    employeeId: '5',
    managerId: '2',
    rating: 3,
    feedback: 'Michael is meeting expectations in the Service Center.',
    improvementSuggestions: 'Work on technical skills and customer interactions.',
    createdAt: '2023-07-16',
    period: 'Q2 2023',
  },
];

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ratings, setRatings] = useState<PerformanceRating[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load initial data
  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true);
      try {
        const storedRatings = localStorage.getItem('ems-ratings');
        if (storedRatings) {
          setRatings(JSON.parse(storedRatings));
        } else {
          setRatings(mockRatings);
          localStorage.setItem('ems-ratings', JSON.stringify(mockRatings));
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
        toast.error('Failed to load performance data');
        setRatings(mockRatings);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  // Save to localStorage whenever ratings change
  useEffect(() => {
    if (ratings.length > 0) {
      localStorage.setItem('ems-ratings', JSON.stringify(ratings));
    }
  }, [ratings]);

  const addRating = (rating: Omit<PerformanceRating, 'id' | 'createdAt' | 'managerId'>) => {
    if (!user) {
      toast.error('You must be logged in to add ratings');
      return;
    }

    const newRating: PerformanceRating = {
      ...rating,
      id: Date.now().toString(),
      managerId: user.id,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      setRatings(prev => [...prev, newRating]);
      toast.success('Performance rating added successfully');
    } catch (error) {
      console.error('Error adding rating:', error);
      toast.error('Failed to add performance rating');
    }
  };

  const updateRating = (id: string, updatedRating: Partial<PerformanceRating>) => {
    try {
      const updatedRatings = ratings.map(rating => 
        rating.id === id ? { ...rating, ...updatedRating } : rating
      );
      
      setRatings(updatedRatings);
      toast.success('Performance rating updated');
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Failed to update performance rating');
    }
  };

  const deleteRating = (id: string) => {
    try {
      const filteredRatings = ratings.filter(rating => rating.id !== id);
      setRatings(filteredRatings);
      toast.success('Performance rating deleted');
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error('Failed to delete performance rating');
    }
  };

  const getEmployeeRatings = (employeeId: string) => {
    return ratings.filter(rating => rating.employeeId === employeeId);
  };

  const getLatestEmployeeRating = (employeeId: string) => {
    const employeeRatings = getEmployeeRatings(employeeId);
    if (employeeRatings.length === 0) return undefined;
    
    return employeeRatings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  const getAverageRating = (employeeId: string) => {
    const employeeRatings = getEmployeeRatings(employeeId);
    if (employeeRatings.length === 0) return 0;
    
    const sum = employeeRatings.reduce((total, rating) => total + rating.rating, 0);
    return parseFloat((sum / employeeRatings.length).toFixed(1));
  };

  const getRatingsByPeriod = (period: string) => {
    return ratings.filter(rating => rating.period === period);
  };

  const getPeriods = () => {
    const periods = ratings.map(rating => rating.period);
    return Array.from(new Set(periods));
  };

  const getDepartmentAverages = () => {
    // This would typically require joining with employee data
    // For now, we'll return a mock result
    return [
      { department: 'Financial Department', average: 4.0 },
      { department: 'Marketing Department', average: 3.7 },
      { department: 'Service Center Department', average: 3.2 },
      { department: 'Administrative Department', average: 4.2 },
    ];
  };

  return (
    <PerformanceContext.Provider
      value={{
        ratings,
        loading,
        addRating,
        updateRating,
        deleteRating,
        getEmployeeRatings,
        getLatestEmployeeRating,
        getAverageRating,
        getRatingsByPeriod,
        getPeriods,
        getDepartmentAverages,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};
